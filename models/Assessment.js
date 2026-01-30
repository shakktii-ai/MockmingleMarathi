const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userEmail: { type: String, required: true },
        className: {
            type: String,
            required: true,
            enum: ["8th", "9th", "10th", "11th Science", "11th Commerce", "11th Arts", "12th Science", "12th Commerce", "12th Arts"]
        },
        subject: { type: String, required: true },
        questions: [
            {
                questionText: { type: String, required: true },
                options: [{ type: String }], // For MCQ
                correctAnswer: { type: String, required: true },
                explanation: { type: String },
                marks: { type: Number, default: 1 }
            }
        ],
        totalMarks: { type: Number, required: true },
        duration: { type: Number, default: 60 }, // in minutes
        dateCreated: { type: Date, default: Date.now },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date }
    },
    { timestamps: true }
);

const Assessment = mongoose.models.Assessment || mongoose.model("Assessment", AssessmentSchema);

module.exports = Assessment;
