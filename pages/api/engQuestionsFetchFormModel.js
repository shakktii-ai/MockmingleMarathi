// // api/response.js


// export const getApiResponse = async (jobrole,level) => {
//     const url = "http://139.59.42.156:11434/api/generate";
//     const headers = {
//       "Content-Type": "application/json"
//     };
//     const payload  = {
//       model: "gemma:2b",
//       prompt: `give mi 15 question to ${jobrole} this job role ${level} level`,
//       stream: false
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(payload ),
//       });

//       if (response.ok) {
//         const responseData = await response.json();
//         return responseData.response; // Return the response from the API
//       } else {
//         console.error("Error fetching response from the API.");
//         return null;
//       }
//     } catch (error) {
//       console.error("Error in the fetch operation:", error);
//       return null;
//     }
//   };


// export const getApiResponse = async (jobrole, level) => {
//   const url = `${process.env.NEXT_PUBLIC_HOST}/api/proxy`; // Replace with your Vercel proxy URL
//   const headers = {
//     "Content-Type": "application/json",
//   };

//   const payload  = {
//     model: "gemma:2b",
//     prompt: `give mi 15 question to ${jobrole} this job role for ${level} level`,
//     stream: false,
//   };

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(payload ),
//     });

//     if (response.ok) {
//       const responseData = await response.json();
//       return responseData.response; // Return the response from the API
//     } else {
//       console.error("Error fetching response from the API.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error in the fetch operation:", error);
//     return null;
//   }
// };


// Importing the function for fetching questions

//  export const config = {
//   runtime: "nodejs", // Ensure it's a Node.js function
//   maxDuration: 300,
// };

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { jobRole, level } = req.body;

//     try {
//       // Call the getApiResponse function directly within the handler
//       const fetchedQuestions = await getApiResponse(jobRole, level);

//       if (fetchedQuestions) {
//         console.log('Fetched Questions:', fetchedQuestions);  // Log the fetched questions

//         // You can also store the questions or perform further processing if necessary
//         // Example: await saveQuestionsToDatabase(fetchedQuestions);

//         return res.status(200).json({
//           message: "Job role submitted. Questions fetched successfully.",
//           questions: fetchedQuestions,
//         });
//       } else {
//         return res.status(500).json({
//           error: "Error: No questions fetched from the API.",
//         });
//       }
//     } catch (error) {
//       console.error('Error during processing:', error);
//       return res.status(500).json({
//         error: "Error during background processing.",
//       });
//     }
//   }

//   // If the method is not POST, return a 405 Method Not Allowed response
//   return res.status(405).json({ error: 'Method Not Allowed' });
// }

// // The API function to fetch questions
// export const getApiResponse = async (jobRole, level) => {
//   const url = "http://139.59.75.143:11434/api/generate";
//   const headers = {
//     "Content-Type": "application/json",
//   };
//   const payload  = {
//     model: "llama3.1:8b-instruct-q4_K_M",
//     prompt: `Give me 10 questions for the ${jobRole} job role at ${level} level`, // Fixed template string

//     stream: false,
//   };

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(payload ),
//     });

//     if (response.ok) {
//       const responseData = await response.json();
//       return responseData.response; // Return the response from the API
//     } else {
//       console.error("Error fetching response from the API.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error in the fetch operation:", error);
//     return null;
//   }
// };



export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { level, subject, standard,board } = req.body;

  if (!level || !standard || !subject || !board) {
    return res.status(400).json({ error: 'standard , Subject, board and level are required.' });
  }

  try {
    const questions = await getApiResponse(level, standard,board, subject);

    if (questions) {
      return res.status(200).json({
        message: 'Job role submitted. Questions fetched successfully.',
        questions,
      });
    } else {
      return res.status(500).json({ error: 'No questions fetched from Claude API.' });
    }
  } catch (error) {
    console.error('Error during processing:', error);
    return res.status(500).json({ error: 'Error during background processing.' });
  }
}

async function getApiResponse(level, standard, board, subject) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  };

  const systemPrompt = `You are an expert education evaluator. Generate simple, clear, and descriptive questions in English language only.`;
  
  const userPrompt = `Generate 10 questions with the following details:
  - Subject: ${subject}
  - Standard: ${standard}
  - Board: ${board}
  - Difficulty Level: ${level} (Beginner, Intermediate, Advanced)
  
  Requirements:
  1. Questions must be written only in English
  2. Number the questions 1 to 10 using English numerals
  3. Do NOT write anything in Marathi or any other language
  4. Avoid multiple-choice or yes/no questions
  
  Return only the numbered list of questions.`;

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
    const response = await fetch(url, {
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