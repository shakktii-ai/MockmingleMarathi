import mongoose from 'mongoose';
import AssessmentReport from  '../../models/AssessmentReport'; // Ensure this path matches your file structure

// --- DATABASE CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  // Ensure DB is connected for all operations
  try {
    await dbConnect();
  } catch (error) {
    console.error("Database connection failed:", error);
    return res.status(500).json({ error: "Database connection failed" });
  }

  // ==========================================
  //  HANDLE GET REQUEST (Fetch Reports)
  // ==========================================
  if (req.method === 'GET') {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email query parameter required" });
    }

    try {
      // Fetch reports for the specific email, sorted by newest first
      const reports = await AssessmentReport.find({ email: email }).sort({ createdAt: -1 });
      
      return res.status(200).json({ reports });
    } catch (err) {
      console.error("Fetch Error:", err);
      return res.status(500).json({ error: 'Failed to retrieve reports' });
    }
  }

  // ==========================================
  //  HANDLE POST REQUEST (Generate/Evaluate)
  // ==========================================
  else if (req.method === 'POST') {
    const { type, standard, subject, questions, userAnswers, email, collageName, role } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "OpenAI API Key not configured" });

    const url = 'https://api.openai.com/v1/chat/completions';

    try {
      // --- SCENARIO 1: GENERATE MCQ QUESTIONS ---
      if (type === 'generate_questions') {
        
        // Strict system prompt to ensure JSON format
        const systemPrompt = `You are a strict academic examiner for the Maharashtra State Board. 
        You must output strictly valid JSON only. Do not add any markdown formatting (like \`\`\`json).`;
        
        // User prompt specifically asking for 25 MCQs in Marathi
        const userPrompt = `Create exactly 25 Multiple Choice Questions (MCQs) in Marathi for Class ${standard}, Subject ${subject}. 
        
        The output must be a raw JSON array of objects. Each object must follow this structure:
        {
          "id": 1,
          "question": "Question text in Marathi",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The full text of the correct option"
        }

        Ensure the questions cover the core concepts of the subject.`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-3.5-turbo-16k", // Using 16k model to ensure enough tokens for 25 questions
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            temperature: 0.7
          })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("OpenAI Error:", data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const aiContent = data.choices[0].message.content;

        try {
          // Attempt to parse JSON directly
          let parsedQuestions = [];
          
          // Helper to find JSON array if AI adds extra text
          const jsonMatch = aiContent.match(/\[.*\]/s);
          if (jsonMatch) {
            parsedQuestions = JSON.parse(jsonMatch[0]);
          } else {
             parsedQuestions = JSON.parse(aiContent);
          }

          return res.status(200).json({ result: parsedQuestions });
        } catch (e) {
          console.error("JSON Parse Error:", e);
          console.error("AI Output:", aiContent);
          return res.status(500).json({ error: "Failed to parse questions. Please try again." });
        }
      } 

      // --- SCENARIO 2: EVALUATE & SAVE ---
      else if (type === 'evaluate_answers') {
        
        // 1. STRICT VALIDATION
        if (!email) {
          return res.status(400).json({ error: "User is not logged in. Cannot save report." });
        }

        // 2. CALCULATE SCORE LOCALLY (More reliable than AI for MCQs)
        // We assume 'questions' array contains the 'correctAnswer' field from the previous step
        let calculatedScore = 0;
        const totalQuestions = questions.length;

        questions.forEach((q, index) => {
            // Compare user answer with correct answer
            // Note: Ensure frontend sends the actual text string or index consistently
            if (userAnswers[index] && userAnswers[index] === q.correctAnswer) {
                calculatedScore++;
            }
        });

        // 3. AI QUALITATIVE FEEDBACK
        const systemPrompt = `You are a helpful teacher speaking Marathi. Analyze the student's performance.`;
        
        const userPrompt = `The student answered ${calculatedScore} out of ${totalQuestions} questions correctly in Subject: ${subject}.
        
        Provide a Markdown report in Marathi containing:
        1. A motivating summary of their performance.
        2. Key areas they need to study based on this subject.
        3. A plan to improve their score next time.
        
        Do not list every question individually, just a high-level analysis.`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            temperature: 0.7
          })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        const aiAnalysis = data.choices[0].message.content;

        // 4. SAVE TO DATABASE
        try {
          const newReport = new AssessmentReport({
            role: role || 'Student',
            subject: subject,
            email: email,
            collageName: collageName || 'Unknown College',
            reportAnalysis: aiAnalysis, // The qualitative feedback
            score: calculatedScore,     // The numeric score
            totalQuestions: totalQuestions
          });

          await newReport.save();
          console.log(`Report saved for ${email}`);
        } catch (dbError) {
          console.error("Database Save Error:", dbError);
          return res.status(500).json({ error: "Failed to save report to database", details: dbError.message });
        }

        return res.status(200).json({ 
            result: aiAnalysis, 
            score: calculatedScore, 
            total: totalQuestions 
        });
      }

    } catch (error) {
      console.error("API Handler Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  } 
  
  // Handle other methods
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}