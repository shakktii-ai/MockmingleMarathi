import mongoose from 'mongoose';

const AssessmentReportSchema = new mongoose.Schema({
  role: { type: String, required: true }, // e.g., 'Student', 'Teacher'
  subject: { type: String, required: true },
  email: { type: String, required: true },
  collageName: { type: String, required: true },
  reportAnalysis: { type: String, required: true }, // Detailed Markdown report from AI
  score: { type: Number, required: true }, // The numeric score obtained
  totalQuestions: { type: Number, required: true }, // Total number of questions (e.g., 25)
  createdAt: { type: Date, default: Date.now },
});

// Check if the model exists before defining it to prevent recompilation errors in development
export default mongoose.models.AssessmentReport || mongoose.model('AssessmentReport', AssessmentReportSchema);