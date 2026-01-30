import OpenAI from 'openai';
import connectDb from '@/middleware/dbConnect';
import Assessment from '@/models/Assessment';
import AssessmentReport from '@/models/AssessmentReport';

export const config = {
    runtime: 'nodejs',
    maxDuration: 300,
};

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { assessmentId, answers, timeSpent } = req.body;

    if (!assessmentId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Fetch the assessment
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        if (assessment.isCompleted) {
            return res.status(400).json({ success: false, message: 'Assessment already completed' });
        }

        console.log(`Evaluating assessment: ${assessmentId} for user ${assessment.userEmail}`);

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Prepare evaluation prompt
        const prompt = `You are an expert academic evaluator. Evaluate the student's performance on this assessment.
CLASS: ${assessment.className}
SUBJECT: ${assessment.subject}

QUESTIONS & ANSWERS:
${assessment.questions.map((q, i) => `Q${i + 1}: ${q.questionText}
Correct: ${q.correctAnswer}
Student Answer: ${answers.find(a => a.questionIndex === i)?.userAnswer || 'Not answered'}`).join('\n\n')}

EVALUATION REQUIREMENTS:
1. Compare student answer with correct answer.
2. Provide feedback for each answer in MARATHI.
3. Summarize overall performance (Strengths, Weaknesses, Recommendations) in MARATHI.
4. Assign a Grade (A+, A, B, C, D, F).

RESPONSE FORMAT (JSON):
{
  "results": [
    {
      "questionIndex": 0,
      "isCorrect": true,
      "marksObtained": 1,
      "feedback": "Feedback in Marathi"
    }
  ],
  "summary": {
    "strengths": ["Strength 1 in Marathi", "Strength 2 in Marathi"],
    "weaknesses": ["Weakness 1 in Marathi", "Weakness 2 in Marathi"],
    "recommendations": ["Recommendation 1 in Marathi", "Recommendation 2 in Marathi"],
    "grade": "A"
  }
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a constructive academic evaluator who provides feedback in Marathi."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const evaluation = JSON.parse(completion.choices[0].message.content);

        const marksObtained = evaluation.results.reduce((sum, r) => sum + r.marksObtained, 0);
        const percentage = (marksObtained / assessment.totalMarks) * 100;

        // Peer Comparison (Simplified)
        const peerReports = await AssessmentReport.find({
            className: assessment.className,
            subject: assessment.subject
        }).select('marksObtained');

        const totalStudents = peerReports.length + 1;
        const allScores = [...peerReports.map(r => r.marksObtained), marksObtained];
        const averageScore = allScores.reduce((sum, s) => sum + s, 0) / totalStudents;
        const rank = allScores.sort((a, b) => b - a).indexOf(marksObtained) + 1;

        // Create Report
        const reportData = {
            userId: assessment.userId,
            assessmentId: assessment._id,
            className: assessment.className,
            subject: assessment.subject,
            answers: evaluation.results.map(r => ({
                ...r,
                userAnswer: answers.find(a => a.questionIndex === r.questionIndex)?.userAnswer || '',
                correctAnswer: assessment.questions[r.questionIndex].correctAnswer
            })),
            totalMarks: assessment.totalMarks,
            marksObtained,
            percentage,
            grade: evaluation.summary.grade,
            strengths: evaluation.summary.strengths,
            weaknesses: evaluation.summary.weaknesses,
            recommendations: evaluation.summary.recommendations,
            peerComparison: {
                averageScore: Math.round(averageScore * 100) / 100,
                rank,
                totalStudents
            },
            timeSpent
        };

        const report = new AssessmentReport(reportData);
        await report.save();

        // Mark assessment as completed
        assessment.isCompleted = true;
        assessment.completedAt = new Date();
        await assessment.save();

        console.log(`Report generated: ${report._id}`);

        return res.status(200).json({
            success: true,
            reportId: report._id,
            marksObtained,
            totalMarks: assessment.totalMarks,
            percentage,
            grade: report.grade,
            summary: evaluation.summary,
            peerComparison: report.peerComparison
        });

    } catch (error) {
        console.error('Error evaluating assessment:', error);
        return res.status(500).json({ success: false, message: 'Failed to evaluate assessment', error: error.message });
    }
}

export default connectDb(handler);
