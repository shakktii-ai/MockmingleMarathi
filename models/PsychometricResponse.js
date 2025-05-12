import mongoose from "mongoose";

const PsychometricResponseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "PsychometricTest", required: true },
    responses: [
      {
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true }, // Index of the selected option
        reasoning: { type: String } // Optional reasoning for the choice
      }
    ],
    results: {
      empathy: { type: Number, min: 0, max: 3 }, // 0-3 stars
      assertiveness: { type: Number, min: 0, max: 3 },
      ethicalReasoning: { type: Number, min: 0, max: 3 },
      collaboration: { type: Number, min: 0, max: 3 },
      conflictResolution: { type: Number, min: 0, max: 3 },
      leadershipPotential: { type: Number, min: 0, max: 3 },
      overallScore: { type: Number, min: 0, max: 3 },
      analysis: { type: String },
      strengths: [{ type: String }],
      areasToImprove: [{ type: String }],
      roleFitRecommendations: [{ type: String }]
    },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create model or use existing one if available
const PsychometricResponse = mongoose.models.PsychometricResponse || mongoose.model("PsychometricResponse", PsychometricResponseSchema);

export default PsychometricResponse;
