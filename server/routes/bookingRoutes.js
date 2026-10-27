
const express = require("express");
const Booking = require("../models/Booking");
const Worker = require("../models/Worker");

const router = express.Router();

const OFFER_TIMEOUT_MS = 30 * 1000;
const ACTIVE_STATUSES = ["Accepted", "On the Way", "In Progress"];
const processingBookings = new Set();

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function workerIsBusy(workerId, bookingId) {
  const activeBooking = await Booking.exists({
    assignedWorkerId: String(workerId),
    status: { $in: ACTIVE_STATUSES },
  });

  if (activeBooking) return true;

  const anotherOffer = await Booking.exists({
    _id: { $ne: bookingId },
    assignedWorkerId: String(workerId),
    status: "Pending",
    offerExpiresAt: { $gt: new Date() },
  });

  return Boolean(anotherOffer);
}

// Assign the nearest eligible worker to a Pending booking.
async function dispatchBooking(bookingId) {
  if (processingBookings.has(String(bookingId))) return;

  processingBookings.add(String(bookingId));

  try {
    let booking = await Booking.findById(bookingId);

    if (!booking || booking.status !== "Pending") return;

    // If the previous offer expired, exclude that worker for this booking.
    if (
      booking.assignedWorkerId &&
      booking.offerExpiresAt &&
      booking.offerExpiresAt <= new Date()
    ) {
      const rejected = new Set(
        (booking.rejectedWorkerIds || []).map(String)
      );
      rejected.add(String(booking.assignedWorkerId));

      booking.rejectedWorkerIds = [...rejected];
      booking.assignedWorker = "";
      booking.assignedWorkerId = "";
      booking.assignedWorkerPhone = "";
      booking.assignedService = "";
      booking.workerDistance = null;
      booking.offeredAt = null;
      booking.offerExpiresAt = null;

      await booking.save();
    } else if (
      booking.assignedWorkerId &&
      booking.offerExpiresAt &&
      booking.offerExpiresAt > new Date()
    ) {
      // This booking already has an unexpired offer.
      return;
    }

    booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "Pending") return;

    const lat = Number(booking.customerLatitude);
    const lon = Number(booking.customerLongitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    const excludedIds = new Set(
      (booking.rejectedWorkerIds || []).map(String)
    );

    const workers = await Worker.find({
      service: {
        $regex: `^${String(booking.service).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
      available: true,
      online: true,
      latitude: { $type: "number" },
      longitude: { $type: "number" },
    });

    const candidates = [];

    for (const worker of workers) {
      const workerId = String(worker._id);

      if (excludedIds.has(workerId)) continue;

      if (
        !Number.isFinite(worker.latitude) ||
        !Number.isFinite(worker.longitude)
      ) {
        continue;
      }

      if (await workerIsBusy(workerId, booking._id)) continue;

      candidates.push({
        worker,
        distance: distanceKm(
          lat,
          lon,
          worker.latitude,
          worker.longitude
        ),
      });
    }

    candidates.sort((a, b) => a.distance - b.distance);

    if (candidates.length === 0) {
      // No eligible worker: leave the booking Pending and unassigned.
      await Booking.findOneAndUpdate(
        { _id: booking._id, status: "Pending" },
        {
          $set: {
            assignedWorker: "",
            assignedWorkerId: "",
            assignedWorkerPhone: "",
            assignedService: "",
            workerDistance: null,
            offeredAt: null,
            offerExpiresAt: null,
          },
        }
      );
      return;
    }

    const selected = candidates[0];
    const now = new Date();

    // Only assign if the booking is still Pending and unassigned.
    const assigned = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: "Pending",
        assignedWorkerId: "",
      },
      {
        $set: {
          assignedWorker: selected.worker.name,
          assignedWorkerId: String(selected.worker._id),
          assignedWorkerPhone: selected.worker.phone,
          assignedService: selected.worker.service,
          workerDistance: Number(selected.distance.toFixed(2)),
          offeredAt: now,
          offerExpiresAt: new Date(now.getTime() + OFFER_TIMEOUT_MS),
        },
        $inc: { dispatchAttempts: 1 },
      },
      { new: true }
    );

    // If another request changed the booking, do not overwrite it.
    if (!assigned) return;
  } catch (error) {
    console.error("Dispatch error:", error.message);
  } finally {
    processingBookings.delete(String(bookingId));
  }
}

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one booking
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create booking; assignment is controlled by the backend.
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      service,
      address,
      date,
      notes,
      requestType,
      priority,
      customerLatitude,
      customerLongitude,
    } = req.body;

    const booking = new Booking({
      name,
      phone,
      service,
      address,
      date,
      notes,
      requestType: requestType || "Emergency",
      priority: priority || "Emergency",
      customerLatitude,
      customerLongitude,
      status: "Pending",
      assignedWorker: "",
      assignedWorkerId: "",
      assignedWorkerPhone: "",
      assignedService: "",
      workerDistance: null,
      dispatchAttempts: 0,
      rejectedWorkerIds: [],
      offeredAt: null,
      offerExpiresAt: null,
    });

    await booking.save();
    await dispatchBooking(booking._id);

    const updatedBooking = await Booking.findById(booking._id);
    res.status(201).json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Worker accepts the offer.
router.post("/:id/accept", async (req, res) => {
  try {
    const { workerId } = req.body;
    const now = new Date();

    if (!workerId) {
      return res.status(400).json({ message: "Worker ID is required" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      booking.status !== "Pending" ||
      String(booking.assignedWorkerId) !== String(workerId)
    ) {
      return res.status(409).json({
        message: "This request is no longer assigned to you.",
      });
    }

    if (!booking.offerExpiresAt || booking.offerExpiresAt <= now) {
      await dispatchBooking(booking._id);
      return res.status(409).json({
        message: "The 30-second offer expired. The request is being reassigned.",
      });
    }

    const worker = await Worker.findById(workerId);

    if (!worker || !worker.available || !worker.online) {
      return res.status(409).json({
        message: "You are not currently available to accept this request.",
      });
    }

    if (await workerIsBusy(workerId, booking._id)) {
      return res.status(409).json({
        message: "You already have another active booking.",
      });
    }

    // Atomic status change: an expired offer cannot be accepted.
    const accepted = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: "Pending",
        assignedWorkerId: String(workerId),
        offerExpiresAt: { $gt: now },
      },
      {
        $set: {
          status: "Accepted",
          acceptedAt: now,
          offeredAt: null,
          offerExpiresAt: null,
        },
      },
      { new: true }
    );

    if (!accepted) {
      return res.status(409).json({
        message: "The offer has expired or already changed.",
      });
    }

    await Worker.findByIdAndUpdate(workerId, { available: false });

    res.json(accepted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Worker rejects the offer; immediately try the next eligible worker.
router.post("/:id/reject", async (req, res) => {
  try {
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({ message: "Worker ID is required" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      booking.status !== "Pending" ||
      String(booking.assignedWorkerId) !== String(workerId)
    ) {
      return res.status(409).json({
        message: "This request is no longer assigned to you.",
      });
    }

    const rejected = new Set(
      (booking.rejectedWorkerIds || []).map(String)
    );
    rejected.add(String(workerId));

    const cleared = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: "Pending",
        assignedWorkerId: String(workerId),
      },
      {
        $set: {
          rejectedWorkerIds: [...rejected],
          assignedWorker: "",
          assignedWorkerId: "",
          assignedWorkerPhone: "",
          assignedService: "",
          workerDistance: null,
          offeredAt: null,
          offerExpiresAt: null,
        },
      },
      { new: true }
    );

    if (!cleared) {
      return res.status(409).json({ message: "The request has changed." });
    }

    await dispatchBooking(booking._id);

    const updatedBooking = await Booking.findById(booking._id);
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update status, timestamps, or review.
// Accepting must use the dedicated /:id/accept endpoint.
router.put("/:id", async (req, res) => {
  try {
    if (req.body.status === "Accepted") {
      return res.status(400).json({
        message: "Use the dedicated accept endpoint to accept a request.",
      });
    }

    const allowedFields = [
      "status",
      "rating",
      "review",
      "reviewedAt",
      "completedAt",
      "acceptedAt",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete booking
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check expired offers and retry unassigned Pending bookings.
setInterval(async () => {
  try {
    const pendingBookings = await Booking.find({ status: "Pending" });

    for (const booking of pendingBookings) {
      const unassigned = !booking.assignedWorkerId;
      const expired =
        booking.assignedWorkerId &&
        booking.offerExpiresAt &&
        booking.offerExpiresAt <= new Date();

      if (unassigned || expired) {
        await dispatchBooking(booking._id);
      }
    }
  } catch (error) {
    console.error("Auto-dispatch timer error:", error.message);
  }
}, 3000);

module.exports = router;
