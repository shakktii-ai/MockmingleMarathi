import mongoose from 'mongoose';
import Standard from '@/models/Standard';//Assuming the Standard model is stored in models/standard.js
const connectDb = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);

}

export default async function handler(req, res) {
  try {
    await connectDb(); // Ensure we're connected to the database

    if (req.method === 'POST') {
      const { standard,board,subject, email, level, questions } = req.body;

      // Validate the data before saving
      if (!standard || !email || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid required fields' });
      }

      // Format questions (if necessary, here it's already an array of objects with questionText and answer)
      const formattedQuestions = questions.map(q => ({
        questionText: q.questionText,
        answer: q.answer || null,  // Default to null if no answer is provided
      }));

      const newJobRole = new Standard({
        standards:standard,
        board,
        subject:subject,
        email,
        level,
        questions: formattedQuestions,
      });

      const savedJobRole = await newJobRole.save();
      return res.status(200).json({ message: 'Job role data saved successfully', data: savedJobRole });
      
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error saving job role data:', error); // Log detailed error
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
