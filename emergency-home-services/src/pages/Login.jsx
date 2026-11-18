import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = "https://emergency-home-services-api.onrender.com";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [workers, setWorkers] = useState([]);
  const [showWorkerSelect, setShowWorkerSelect] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // =========================
    // ADMIN LOGIN
    // =========================
    if (username === "admin" && password === "123") {
      navigate("/admin");
      return;
    }

    // =========================
    // WORKER LOGIN
    // =========================
    if (username === "worker" && password === "123") {
      setLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/workers`
        );

        if (!response.ok) {
          throw new Error("Unable to load workers.");
        }

        const data = await response.json();

        if (data.length === 0) {
          setError("No workers found.");
          return;
        }

        // MongoDB workers
        const workerList = data.map((worker) => ({
          ...worker,
          id: worker._id,
        }));

        setWorkers(workerList);
        setShowWorkerSelect(true);
      } catch (error) {
        console.error(
          "Error loading workers:",
          error
        );

        setError(
          "Unable to load workers. Please make sure the server is running."
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    setError("Invalid username or password");
  };

  // =========================
  // WORKER SELECT
  // =========================
  const handleWorkerContinue = () => {
    setError("");

    if (!workerId) {
      setError("Please select your name.");
      return;
    }

    const selectedWorker = workers.find(
      (worker) => worker.id === workerId
    );

    if (!selectedWorker) {
      setError("Selected worker not found.");
      return;
    }

    // Save MongoDB worker ID
    localStorage.setItem(
      "workerId",
      selectedWorker.id
    );

    // Save worker name
    localStorage.setItem(
      "workerName",
      selectedWorker.name
    );

    // Go to Worker Dashboard
    navigate("/worker");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">🔐</div>

        <h2>Login</h2>

        <p className="login-subtitle">
          Admin / Worker Login
        </p>

        {!showWorkerSelect ? (
          <form onSubmit={handleLogin}>

            <div className="input-group">
              <label>Username</label>

              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Login"}
            </button>

          </form>
        ) : (
          <div>

            <div className="input-group">
              <label>Select Your Name</label>

              <select
                value={workerId}
                onChange={(e) => {
                  setWorkerId(e.target.value);
                  setError("");
                }}
              >
                <option value="">
                  -- Select Worker --
                </option>

                {workers.map((worker) => (
                  <option
                    key={worker.id}
                    value={worker.id}
                  >
                    {worker.name} -{" "}
                    {worker.service}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <button
              type="button"
              className="login-btn"
              onClick={handleWorkerContinue}
            >
              Continue to Worker Dashboard
            </button>

          </div>
        )}

        <button
          className="back-home"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

      </div>
    </div>
  );
}