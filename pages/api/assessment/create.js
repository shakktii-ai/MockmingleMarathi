import OpenAI from 'openai';
import connectDb from '@/middleware/dbConnect';
import Assessment from '@/models/Assessment';

export const config = {
    runtime: 'nodejs',
    maxDuration: 300,
};

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { userId, userEmail, className, subject } = req.body;

    if (!userId || !userEmail || !className || !subject) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        console.log(`Generating Marathi assessment for Class: ${className}, Subject: ${subject}`);

        const prompt = `You are an expert academic content creator in Maharashtra, India.
Generate exactly 10 high-quality academic questions for Class ${className} on the subject ${subject} in MARATHI language.

REQUIREMENTS:
1. Language: MARATHI (Devanagari script).
2. Questions must be curriculum-aligned for Class ${className} in Maharashtra.
3. Distribution: 3 Easy, 4 Moderate, 3 Hard.
4. Format: Each question must be an MCQ with exactly 4 options.
5. Provide a correct answer (matching one option exactly) and an explanation in MARATHI.

RESPONSE FORMAT (JSON):
{
  "questions": [
    {
      "questionText": "Question in Marathi",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option Text",
      "explanation": "Explanation in Marathi",
      "marks": 1
    }
  ],
  "totalMarks": 10
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful academic assistant that generates high-quality test questions in Marathi."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // Save the assessment to DB
        const newAssessment = new Assessment({
            userId,
            userEmail,
            className,
            subject,
            questions: result.questions,
            totalMarks: result.totalMarks || result.questions.length,
            duration: 30, // Default 30 minutes
        });

        await newAssessment.save();

        console.log(`Assessment created: ${newAssessment._id}`);

        // Return the assessment without exposing correct answers
        const clientQuestions = result.questions.map((q, idx) => ({
            questionText: q.questionText,
            options: q.options,
            marks: q.marks,
            id: idx
        }));

        return res.status(200).json({
            success: true,
            assessmentId: newAssessment._id,
            questions: clientQuestions,
            className,
            subject,
            totalMarks: newAssessment.totalMarks
        });

    } catch (error) {
        console.error('Error creating assessment:', error);
        return res.status(500).json({ success: false, message: 'Failed to create assessment', error: error.message });
    }
}

export default connectDb(handler);
