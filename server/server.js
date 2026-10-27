const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const workerRoutes = require("./routes/workerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contactRoutes");

app.use("/api/workers", workerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("SERVER IS WORKING");
});

app.get("/test", (req, res) => {
  res.send("TEST ROUTE IS WORKING");
});
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `🚀 Server running on port ${process.env.PORT || 5000}`
      );
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
  });