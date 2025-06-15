/**
 * API endpoint for generating academic questions using OpenAI's GPT-4 model
 * Questions are generated in Marathi based on the provided academic parameters
 */



export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { level, subject, standard, board } = req.body;

  if ((!level) && (!standard || !subject || !board)) {
    return res.status(400).json({ error: 'Standard, Subject, board and level are required.' });
  }

  try {
    const questions = await generateQuestionsWithOpenAI(level, standard, board, subject);

    if (questions) {
      return res.status(200).json({
        message: 'Questions generated successfully.',
        questions,
      });
    } else {
      return res.status(500).json({ error: 'Failed to generate questions.' });
    }
  } catch (error) {
    console.error('Error during processing:', error);
    return res.status(500).json({ 
      error: 'Error during question generation.',
      details: error.message 
    });
  }
}

async function generateQuestionsWithOpenAI(level, standard, board, subject) {
  const openaiUrl = 'https://api.openai.com/v1/chat/completions';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  };

  const systemPrompt = `You are an experienced primary school teacher. Generate 10 simple, beginner-friendly questions in Marathi. `;
  
  const userPrompt = `Generate 10 well-structured, syllabus-aligned academic questions in Marathi based on the following details:

Subject: ${subject}

Standard (Grade): ${standard}

Difficulty Level: ${level} (Easy / Medium / Hard)

Education Board: ${board}

🔹 Requirements:
All questions must be written in Marathi language only.

Each question must contain at least 2 full sentences to ensure clarity and depth. Avoid short or incomplete prompts.
Make sure sentences use proper grammer.

Use Marathi numerals to number the questions (e.g., १, २, ३, ...).

All questions must be strictly aligned with the official syllabus of the specified standard and board.

Ensure that the difficulty level is appropriate:

Easy: Basic concept explanation

Medium: Applied understanding or reasoning

Hard: Analytical, comparative, or evaluative thinking

Frame descriptive or application-based questions only (e.g., “समजावून सांगा”, “तुलनात्मक विवेचन करा”, “स्पष्ट करा”, “लघुनिबंध लिहा”, etc.).

Do not include answers, hints, or extra formatting—just a clean list of numbered questions.
`;

  const requestBody = {
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  try {
    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}