import mongoose from "mongoose";

const PsychometricTestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [
      {
        scenario: { type: String, required: true },
        options: [
          {
            text: { type: String, required: true },
            value: { type: Number, required: true } // Value for scoring
          }
        ],
        difficulty: { type: String, enum: ["Easy", "Moderate", "Complex"], required: true }
      }
    ],
    dateCreated: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

// Create model or use existing one if available
const PsychometricTest = mongoose.models.PsychometricTest || mongoose.model("PsychometricTest", PsychometricTestSchema);

export default PsychometricTest;
