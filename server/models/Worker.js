const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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

    phone: {
      type: String,
      required: true,
    },

    available: {
      type: Boolean,
      default: true,
    },

    online: {
      type: Boolean,
      default: false,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Worker", workerSchema);