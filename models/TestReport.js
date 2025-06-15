const mongoose = require('mongoose');

const testReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    required: true,
    default: 'personality'
  },
  responses: [{
    questionId: String,
    questionText: String,
    selectedOption: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  analysis: {
    summary: String,
    recommendations: [String],
    strengths: [String],
    areasForGrowth: [String],
    rawAnalysis: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.TestReport || mongoose.model('TestReport', testReportSchema);
