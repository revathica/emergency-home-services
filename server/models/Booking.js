const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    service: {
      type: String,
      enum: [
        "Plumbing",
        "Electrical",
        "AC Repair",
        "Appliance Repair",
        "Carpentry",
        "Home Painting",
      ],
      required: true
    },

    address: {
      type: String,
      required: true,
    },

    date: {
      type: String,
    },

    notes: {
      type: String,
      default: "",
    },

    requestType: {
      type: String,
      default: "Emergency",
    },

    priority: {
      type: String,
      default: "Emergency",
    },

    customerLatitude: {
      type: Number,
      default: null,
    },

    customerLongitude: {
      type: Number,
      default: null,
    },

    assignedWorker: {
      type: String,
      default: "",
    },

    assignedWorkerId: {
      type: String,
      default: "",

    },
    
    assignedWorkerPhone: {
      type: String,
      default: "",
    },

    assignedService: {
      type: String,
      default: "",
    },

    workerDistance: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "On the Way",
        "In Progress",
        "Completed",
        "Rejected",
      ],
      default: "Pending",
    },

    dispatchAttempts: {
      type: Number,
      default: 1,
    },

    offeredAt: {
      type: Date,
      default: null,
    },

    offerExpiresAt: {
      type: Date,
      default: null,
    },

    rejectedWorkerIds: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
    },

    review: {
      type: String,
      default: "",
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);