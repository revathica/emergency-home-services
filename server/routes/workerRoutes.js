const express = require("express");
const Worker = require("../models/Worker");

const router = express.Router();

// Get all workers
router.get("/", async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a worker
router.post("/", async (req, res) => {
  try {
    const worker = new Worker(req.body);
    const savedWorker = await worker.save();

    res.status(201).json(savedWorker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Get one worker by ID (for live tracking)
router.get("/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    res.json(worker);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Update a worker
router.put("/:id", async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json(worker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a worker
router.delete("/:id", async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json({ message: "Worker deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;