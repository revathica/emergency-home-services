import React, { useEffect, useState } from "react";

const API_URL = "https://emergency-home-services-api.onrender.com/api";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [showAddWorker, setShowAddWorker] = useState(false);

  const [editingWorker, setEditingWorker] = useState(null);

const [editWorkerName, setEditWorkerName] = useState("");
const [editWorkerService, setEditWorkerService] = useState("");
const [editWorkerPhone, setEditWorkerPhone] = useState("");
const [editWorkerAvailable, setEditWorkerAvailable] = useState(true);
const [editWorkerOnline, setEditWorkerOnline] = useState(false);

  const [workerName, setWorkerName] = useState("");
  const [workerService, setWorkerService] = useState("");
  const [workerPhone, setWorkerPhone] = useState("");
  const [contactMessages, setContactMessages] = useState([]);
  // ==============================
  // GET BOOKINGS FROM MONGODB API
  // ==============================

  const loadBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/bookings`);

      if (!response.ok) {
        throw new Error("Failed to load bookings");
      }

      const data = await response.json();

      setBookings(
        data.map((booking) => ({
          ...booking,
          id: booking._id,
        }))
      );
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };
  const loadContactMessages = async () => {
  try {
    const response = await fetch(`${API_URL}/contact`);

    if (!response.ok) {
      throw new Error("Failed to load contact messages");
    }

    const data = await response.json();
    setContactMessages(data);
  } catch (error) {
    console.error("Error loading contact messages:", error);
  }
};

const handleReadMessage = async (id) => {
  try {
    const response = await fetch(`${API_URL}/contact/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "Read" }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to update message");
    }

    await loadContactMessages();
  } catch (error) {
    alert("Failed to mark message as read: " + error.message);
  }
};

const handleDeleteMessage = async (id) => {
  if (!window.confirm("Delete this contact message?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/contact/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to delete message");
    }

    await loadContactMessages();
  } catch (error) {
    alert("Failed to delete message: " + error.message);
  }
};

  // ==============================
  // GET WORKERS FROM MONGODB API
  // ==============================

  const loadWorkers = async () => {
    try {
      const response = await fetch(`${API_URL}/workers`);

      if (!response.ok) {
        throw new Error("Failed to load workers");
      }

      const data = await response.json();

      setWorkers(
        data.map((worker) => ({
          ...worker,
          id: worker._id,
        }))
      );
    } catch (error) {
      console.error("Error loading workers:", error);
    }
  };

  // ==============================
  // LOAD DATA
  // ==============================

  useEffect(() => {
    loadBookings();
    loadWorkers();
    loadContactMessages();

    // MongoDB API does not have Firebase realtime updates.
    // Refresh data every 3 seconds.
    const interval = setInterval(() => {
      loadBookings();
      loadWorkers();
      loadContactMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ==============================
  // ADD NEW WORKER
  // ==============================

  const handleAddWorker = async (e) => {
    e.preventDefault();

    if (!workerName || !workerService || !workerPhone) {
      alert("Please fill all worker details.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/workers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workerName,
          service: workerService,
          phone: workerPhone,
          available: true,
          online: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add worker");
      }

      alert(`${workerName} added successfully!`);

      setWorkerName("");
      setWorkerService("");
      setWorkerPhone("");
      setShowAddWorker(false);

      loadWorkers();
    } catch (error) {
      console.error("Error adding worker:", error);
      alert("Failed to add worker: " + error.message);
    }
  };


const handleEditWorker = (worker) => {
  setEditingWorker(worker);
  setEditWorkerName(worker.name || "");
  setEditWorkerService(worker.service || "");
  setEditWorkerPhone(worker.phone || worker.Phone || "");
  setEditWorkerAvailable(worker.available === true);
  setEditWorkerOnline(worker.online === true);
};

const handleUpdateWorker = async (e) => {
  e.preventDefault();

  if (!editingWorker) return;

  try {
    const response = await fetch(
      `${API_URL}/workers/${editingWorker.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editWorkerName.trim(),
          service: editWorkerService,
          phone: editWorkerPhone.trim(),
          available: editWorkerAvailable,
          online: editWorkerOnline,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update worker");
    }

    alert("Worker details updated successfully!");
    setEditingWorker(null);
    await loadWorkers();
  } catch (error) {
    alert("Failed to update worker: " + error.message);
  }
};

const handleDeleteWorker = async (worker) => {
  if (
    !window.confirm(
      `Delete worker ${worker.name}? This action cannot be undone.`
    )
  ) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/workers/${worker.id}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete worker");
    }

    if (editingWorker?.id === worker.id) {
      setEditingWorker(null);
    }

    alert("Worker deleted successfully!");
    await loadWorkers();
  } catch (error) {
    alert("Failed to delete worker: " + error.message);
  }
};



  // ==============================
  // ADMIN COMPLETE JOB
  // ==============================

  const handleCompleteJob = async (booking) => {
    if (!booking.assignedWorker) {
      return;
    }

    try {
      // Update booking
      const bookingResponse = await fetch(
        `${API_URL}/bookings/${booking.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Completed",
            completedAt: new Date().toISOString(),
          }),
        }
      );

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(
          bookingData.message || "Failed to complete booking"
        );
      }

      // Make worker available again
      if (booking.assignedWorkerId) {
        const workerResponse = await fetch(
          `${API_URL}/workers/${booking.assignedWorkerId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              available: true,
            }),
          }
        );

        if (!workerResponse.ok) {
          console.warn("Worker availability update failed.");
        }
      }

      alert(
        `${booking.assignedWorker} is now available again!`
      );

      loadBookings();
      loadWorkers();
    } catch (error) {
      console.error("Complete job failed:", error);

      alert(
        "Unable to complete job: " + error.message
      );
    }
  };

  // ==============================
  // DELETE BOOKING
  // ==============================

  const handleDeleteBooking = async (booking) => {
    const confirmed = window.confirm(
      `Delete booking for ${
        booking.name ||
        booking.fullName ||
        "this customer"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      // If booking was accepted,
      // make worker available again.
      if (
        booking.assignedWorkerId &&
        (booking.status === "Accepted" ||
          booking.status === "Assigned" ||
          booking.status === "On the Way" ||
          booking.status === "In Progress")
      ) {
        await fetch(
          `${API_URL}/workers/${booking.assignedWorkerId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              available: true,
            }),
          }
        );
      }

      // Delete booking
      const response = await fetch(
        `${API_URL}/bookings/${booking.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete booking"
        );
      }

      alert("Booking deleted successfully.");

      loadBookings();
      loadWorkers();
    } catch (error) {
      console.error("Delete booking failed:", error);

      alert(
        "Unable to delete booking: " +
          error.message
      );
    }
  };

  // ==============================
  // STATUS STYLE
  // ==============================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted":
        return {
          background: "#dcfce7",
          color: "#15803d",
        };

      case "On the Way":
        return {
          background: "#e0f2fe",
          color: "#0369a1",
        };

      case "In Progress":
        return {
          background: "#ede9fe",
          color: "#7c3aed",
        };

      case "Completed":
        return {
          background: "#dbeafe",
          color: "#1d4ed8",
        };

      case "Rejected":
        return {
          background: "#fee2e2",
          color: "#dc2626",
        };

      case "Pending":
      default:
        return {
          background: "#fef3c7",
          color: "#b45309",
        };
    }
  };

  // ==============================
  // RETURN
  // ==============================

  return (
    <div
      style={{
        padding: "40px 20px",
        minHeight: "80vh",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* TITLE */}

      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "10px",
          textAlign: "center",
          color: "#1e293b",
        }}
      >
        🛠️ Admin Dashboard
      </h1>

      <h2
        style={{
          fontSize: "1.2rem",
          marginBottom: "30px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        Emergency Service Bookings
      </h2>

      {/* ==============================
          BOOKINGS
      ============================== */}

      {bookings.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            fontSize: "1.1rem",
            color: "#64748b",
          }}
        >
          No bookings available right now.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#0f172a",
                  color: "#fff",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "12px" }}>
                  Customer
                </th>

                <th style={{ padding: "12px" }}>
                  Phone
                </th>

                <th style={{ padding: "12px" }}>
                  Service
                </th>

                <th style={{ padding: "12px" }}>
                  Address
                </th>

                <th style={{ padding: "12px" }}>
                  Status
                </th>

                <th style={{ padding: "12px" }}>
                  Assigned Worker
                </th>

                <th style={{ padding: "12px" }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => {
                const statusStyle =
                  getStatusStyle(b.status);

                return (
                  <tr
                    key={b.id}
                    style={{
                      borderBottom:
                        "1px solid #e2e8f0",
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      {b.name ||
                        b.fullName ||
                        "N/A"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {b.phone || "N/A"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {b.service ||
                        b.serviceType ||
                        "N/A"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {b.address || "N/A"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: "5px",
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          background:
                            statusStyle.background,
                          color:
                            statusStyle.color,
                        }}
                      >
                        {b.status || "Pending"}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {b.assignedWorker ? (
                        <span>
                          👨‍🔧 {b.assignedWorker}
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#64748b",
                          }}
                        >
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {b.status === "Accepted" && (
                        <button
                          onClick={() =>
                            handleCompleteJob(b)
                          }
                          style={{
                            padding: "7px 12px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Complete Job
                        </button>
                      )}

                      {b.status === "Completed" && (
                        <span
                          style={{
                            color: "#15803d",
                            fontWeight: "bold",
                          }}
                        >
                          ✓ Completed
                        </span>
                      )}

                      {b.status === "Pending" && (
                        <span
                          style={{
                            color: "#b45309",
                            fontWeight: "bold",
                          }}
                        >
                          ⏳ Waiting for Worker
                        </span>
                      )}

                      {b.status === "Rejected" && (
                        <span
                          style={{
                            color: "#dc2626",
                            fontWeight: "bold",
                          }}
                        >
                          ❌ Rejected
                        </span>
                      )}

                      {b.status === "On the Way" && (
                        <span
                          style={{
                            color: "#0369a1",
                            fontWeight: "bold",
                          }}
                        >
                          🚗 On the Way
                        </span>
                      )}

                      {b.status === "In Progress" && (
                        <span
                          style={{
                            color: "#7c3aed",
                            fontWeight: "bold",
                          }}
                        >
                          🔧 In Progress
                        </span>
                      )}

                      <br />

                      <button
                        onClick={() =>
                          handleDeleteBooking(b)
                        }
                        style={{
                          marginTop: "8px",
                          padding: "7px 12px",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==============================
          WORKER MANAGEMENT
      ============================== */}

      <div style={{ marginTop: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h2
            style={{
              color: "#1e293b",
              margin: 0,
            }}
          >
            👨‍🔧 Workers
          </h2>

          <button
            onClick={() =>
              setShowAddWorker(!showAddWorker)
            }
            style={{
              padding: "10px 18px",
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {showAddWorker
              ? "✕ Close"
              : "＋ Add Worker"}
          </button>
        </div>

        {/* ADD WORKER FORM */}


        {editingWorker && (
          <form
            onSubmit={handleUpdateWorker}
            style={{
              padding: "20px",
              marginBottom: "20px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
            }}
          >
            <h3>Edit Worker Details</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <input
                value={editWorkerName}
                onChange={(e) => setEditWorkerName(e.target.value)}
                placeholder="Worker Name"
                required
                style={{ padding: "11px" }}
              />

              <select
                value={editWorkerService}
                onChange={(e) => setEditWorkerService(e.target.value)}
                required
                style={{ padding: "11px" }}
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="AC Repair">AC Repair</option>
                <option value="Appliance Repair">Appliance Repair</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Home Painting">Home Painting</option>
              </select>

              <input
                type="tel"
                value={editWorkerPhone}
                onChange={(e) => setEditWorkerPhone(e.target.value)}
                placeholder="Phone Number"
                required
                style={{ padding: "11px" }}
              />

              <label>
                <input
                  type="checkbox"
                  checked={editWorkerAvailable}
                  onChange={(e) => setEditWorkerAvailable(e.target.checked)}
                />
                {" "}Available
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editWorkerOnline}
                  onChange={(e) => setEditWorkerOnline(e.target.checked)}
                />
                {" "}Online
              </label>
            </div>

            <button
              type="submit"
              style={{
                marginTop: "15px",
                marginRight: "10px",
                padding: "10px 18px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => setEditingWorker(null)}
              style={{
                padding: "10px 18px",
                background: "#64748b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </form>
        )}


        {showAddWorker && (
          <form
            onSubmit={handleAddWorker}
            style={{
              background: "#f8fafc",
              padding: "20px",
              borderRadius: "10px",
              border:
                "1px solid #e2e8f0",
              marginBottom: "25px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#1e293b",
              }}
            >
              Add New Worker
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <input
                type="text"
                placeholder="Worker Name"
                value={workerName}
                onChange={(e) =>
                  setWorkerName(e.target.value)
                }
                required
                style={{
                  padding: "11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "15px",
                }}
              />

              <select
                value={workerService}
                onChange={(e) =>
                  setWorkerService(e.target.value)
                }
                required
                style={{
                  padding: "11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "15px",
                  background: "#fff",
                }}
              >
                <option value="">
                  Select Service
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
                  Carpentry
                </option>
                <option value="Home Painting">
                  Home Painting
                </option>
              </select>

              <input
                type="tel"
                placeholder="Phone Number"
                value={workerPhone}
                onChange={(e) =>
                  setWorkerPhone(e.target.value)
                }
                required
                style={{
                  padding: "11px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "15px",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✓ Add Worker
            </button>
          </form>
        )}

        {/* WORKERS TABLE */}

        {workers.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No workers added yet.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                boxShadow:
                  "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "12px" }}>
                    Worker
                  </th>

                  <th style={{ padding: "12px" }}>
                    Service
                  </th>

                  <th style={{ padding: "12px" }}>
                    Phone
                  </th>

                  <th style={{ padding: "12px" }}>
                    Status
                  </th>

                  <th style={{ padding: "12px" }}>
                    Online
                  </th>
                  <th style={{ padding: "12px" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {workers.map((worker) => (
                  <tr
                    key={worker.id}
                    style={{
                      borderBottom:
                        "1px solid #e2e8f0",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      👨‍🔧 {worker.name}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {worker.service}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {worker.phone ||
                        worker.Phone ||
                        "-"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {worker.available === true ? (
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            background: "#dcfce7",
                            color: "#15803d",
                            fontWeight: "bold",
                          }}
                        >
                          🟢 Available
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            fontWeight: "bold",
                          }}
                        >
                          🔴 Busy
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {worker.online === true ? (
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            background: "#dcfce7",
                            color: "#15803d",
                            fontWeight: "bold",
                          }}
                        >
                          🟢 Online
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            background: "#f1f5f9",
                            color: "#64748b",
                            fontWeight: "bold",
                          }}
                        >
                          ⚪ Offline
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => handleEditWorker(worker)}
                        style={{
                          padding: "7px 10px",
                          marginRight: "6px",
                          background: "#2563eb",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => handleDeleteWorker(worker)}
                        style={{
                          padding: "7px 10px",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONTACT MESSAGES */}

      <div style={{ marginTop: "40px" }}>
        <h2 style={{ color: "#1e293b", marginBottom: "20px" }}>
          📩 Contact Messages
          <span
            style={{
              marginLeft: "10px",
              fontSize: "14px",
              color: "#b45309",
            }}
          >
            {contactMessages.filter((m) => m.status === "New").length} New
          </span>
        </h2>

        {contactMessages.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center" }}>
            No contact messages available.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={{ background: "#0f172a", color: "#fff" }}>
                  {["Name", "Email", "Message", "Date", "Status", "Action"].map(
                    (heading) => (
                      <th
                        key={heading}
                        style={{ padding: "12px", textAlign: "left" }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {contactMessages.map((item) => (
                  <tr
                    key={item._id}
                    style={{ borderBottom: "1px solid #e2e8f0" }}
                  >
                    <td style={{ padding: "12px" }}>{item.name}</td>

                    <td style={{ padding: "12px" }}>
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    </td>

                    <td
                      style={{
                        padding: "12px",
                        minWidth: "200px",
                        maxWidth: "350px",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.message}
                    </td>

                    <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "N/A"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "5px 9px",
                          borderRadius: "5px",
                          background:
                            item.status === "Read" ? "#dcfce7" : "#fef3c7",
                          color:
                            item.status === "Read" ? "#15803d" : "#92400e",
                        }}
                      >
                        {item.status || "New"}
                      </span>
                    </td>

                    <td style={{ padding: "12px" }}>
                      {item.status !== "Read" && (
                        <button
                          onClick={() => handleReadMessage(item._id)}
                          style={{
                            padding: "7px 10px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginBottom: "6px",
                          }}
                        >
                          Mark Read
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteMessage(item._id)}
                        style={{
                          display: "block",
                          padding: "7px 10px",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}