// api/response.js

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
  

export const getApiResponse = async (jobrole, level) => {
  const url = "https://shakktii-ai-xg9u.vercel.app/api/proxy"; // Replace with your Vercel proxy URL
  const headers = {
    "Content-Type": "application/json",
  };

  const data = {
    model: "gemma:2b",
    prompt: `give me 15 questions for ${jobrole} at ${level} level`,
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
