import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "./BookingForm.css";

const API_URL = "https://emergency-home-services-api.onrender.com";

// ==========================================
// DISTANCE CALCULATION - HAVERSINE FORMULA
// ==========================================

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};
function RecenterMap({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [map, latitude, longitude]);

  return null;
}


function FitRouteBounds({ routeCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates.length > 1) {
      map.fitBounds(routeCoordinates, {
        padding: [30, 30],
      });
    }
  }, [map, routeCoordinates]);

  return null;
}


export default function BookingForm() {
  const [trackedWorker, setTrackedWorker] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeError, setRouteError] = useState("");
  // ==========================================
  // GET SERVICE FROM URL
  // ==========================================

  const [searchParams] = useSearchParams();

  const selectedService =
    searchParams.get("service") || "";

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: selectedService,
    address: "",
    date: "",
    notes: "",
  });

  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] = useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [customerLocation, setCustomerLocation] =
    useState(null);

  const [error, setError] = useState("");

  const [bookingId, setBookingId] =
    useState(null);

  const [bookingStatus, setBookingStatus] =
    useState(null);

  const [bookingData, setBookingData] =
    useState(null);
  
  const [trackingError, setTrackingError] = useState(""); 

  // ==========================================
  // REVIEW STATES
  // ==========================================

  const [rating, setRating] = useState(0);

  const [review, setReview] = useState("");

  const [reviewSubmitted, setReviewSubmitted] =
    useState(false);

  // ==========================================
  // MONGODB BOOKING STATUS POLLING
  // ==========================================

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    const loadBooking = async () => {
      try {
        const response = await fetch(
          `${API_URL}/bookings/${bookingId}`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setBookingData(data);

        setBookingStatus(
          data.status || "Pending"
        );

        if (data.rating) {
          setRating(data.rating);
        }

        if (data.review) {
          setReview(data.review);
        }

        if (data.rating || data.review) {
          setReviewSubmitted(true);
        }
      } catch (err) {
        console.error(
          "Booking status error:",
          err
        );
      }
    };

    loadBooking();

    const interval = setInterval(
      loadBooking,
      3000
    );

    return () => clearInterval(interval);
  }, [bookingId]);


  // LIVE WORKER LOCATION TRACKING
  useEffect(() => {
    const workerId = bookingData?.assignedWorkerId;

    if (!workerId || bookingStatus !== "On the Way") {
      setTrackedWorker(null);
      setTrackingError("");
      setRouteCoordinates([]);
      setRouteError("");
      return;
    }

    let cancelled = false;

    const loadWorkerLocation = async () => {
      try {
        const response = await fetch(
          `${API_URL}/workers/${workerId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load worker location.");
        }

        const worker = await response.json();

        if (cancelled) return;

        if (
          typeof worker.latitude === "number" &&
          typeof worker.longitude === "number"
        ) {
          setTrackedWorker(worker);
          setTrackingError("");
        } else {
          setTrackedWorker(null);
          setTrackingError(
            "Worker location is not available yet."
          );
        }
      } catch (err) {
        if (!cancelled) {
          setTrackingError(err.message);
        }
      }
    };

    loadWorkerLocation();

    const interval = setInterval(loadWorkerLocation, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [bookingData?.assignedWorkerId, bookingStatus]);


  // GET ROAD ROUTE FROM WORKER TO CUSTOMER
  useEffect(() => {
    const workerLat = trackedWorker?.latitude;
    const workerLon = trackedWorker?.longitude;
    const customerLat = bookingData?.customerLatitude;
    const customerLon = bookingData?.customerLongitude;

    if (
      bookingStatus !== "On the Way" ||
      typeof workerLat !== "number" ||
      typeof workerLon !== "number" ||
      typeof customerLat !== "number" ||
      typeof customerLon !== "number"
    ) {
      setRouteCoordinates([]);
      setRouteError("");
      return;
    }

    let cancelled = false;

    const loadRoute = async () => {
      try {
        const url =
          "https://router.project-osrm.org/route/v1/driving/" +
          `${workerLon},${workerLat};${customerLon},${customerLat}` +
          "?overview=full&geometries=geojson";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Unable to load road route.");
        }

        const data = await response.json();

        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error("No road route found.");
        }

        // OSRM returns [longitude, latitude].
        // Leaflet requires [latitude, longitude].
        const points = data.routes[0].geometry.coordinates.map(
          ([lon, lat]) => [lat, lon]
        );

        if (!cancelled) {
          setRouteCoordinates(points);
          setRouteError("");
        }
      } catch (err) {
        if (!cancelled) {
          setRouteCoordinates([]);
          setRouteError(
            "Road route is temporarily unavailable."
          );
        }
      }
    };

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    trackedWorker?.latitude,
    trackedWorker?.longitude,
    bookingData?.customerLatitude,
    bookingData?.customerLongitude,
    bookingStatus,
  ]);

// TEMPORARY TEST ROUTE: KOCHI TO ALUVA
// useEffect(() => {
//   if (bookingStatus !== "On the Way") {
//     setRouteCoordinates([]);
//     setRouteError("");
//     return;
//   }

//   let cancelled = false;

//   const loadTestRoute = async () => {
//     try {
//       // Test Worker: Kochi
//       const workerLat = 9.9816;
//       const workerLon = 76.2999;

//       // Test Customer: Aluva
//       const customerLat = 10.1076;
//       const customerLon = 76.3457;

//       const url =
//         "https://router.project-osrm.org/route/v1/driving/" +
//         `${workerLon},${workerLat};${customerLon},${customerLat}` +
//         "?overview=full&geometries=geojson";

//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error("Unable to load road route.");
//       }

//       const data = await response.json();

//       if (data.code !== "Ok" || !data.routes?.length) {
//         throw new Error("No road route found.");
//       }

//       const points = data.routes[0].geometry.coordinates.map(
//         ([lon, lat]) => [lat, lon]
//       );

//       if (!cancelled) {
//         setRouteCoordinates(points);
//         setRouteError("");
//       }
//     } catch (err) {
//       if (!cancelled) {
//         setRouteCoordinates([]);
//         setRouteError(
//           "Road route is temporarily unavailable."
//         );
//       }
//     }
//   };

//   loadTestRoute();

//   return () => {
//     cancelled = true;
//   };
// }, [bookingStatus]);



  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // ==========================================
  // GET CUSTOMER GPS LOCATION
  // ==========================================

  const getCustomerLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const message =
          "Geolocation is not supported by this browser.";

        setError(message);

        reject(new Error(message));

        return;
      }

      setLocationLoading(true);
      setError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,
          };

          setCustomerLocation(location);

          setLocationLoading(false);

          resolve(location);
        },

        (err) => {
          setLocationLoading(false);

          let message =
            "Unable to get your location.";

          if (err.code === 1) {
            message =
              "Location permission denied. Please allow location access.";
          } else if (err.code === 2) {
            message =
              "Your location is currently unavailable.";
          } else if (err.code === 3) {
            message =
              "Location request timed out. Please try again.";
          }

          setError(message);

          reject(new Error(message));
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  };

  // ==========================================
  // FIND NEAREST AVAILABLE WORKER
  // ==========================================

  const findNearestWorker = async (
    location,
    service
  ) => {
    const response = await fetch(
      `${API_URL}/workers`
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load workers."
      );
    }

    const workerList =
      await response.json();

    const availableWorkers =
      workerList
        .filter((worker) => {
          const workerService =
            (worker.service || "")
              .trim()
              .toLowerCase();

          const requestedService =
            (service || "")
              .trim()
              .toLowerCase();

          const hasLocation =
            typeof worker.latitude ===
              "number" &&
            typeof worker.longitude ===
              "number";

          return (
            workerService ===
              requestedService &&
            worker.available === true &&
            worker.online === true &&
            hasLocation
          );
        })
        .map((worker) => {
          const distance =
            calculateDistance(
              location.latitude,
              location.longitude,
              worker.latitude,
              worker.longitude
            );

          return {
            ...worker,
            distance,
          };
        });

    availableWorkers.sort(
      (a, b) =>
        a.distance - b.distance
    );

    if (
      availableWorkers.length === 0
    ) {
      return null;
    }

    return availableWorkers[0];
  };

  // ==========================================
  // SUBMIT EMERGENCY REQUEST
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
    ) {
      setError(
        "Please fill all required fields."
      );

      return;
    }

    try {
      setLoading(true);

      // ======================================
      // GET CUSTOMER LOCATION
      // ======================================

      let location = customerLocation;

      if (!location) {
        location =
          await getCustomerLocation();
      }

      // ======================================
      // FIND NEAREST WORKER
      // ======================================

      const nearestWorker =
        await findNearestWorker(
          location,
          formData.service
        );

      if (!nearestWorker) {
        setError(
          `No available ${formData.service} worker is currently online nearby. Please try again later.`
        );

        setLoading(false);

        return;
      }

      // ======================================
      // CREATE BOOKING
      // ======================================

      const booking = {
        ...formData,

        requestType: "Emergency",

        priority: "Emergency",

        customerLatitude:
          location.latitude,

        customerLongitude:
          location.longitude,

        assignedWorker:
          nearestWorker.name,

        assignedWorkerId:
          nearestWorker._id,

        assignedWorkerPhone:
          nearestWorker.phone ||
          nearestWorker.Phone ||
          "",

        assignedService:
          nearestWorker.service,

        workerDistance:
          Number(
            nearestWorker.distance.toFixed(
              2
            )
          ),

        status: "Pending",

        dispatchAttempts: 1,

        rejectedWorkerIds: [],
      };

      // ======================================
      // SAVE BOOKING TO MONGODB
      // ======================================

      const response = await fetch(
        `${API_URL}/bookings`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(booking),
        }
      );

      const savedBooking =
        await response.json();

      if (!response.ok) {
        throw new Error(
          savedBooking.message ||
            "Failed to create booking."
        );
      }

      // ======================================
      // SAVE BOOKING ID
      // ======================================

      setBookingId(
        savedBooking._id
      );

      setBookingStatus(
        savedBooking.status ||
          "Pending"
      );

      setBookingData(
        savedBooking
      );

      // ======================================
      // CLEAR FORM
      // ======================================

      setFormData({
        name: "",
        phone: "",
        service: selectedService,
        address: "",
        date: "",
        notes: "",
      });

      setCustomerLocation(null);

      setLoading(false);
    } catch (err) {
      console.error(
        "Booking failed:",
        err
      );

      setError(
        err.message ||
          "Unable to send emergency request. Please try again."
      );

      setLoading(false);
    }
  };

  // ==========================================
  // SUBMIT CUSTOMER REVIEW
  // ==========================================

  const handleReviewSubmit =
    async () => {
      if (!bookingId) {
        return;
      }

      if (rating < 1 || rating > 5) {
        setError(
          "Please select a rating from 1 to 5 stars."
        );

        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/bookings/${bookingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              rating: rating,

              review: review.trim(),

              reviewedAt:
                new Date().toISOString(),
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to submit review."
          );
        }

        setReviewSubmitted(true);

        setError("");

        setBookingData(data);
      } catch (err) {
        console.error(
          "Review submission failed:",
          err
        );

        setError(
          "Unable to submit review."
        );
      }
    };

  // ==========================================
  // STATUS SCREEN
  // ==========================================

  const renderStatusScreen = () => {
    if (!bookingId) {
      return null;
    }

    const workerName =
      bookingData?.assignedWorker ||
      "Worker";

    const workerPhone =
      bookingData?.assignedWorkerPhone ||
      "";

    const service =
      bookingData?.assignedService ||
      bookingData?.service ||
      "";

    const distance =
      bookingData?.workerDistance;

    // ========================================
    // PENDING
    // ========================================

    if (bookingStatus === "Pending") {
      return (
        <div
          style={{
            marginTop: "25px",
            padding: "25px",
            borderRadius: "12px",
            background: "#fef3c7",
            textAlign: "center",
          }}
        >
          <h2>
            ⏳ Emergency Request Sent
          </h2>

          <p>
            Your request has been
            automatically assigned to the
            nearest available worker.
          </p>

          <p>
            👨‍🔧{" "}
            <strong>
              {workerName}
            </strong>
          </p>

          <p>
            🔧 Service:{" "}
            <strong>
              {service}
            </strong>
          </p>

          {distance !==
            undefined &&
            distance !== null && (
              <p>
                📍 Distance:{" "}
                <strong>
                  {distance} km
                </strong>
              </p>
            )}

          <p>
            Waiting for the worker to
            accept your request...
          </p>
        </div>
      );
    }

    // ========================================
    // ACCEPTED
    // ========================================

    if (
      bookingStatus === "Accepted"
    ) {
      return (
        <div
          style={{
            marginTop: "25px",
            padding: "25px",
            borderRadius: "12px",
            background: "#dcfce7",
            textAlign: "center",
          }}
        >
          <h2>
            ✅ Request Accepted
          </h2>

          <p>
            Your service request has
            been accepted by the worker.
          </p>

          <p>
            👨‍🔧 Worker:{" "}
            <strong>
              {workerName}
            </strong>
          </p>

          <p>
            🔧 Service:{" "}
            <strong>
              {service}
            </strong>
          </p>

          {workerPhone && (
            <p>
              📞 Phone:{" "}
              <a
                href={`tel:${workerPhone}`}
              >
                {workerPhone}
              </a>
            </p>
          )}

          {distance !==
            undefined &&
            distance !== null && (
              <p>
                📍 Worker Distance:{" "}
                <strong>
                  {distance} km
                </strong>
              </p>
            )}

          <p>
            The worker will start the
            service shortly.
          </p>
        </div>
      );
    }

    // ========================================
    // ON THE WAY
    // ========================================

    if (
      bookingStatus === "On the Way"
    ) {
      return (
        <div
          style={{
            marginTop: "25px",
            padding: "25px",
            borderRadius: "12px",
            background: "#e0f2fe",
            textAlign: "center",
          }}
        >
          <h2>
            🚗 Worker Is On the Way
          </h2>

          <p>
            <strong>
              {workerName}
            </strong>{" "}
            is travelling to your location.
          </p>

          {workerPhone && (
            <p>
              📞{" "}
              <a
                href={`tel:${workerPhone}`}
              >
                Call Worker
              </a>
            </p>
          )}

          <p>
            Please keep your phone available.
          </p>
          <div
            style={{
              marginTop: "20px",
              textAlign: "left",
            }}
          >
            <h3>📍 Live Worker Tracking</h3>

            {trackedWorker ? (
              <>
                <p>
                  Worker: <strong>{trackedWorker.name}</strong>
                </p>

                <MapContainer
                  center={[
                    trackedWorker.latitude,
                    trackedWorker.longitude,
                  ]}
                  zoom={15}
                  style={{
                    height: "350px",
                    width: "100%",
                    borderRadius: "12px",
                    zIndex: 1,
                  }}
                >
                  <RecenterMap
                    latitude={trackedWorker.latitude}
                    longitude={trackedWorker.longitude}
                  />

                  {routeCoordinates.length > 1 && (
                    <FitRouteBounds routeCoordinates={routeCoordinates} />
                  )}


                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Customer location */}
                   <Marker
                    position={[
                      bookingData.customerLatitude,
                      bookingData.customerLongitude,
                    ]}
                  >
                    <Popup>Customer Location</Popup>
                  </Marker>

                  {/* Road route */}
                  {routeCoordinates.length > 0 && (
                    <Polyline
                      positions={routeCoordinates}
                      pathOptions={{
                        color: "#2563eb",
                        weight: 5,
                        opacity: 0.8,
                      }}
                    />
                  )}
                  <Marker
                    position={[
                      trackedWorker.latitude,
                      trackedWorker.longitude,
                    ]}
                  >
                    <Popup>
                      {trackedWorker.name} — Your Worker
                    </Popup>
                  </Marker>
                                
             {/*  // Test Worker marker
                  <Marker position={[9.9816, 76.2999]}>
                    <Popup>Test Worker - Kochi</Popup>
                  </Marker>

                  // Test Customer marker
                  <Marker position={[10.1076, 76.3457]}>
                    <Popup>Test Customer - Aluva</Popup>
                  </Marker>

                  // Road route line
                  {routeCoordinates.length > 0 && (
                    <Polyline
                      positions={routeCoordinates}
                      pathOptions={{ color: "blue", weight: 5 }}
                    />
                  )} */}

                </MapContainer>
                                
                  {routeError && (
                    <p style={{ color: "red" }}>
                      {routeError}
                    </p>
                  )}


                <p style={{ color: "#15803d" }}>
                  ✓ Showing the latest worker GPS location
                </p>
              </>
            ) : (
              <p style={{ color: "#64748b" }}>
                {trackingError || "Waiting for worker GPS location..."}
              </p>
            )}
          </div>
        </div>
      );
    }

    // ========================================
    // IN PROGRESS
    // ========================================

    if (
      bookingStatus === "In Progress"
    ) {
      return (
        <div
          style={{
            marginTop: "25px",
            padding: "25px",
            borderRadius: "12px",
            background: "#ede9fe",
            textAlign: "center",
          }}
        >
          <h2>
            🔧 Service In Progress
          </h2>

          <p>
            <strong>
              {workerName}
            </strong>{" "}
            is currently working on your
            service request.
          </p>

          <p>
            Service:{" "}
            <strong>
              {service}
            </strong>
          </p>
        </div>
      );
    }

    // ========================================
    // COMPLETED
    // ========================================

    if (
      bookingStatus === "Completed"
    ) {
      return (
        <div
          style={{
            marginTop: "25px",
            padding: "25px",
            borderRadius: "12px",
            background: "#dbeafe",
            textAlign: "center",
          }}
        >
          <h2>
            🎉 Service Completed
          </h2>

          <p>
            Your emergency service has
            been completed successfully.
          </p>

          <p>
            Worker:{" "}
            <strong>
              {workerName}
            </strong>
          </p>

          {!reviewSubmitted ? (
            <div
              style={{
                marginTop: "20px",
              }}
            >
              <h3>
                ⭐ Rate Your Service
              </h3>

              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "15px",
                }}
              >
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRating(star)
                      }
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                        fontSize:
                          "30px",
                      }}
                    >
                      {star <= rating
                        ? "⭐"
                        : "☆"}
                    </button>
                  )
                )}
              </div>

              <textarea
                value={review}
                onChange={(e) =>
                  setReview(
                    e.target.value
                  )
                }
                placeholder="Write your review..."
                rows="4"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius:
                    "8px",
                  border:
                    "1px solid #cbd5e1",
                  resize: "vertical",
                }}
              />

              <button
                type="button"
                onClick={
                  handleReviewSubmit
                }
                style={{
                  marginTop: "12px",
                  padding:
                    "10px 20px",
                  background:
                    "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius:
                    "6px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "bold",
                }}
              >
                Submit Review
              </button>
            </div>
          ) : (
            <div
              style={{
                marginTop: "20px",
                color: "#15803d",
                fontWeight: "bold",
              }}
            >
              ✓ Thank you for your
              feedback!
            </div>
          )}
        </div>
      );
    }

    // ========================================
    // REJECTED
    // ========================================

    if (
      bookingStatus === "Rejected"
    ) {
      return (
        <div
          style={{
            marginTop: "25px",
            padding: "25px",
            borderRadius: "12px",
            background: "#fee2e2",
            textAlign: "center",
          }}
        >
          <h2>
            ❌ Unable to Assign Worker
          </h2>

          <p>
            The selected worker could not
            accept your request and no
            other suitable worker is
            currently available.
          </p>

          <button
            type="button"
            onClick={() => {
              setBookingId(null);
              setBookingStatus(null);
              setBookingData(null);
              setError("");
              setRating(0);
              setReview("");
              setReviewSubmitted(false);
            }}
            style={{
              marginTop: "10px",
              padding: "10px 18px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return null;
  };

  // ==========================================
  // IF BOOKING EXISTS
  // ==========================================

  if (bookingId) {
    return (
      <div
        style={{
          maxWidth: "700px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        {renderStatusScreen()}

        {error && (
          <p
            style={{
              marginTop: "15px",
              color: "#dc2626",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  // ==========================================
  // BOOKING FORM
  // ==========================================

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#1e293b",
        }}
      >
        <b>
          🚨 Emergency Home Service
        </b>
      </h2>

      <p
        style={{
          textAlign: "center",
          color: "#64748b",
          marginBottom: "25px",
        }}
      >
        Request emergency service and
        our system will automatically
        assign the nearest available
        worker.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* NAME */}

        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <label>
            Customer Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "5px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* PHONE */}

        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <label>
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            required
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "5px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* SERVICE */}

        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <label>
            Emergency Service
          </label>

          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "5px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "6px",
              background: "#fff",
            }}
          >
             <option value="">
              Select service
            </option>
            <option value="Plumbing">
              Plumbing
            </option>

            <option value="Electrical">
              Electrical
            </option>

            <option value="AC Repair">
              AC Repair
            </option>

            <option value="Appliance Repair">
              Appliance Repair
            </option>
            <option value="Carpentry">
              Carpentry</option>
            <option value="Home Painting">
              Home Painting</option>
          </select>
        </div>

        {/* DATE */}

        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <label>
            Preferred Date
          </label>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "5px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* ADDRESS */}

        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <label>
            Address
          </label>

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
            required
            rows="3"
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "5px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "6px",
              resize: "vertical",
            }}
          />
        </div>

        {/* NOTES */}

        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <label>
            Problem Description
          </label>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Describe your emergency problem"
            rows="4"
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "5px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "6px",
              resize: "vertical",
            }}
          />
        </div>

        {/* LOCATION */}

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            background: "#f8fafc",
            borderRadius: "8px",
          }}
        >
          <p
            style={{
              marginTop: 0,
              fontWeight: "bold",
            }}
          >
            📍 Customer Location
          </p>

          {customerLocation ? (
            <p
              style={{
                color: "#15803d",
              }}
            >
              ✓ Location detected successfully
            </p>
          ) : (
            <p
              style={{
                color: "#64748b",
              }}
            >
              Your location is required
              for automatic nearest-worker
              assignment.
            </p>
          )}

          <button
            type="button"
            onClick={getCustomerLocation}
            disabled={locationLoading}
            style={{
              padding: "9px 15px",
              background:
                locationLoading
                  ? "#94a3b8"
                  : "#0f766e",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor:
                locationLoading
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold",
            }}
          >
            {locationLoading
              ? "📍 Getting Location..."
              : "📍 Get My Location"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <p
            style={{
              color: "#dc2626",
              background: "#fee2e2",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontWeight: "bold",
            }}
          >
            {error}
          </p>
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={
            loading ||
            locationLoading
          }
          style={{
            width: "100%",
            padding: "13px",
            background:
              loading ||
              locationLoading
                ? "#94a3b8"
                : "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "7px",
            cursor:
              loading ||
              locationLoading
                ? "not-allowed"
                : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading
            ? "🔄 Finding Nearest Worker..."
            : "🚨 Send Emergency Request"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "12px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          The nearest available online
          worker will be selected
          automatically.
        </p>
      </form>
    </div>
  );
}