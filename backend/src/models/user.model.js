import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    urlsCreated: {
      type: Number,
      default: 0,
    },
    urlLimit: {
      type: Number,
      default: 999999, // Unlimited for portfolio demo
    },
    refreshToken: {
      type: String,
    },
    selectedAvatar: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    location: {
      type: String,
      default: "",
      maxlength: 100,
    },
    website: {
      type: String,
      default: "",
      maxlength: 200,
    },
    dateOfBirth: {
      type: Date,
    },
    passwordResetOTP: {
      type: String,
    },
    passwordResetOTPExpires: {
      type: Date,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    passwordResetLastAttempt: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, name: this.name },
    process.env.ACCESS_TOKEN_SECRET || "dev-access-secret",
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret",
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

const User = mongoose.model("User", userSchema);
export default User;
