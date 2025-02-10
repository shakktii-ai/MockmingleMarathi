
// export default async function handler(req, res) {
//     const url = "http://139.59.42.156:11434/api/generate"; // Your backend URL
  
//     const data = {
//       model: "gemma:2b",
//       prompt: `give me 15 questions for ${req.query.jobrole} at ${req.query.level} level`,
//       stream: false,
//     };
  
//     const headers = {
//       "Content-Type": "application/json",
//     };
  
//     try {
//       console.log("Sending request to backend...");
//       const response = await fetch(url, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(data),
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Backend API error:", errorData);
//         return res.status(500).json({ error: `Backend API error: ${errorData.message || response.statusText}` });
//       }
  
//       const responseData = await response.json();
//       return res.status(200).json(responseData);
//     } catch (error) {
//       console.error("Error in fetch operation:", error);
//       return res.status(500).json({ error: `Error in the fetch operation: ${error.message}` });
//     }
//   }
  

export default async function handler(req, res) {
    const url = "http://139.59.42.156:11434/api/generate"; // Backend URL
  
    const data = {
      model: "gemma:2b",
      prompt: `give me 6 questions for ${req.query.jobrole} at ${req.query.level} level`,
      stream: false,
    };
  
    const headers = {
      "Content-Type": "application/json",
    };
  
    try {
      console.log("Sending request to backend...");
      
      // Increase timeout (if the backend takes time, this may help)
      const timeout = 10000; // 10 seconds timeout for example
      const response = await Promise.race([
        fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeout)
        ),
      ]);
  
      if (response.ok) {
        const responseData = await response.json();
        return res.status(200).json(responseData);
      } else {
        console.error("Error fetching response from backend:", response.statusText);
        return res.status(500).json({ error: "Error fetching response from backend" });
      }
    } catch (error) {
      console.error("Error in fetch operation:", error);
      return res.status(500).json({ error: `Error in the fetch operation: ${error.message}` });
    }
  }
  