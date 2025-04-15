// // api/response.js


// export const getApiResponse = async (jobrole,level) => {
//     const url = "http://139.59.42.156:11434/api/generate";
//     const headers = {
//       "Content-Type": "application/json"
//     };
//     const data = {
//       model: "gemma:2b",
//       prompt: `give mi 15 question to ${jobrole} this job role ${level} level`,
//       stream: false
//     };
  
//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(data),
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

//   const data = {
//     model: "gemma:2b",
//     prompt: `give mi 15 question to ${jobrole} this job role for ${level} level`,
//     stream: false,
//   };

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(data),
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

 export const config = {
  runtime: "nodejs", // Ensure it's a Node.js function
  maxDuration: 300,
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { jobRole, level } = req.body;

    try {
      // Call the getApiResponse function directly within the handler
      const fetchedQuestions = await getApiResponse(jobRole, level);

      if (fetchedQuestions) {
        console.log('Fetched Questions:', fetchedQuestions);  // Log the fetched questions
        
        // You can also store the questions or perform further processing if necessary
        // Example: await saveQuestionsToDatabase(fetchedQuestions);

        return res.status(200).json({
          message: "Job role submitted. Questions fetched successfully.",
          questions: fetchedQuestions,
        });
      } else {
        return res.status(500).json({
          error: "Error: No questions fetched from the API.",
        });
      }
    } catch (error) {
      console.error('Error during processing:', error);
      return res.status(500).json({
        error: "Error during background processing.",
      });
    }
  }

  // If the method is not POST, return a 405 Method Not Allowed response
  return res.status(405).json({ error: 'Method Not Allowed' });
}

// The API function to fetch questions
export const getApiResponse = async (jobRole, level) => {
  const url = "http://139.59.42.156:11434/api/generate";
  const headers = {
    "Content-Type": "application/json",
  };
  const data = {
    model: "llama3:latest",
    prompt: `Give me 10 questions for the ${jobRole} job role at ${level} level`, // Fixed template string

    stream: false,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.response; // Return the response from the API
    } else {
      console.error("Error fetching response from the API.");
      return null;
    }
  } catch (error) {
    console.error("Error in the fetch operation:", error);
    return null;
  }
};
