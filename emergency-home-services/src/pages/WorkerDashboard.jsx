import React, { useEffect, useState } from "react";
import "./WorkerDashboard.css";

const API_URL = "https://emergency-home-services-api.onrender.com";

export default function WorkerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [locationStatus, setLocationStatus] = useState(
    "Getting your location..."
  );
  const [processingId, setProcessingId] = useState(null);

  // ==============================
  // GET LOGGED-IN WORKER
  // ==============================

  const workerId = localStorage.getItem("workerId");
  const workerName = localStorage.getItem("workerName");

  // ==============================
  // Haversine Distance
  // ==============================

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
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

  // ==============================
  // SAVE WORKER GPS LOCATION
  // ==============================

  useEffect(() => {
    if (!workerId) {
      setLocationStatus(
        "Worker ID not found. Please login again."
      );
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus(
        "GPS is not supported by this browser."
      );
      return;
    }

    setLocationStatus(
      "Requesting GPS permission..."
    );

    const watchId =
      navigator.geolocation.watchPosition(
        async (position) => {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          try {
            const response = await fetch(
              `${API_URL}/workers/${workerId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  latitude,
                  longitude,
                  location: {
                    latitude,
                    longitude,
                  },
                  online: true,
                  locationUpdatedAt:
                    new Date().toISOString(),
                }),
              }
            );

            if (!response.ok) {
              throw new Error(
                "Unable to update worker location."
              );
            }

            setLocationStatus(
              "🟢 Location sharing active"
            );

            console.log(
              "Worker location updated:",
              latitude,
              longitude
            );
          } catch (error) {
            console.error(
              "Error updating worker location:",
              error
            );

            setLocationStatus(
              "Unable to save location."
            );
          }
        },

        (error) => {
          console.error(
            "GPS error:",
            error
          );

          if (error.code === 1) {
            setLocationStatus(
              "❌ Location permission denied."
            );
          } else if (error.code === 2) {
            setLocationStatus(
              "❌ Location unavailable."
            );
          } else if (error.code === 3) {
            setLocationStatus(
              "❌ Location request timed out."
            );
          } else {
            setLocationStatus(
              "❌ Unable to get location."
            );
          }
        },

        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, [workerId]);

  // ==============================
  // GET WORKER BOOKINGS
  // ==============================

  useEffect(() => {
    if (!workerId) {
      return;
    }

    const loadBookings = async () => {
      try {
        const response = await fetch(
          `${API_URL}/bookings`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load bookings."
          );
        }

        const data =
          await response.json();

        const workerBookings = data
          .map((booking) => ({
            ...booking,
            id: booking._id,
          }))
          .filter(
            (booking) =>
              booking.assignedWorkerId ===
                workerId &&
              [
                "Pending",
                "Accepted",
                "On the Way",
                "In Progress",
              ].includes(
                booking.status
              )
          );

        setBookings(workerBookings);
      } catch (error) {
        console.error(
          "Error loading worker requests:",
          error
        );
      }
    };

    loadBookings();

    // Poll MongoDB every 3 seconds
    const interval = setInterval(
      loadBookings,
      3000
    );

    return () =>
      clearInterval(interval);
  }, [workerId]);

  // ==============================
  // ACCEPT REQUEST
  // ==============================

  // const handleAcceptRequest = async (
  //   booking
  // ) => {
  //   setProcessingId(booking.id);

  //   try {
  //     // Update booking
  //     const bookingResponse =
  //       await fetch(
  //         `${API_URL}/bookings/${booking.id}`,
  //         {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type":
  //               "application/json",
  //           },
  //           body: JSON.stringify({
  //             status: "Accepted",
  //             acceptedAt:
  //               new Date().toISOString(),
  //             assignedWorker:
  //               workerName,
  //             assignedWorkerId:
  //               workerId,
  //           }),
  //         }
  //       );

  //     const bookingData =
  //       await bookingResponse.json();

  //     if (!bookingResponse.ok) {
  //       throw new Error(
  //         bookingData.message ||
  //           "Unable to accept request."
  //       );
  //     }

  //     // Worker becomes busy
  //     const workerResponse =
  //       await fetch(
  //         `${API_URL}/workers/${workerId}`,
  //         {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type":
  //               "application/json",
  //           },
  //           body: JSON.stringify({
  //             available: false,
  //           }),
  //         }
  //       );

  //     if (!workerResponse.ok) {
  //       console.warn(
  //         "Worker availability update failed."
  //       );
  //     }

  //     alert(
  //       "✅ Request accepted successfully!"
  //     );
  //   } catch (error) {
  //     console.error(
  //       "Error accepting request:",
  //       error
  //     );

  //     alert(
  //       "Unable to accept the request."
  //     );
  //   } finally {
  //     setProcessingId(null);
  //   }
  // };


const handleAcceptRequest = async (booking) => {
  const bookingId = booking._id || booking.id;

  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Unable to accept this request.");
      return;
    }

    alert("Request accepted successfully!");
    // Existing 3-second booking refresh will update the dashboard.
  } catch (error) {
    console.error("Accept error:", error);
    alert("Unable to accept request. Please try again.");
  }
};


  // ==============================
  // FIND NEXT AVAILABLE WORKER
  // ==============================

  const findNextWorker = async (
    booking
  ) => {
    try {
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

      const rejectedIds =
        booking.rejectedWorkerIds || [];

      const customerLatitude =
        Number(
          booking.customerLatitude
        );

      const customerLongitude =
        Number(
          booking.customerLongitude
        );

      if (
        !Number.isFinite(
          customerLatitude
        ) ||
        !Number.isFinite(
          customerLongitude
        )
      ) {
        return null;
      }

      const candidates =
        workerList
          .filter((worker) => {
            const sameService =
              String(
                worker.service || ""
              )
                .trim()
                .toLowerCase() ===
              String(
                booking.service || ""
              )
                .trim()
                .toLowerCase();

            const available =
              worker.available === true;

            const online =
              worker.online === true;

            const validLocation =
              Number.isFinite(
                Number(worker.latitude)
              ) &&
              Number.isFinite(
                Number(worker.longitude)
              );

            const notRejected =
              !rejectedIds.includes(
                worker._id
              );

            const notCurrentWorker =
              worker._id !== workerId;

            return (
              sameService &&
              available &&
              online &&
              validLocation &&
              notRejected &&
              notCurrentWorker
            );
          })
          .map((worker) => {
            const distance =
              calculateDistance(
                customerLatitude,
                customerLongitude,
                Number(worker.latitude),
                Number(worker.longitude)
              );

            return {
              ...worker,
              distance,
            };
          })
          .sort(
            (a, b) =>
              a.distance - b.distance
          );

      return candidates.length > 0
        ? candidates[0]
        : null;
    } catch (error) {
      console.error(
        "Error finding next worker:",
        error
      );

      return null;
    }
  };

  // ==============================
  // REJECT + AUTO REASSIGN
  // ==============================

  // const handleRejectRequest = async (
  //   booking
  // ) => {
  //   setProcessingId(booking.id);

  //   try {
  //     const oldRejectedIds =
  //       booking.rejectedWorkerIds || [];

  //     const updatedRejectedIds = [
  //       ...oldRejectedIds,
  //       workerId,
  //     ];

  //     const nextWorker =
  //       await findNextWorker({
  //         ...booking,
  //         rejectedWorkerIds:
  //           updatedRejectedIds,
  //       });

  //     if (nextWorker) {
  //       const response =
  //         await fetch(
  //           `${API_URL}/bookings/${booking.id}`,
  //           {
  //             method: "PUT",
  //             headers: {
  //               "Content-Type":
  //                 "application/json",
  //             },
  //             body: JSON.stringify({
  //               status: "Pending",

  //               assignedWorker:
  //                 nextWorker.name,

  //               assignedWorkerId:
  //                 nextWorker._id,

  //               assignedWorkerPhone:
  //                 nextWorker.phone ||
  //                 nextWorker.Phone ||
  //                 "",

  //               assignedService:
  //                 nextWorker.service,

  //               workerDistance:
  //                 Number(
  //                   nextWorker.distance.toFixed(
  //                     2
  //                   )
  //                 ),

  //               rejectedWorkerIds:
  //                 updatedRejectedIds,

  //               rejectedWorkerId:
  //                 workerId,

  //               rejectedWorkerName:
  //                 workerName,

  //               reassignedAt:
  //                 new Date().toISOString(),

  //               dispatchAttempts:
  //                 (booking.dispatchAttempts ||
  //                   1) + 1,
  //             }),
  //           }
  //         );

  //       const data =
  //         await response.json();

  //       if (!response.ok) {
  //         throw new Error(
  //           data.message ||
  //             "Unable to reassign request."
  //         );
  //       }

  //       alert(
  //         `🔄 Request reassigned to ${nextWorker.name}.`
  //       );
  //     } else {
  //       const response =
  //         await fetch(
  //           `${API_URL}/bookings/${booking.id}`,
  //           {
  //             method: "PUT",
  //             headers: {
  //               "Content-Type":
  //                 "application/json",
  //             },
  //             body: JSON.stringify({
  //               status: "Rejected",

  //               rejectedWorkerIds:
  //                 updatedRejectedIds,

  //               rejectedWorkerId:
  //                 workerId,

  //               rejectedWorkerName:
  //                 workerName,

  //               reassignmentFailed: true,

  //               rejectedAt:
  //                 new Date().toISOString(),
  //             }),
  //           }
  //         );

  //       const data =
  //         await response.json();

  //       if (!response.ok) {
  //         throw new Error(
  //           data.message ||
  //             "Unable to reject request."
  //         );
  //       }

  //       alert(
  //         "❌ No other available worker found."
  //       );
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error rejecting request:",
  //       error
  //     );

  //     alert(
  //       "Unable to reject the request."
  //     );
  //   } finally {
  //     setProcessingId(null);
  //   }
  // };


const handleRejectRequest = async (booking) => {
  const bookingId = booking._id || booking.id;

  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Unable to reject this request.");
      return;
    }

    if (data.assignedWorkerId) {
      alert("Request rejected. It has been offered to the next worker.");
    } else {
      alert("Request rejected. It remains Pending until a worker is available.");
    }
  } catch (error) {
    console.error("Reject error:", error);
    alert("Unable to reject request. Please try again.");
  }
};


  // ==============================
  // UPDATE STATUS
  // ==============================

  const handleStatusUpdate = async (
    booking,
    newStatus
  ) => {
    setProcessingId(booking.id);

    try {
      const updateData = {
        status: newStatus,
      };

      if (newStatus === "On the Way") {
        updateData.onTheWayAt =
          new Date().toISOString();
      }

      if (newStatus === "In Progress") {
        updateData.inProgressAt =
          new Date().toISOString();
      }

      if (newStatus === "Completed") {
        updateData.completedAt =
          new Date().toISOString();
      }

      const response =
        await fetch(
          `${API_URL}/bookings/${booking.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              updateData
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update job status."
        );
      }

      // Worker becomes available after completion
      if (newStatus === "Completed") {
        const workerResponse =
          await fetch(
            `${API_URL}/workers/${workerId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                available: true,
              }),
            }
          );

        if (!workerResponse.ok) {
          console.warn(
            "Worker availability update failed."
          );
        }

        alert(
          "✅ Work completed successfully!"
        );
      }
    } catch (error) {
      console.error(
        "Error updating status:",
        error
      );

      alert(
        "Unable to update job status."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==============================
  // NO WORKER ID
  // ==============================

  if (!workerId) {
    return (
      <div className="worker-dashboard">
        <h1>Worker Dashboard</h1>

        <p>
          Worker login information not found.
        </p>

        <p>
          Please logout and login again.
        </p>
      </div>
    );
  }

  // ==============================
  // SEPARATE BOOKINGS
  // ==============================

  const pendingRequests =
    bookings.filter(
      (booking) =>
        booking.status === "Pending"
    );

  const activeBookings =
    bookings.filter((booking) =>
      [
        "Accepted",
        "On the Way",
        "In Progress",
      ].includes(booking.status)
    );

  // ==============================
  // STATUS BUTTON
  // ==============================

  const getActionButton = (
    booking
  ) => {
    if (
      booking.status === "Accepted"
    ) {
      return (
        <button
          className="complete-btn"
          onClick={() =>
            handleStatusUpdate(
              booking,
              "On the Way"
            )
          }
          disabled={
            processingId === booking.id
          }
        >
          {processingId === booking.id
            ? "Processing..."
            : "🚗 On the Way"}
        </button>
      );
    }

    if (
      booking.status === "On the Way"
    ) {
      return (
        <button
          className="complete-btn"
          onClick={() =>
            handleStatusUpdate(
              booking,
              "In Progress"
            )
          }
          disabled={
            processingId === booking.id
          }
        >
          {processingId === booking.id
            ? "Processing..."
            : "🔧 Start Work"}
        </button>
      );
    }

    if (
      booking.status === "In Progress"
    ) {
      return (
        <button
          className="complete-btn"
          onClick={() =>
            handleStatusUpdate(
              booking,
              "Completed"
            )
          }
          disabled={
            processingId === booking.id
          }
        >
          {processingId === booking.id
            ? "Processing..."
            : "✅ Complete Work"}
        </button>
      );
    }

    return null;
  };

  // ==============================
  // UI
  // ==============================

  return (
    <div className="worker-dashboard">
      <h1>
        👨‍🔧 Worker Dashboard
      </h1>

      <p className="worker-subtitle">
        Welcome,{" "}
        {workerName || "Worker"}
      </p>

      {/* GPS STATUS */}

      <div
        style={{
          marginBottom: "20px",
          padding: "12px",
          background: "#f1f5f9",
          borderRadius: "8px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        📍 {locationStatus}
      </div>

      {/* ==============================
          NEW REQUESTS
      ============================== */}

      <h2
        style={{
          marginTop: "20px",
          marginBottom: "15px",
        }}
      >
        🚨 New Service Requests
      </h2>

      {pendingRequests.length === 0 ? (
        <div
          style={{
            padding: "20px",
            background: "#f8fafc",
            borderRadius: "8px",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          No new service requests
        </div>
      ) : (
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          {pendingRequests.map(
            (booking) => (
              <div
                key={booking.id}
                style={{
                  padding: "18px",
                  marginBottom: "15px",
                  background: "#fff",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "10px",
                  boxShadow:
                    "0 2px 6px rgba(0,0,0,0.08)",
                }}
              >
                <h3>
                  🚨 New Request
                </h3>

                <p>
                  <strong>
                    Customer:
                  </strong>{" "}
                  {booking.name ||
                    booking.customerName ||
                    "-"}
                </p>

                <p>
                  <strong>
                    Phone:
                  </strong>{" "}
                  {booking.phone ||
                    "-"}
                </p>

                <p>
                  <strong>
                    Service:
                  </strong>{" "}
                  {booking.service ||
                    "-"}
                </p>

                <p>
                  <strong>
                    Address:
                  </strong>{" "}
                  {booking.address ||
                    "-"}
                </p>

                {booking.workerDistance !==
                  undefined &&
                  booking.workerDistance !==
                    null && (
                    <p>
                      <strong>
                        Distance:
                      </strong>{" "}
                      {
                        booking.workerDistance
                      }{" "}
                      km
                    </p>
                  )}

                <p>
                  <strong>
                    Priority:
                  </strong>{" "}
                  {booking.priority ||
                    "Emergency"}
                </p>

                {booking.notes && (
                  <p>
                    <strong>
                      Notes:
                    </strong>{" "}
                    {booking.notes}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    onClick={() =>
                      handleAcceptRequest(
                        booking
                      )
                    }
                    disabled={
                      processingId ===
                      booking.id
                    }
                    style={{
                      padding:
                        "10px 18px",
                      background:
                        "#16a34a",
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
                    {processingId ===
                    booking.id
                      ? "Processing..."
                      : "✅ Accept Request"}
                  </button>

                  <button
                    onClick={() =>
                      handleRejectRequest(
                        booking
                      )
                    }
                    disabled={
                      processingId ===
                      booking.id
                    }
                    style={{
                      padding:
                        "10px 18px",
                      background:
                        "#dc2626",
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
                    {processingId ===
                    booking.id
                      ? "Processing..."
                      : "❌ Reject"}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ==============================
          ACTIVE WORKS
      ============================== */}

      <h2
        style={{
          marginBottom: "15px",
        }}
      >
        🔧 Active Works
      </h2>

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Address</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {activeBookings.length ===
            0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="no-bookings"
                >
                  No active works
                </td>
              </tr>
            ) : (
              activeBookings.map(
                (booking) => (
                  <tr
                    key={booking.id}
                  >
                    <td>
                      {booking.name ||
                        booking.customerName ||
                        "-"}
                    </td>

                    <td>
                      {booking.phone ||
                        "-"}
                    </td>

                    <td>
                      {booking.service ||
                        "-"}
                    </td>

                    <td>
                      {booking.address ||
                        "-"}
                    </td>

                    <td>
                      <span
                        className={
                          booking.status ===
                          "Accepted"
                            ? "status-assigned"
                            : ""
                        }
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td>
                      {getActionButton(
                        booking
                      )}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}