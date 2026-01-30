const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, sparse: true, unique: true },
    DOB: { type: String, default: "" },
    address: { type: String, default: "" },
    mobileNo: { type: String, default: "", unique: true },
    education: { type: String, default: "" },
    collageName: { type: String, default: "" },
    password: { type: String, default: "" },
    profileImg: { type: String, default: "" },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    no_of_interviews: { type: Number, default: 0 },
    no_of_interviews_completed: { type: Number, default: 0 },
    permanentLoginToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);


mongoose.models = {};

export default mongoose.model("User", UserSchema);
