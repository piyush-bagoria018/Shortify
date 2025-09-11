import mongoose, { Schema } from "mongoose";

const clickSchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now },
    source: { type: String, default: "direct" },
    location: { type: String, default: "" },
    country: { type: String, default: "Unknown" },
    city: { type: String, default: "Unknown" },
    browser: { type: String, default: "Unknown" },
    browserVersion: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    device: { type: String, default: "Desktop" },
  },
  { _id: false }
);

const urlSchema = new Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
    },
    validityMinutes: {
      type: Number,
      required: true,
      default: 30,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    clickHistory: {
      type: [clickSchema],
      default: [],
    },
    // Associate URL with user
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous URLs for backward compatibility
    },
    // Track if URL is active/inactive
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate expiry date
urlSchema.methods.getExpiryDate = function () {
  return new Date(this.createdAt.getTime() + this.validityMinutes * 60000);
};

// Method to check if expired
urlSchema.methods.isExpired = function () {
  return new Date() > this.getExpiryDate();
};

export const Url = mongoose.model("Url", urlSchema);
