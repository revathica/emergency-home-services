
const express = require("express");
const mongoose = require("mongoose");
const ContactMessage = require("../models/ContactMessage");

const router = express.Router();

// Save a new contact message
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "Please provide name, email and message.",
      });
    }

    if (
      name.trim().length > 100 ||
      email.trim().length > 254 ||
      message.trim().length > 5000 ||
     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Please check your details and try again.",
      });
    }

    const savedMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Contact message error:", error);
    res.status(500).json({
      message: "Unable to save your message.",
    });
  }
});

// Get all contact messages
router.get("/", async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error("Fetch contact messages error:", error);
    res.status(500).json({
      message: "Unable to load contact messages.",
    });
  }
});

// Mark a message as read
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID.",
      });
    }

    if (req.body.status !== "Read") {
      return res.status(400).json({
        message: "Invalid message status.",
      });
    }

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { status: "Read" } },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        message: "Message not found.",
      });
    }

    res.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Update contact message error:", error);
    res.status(500).json({
      message: "Unable to update message.",
    });
  }
});

// Delete a message
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID.",
      });
    }

    const deletedMessage =
      await ContactMessage.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        message: "Message not found.",
      });
    }

    res.json({
      success: true,
      message: "Contact message deleted.",
    });
  } catch (error) {
    console.error("Delete contact message error:", error);
    res.status(500).json({
      message: "Unable to delete message.",
    });
  }
});

module.exports = router;
