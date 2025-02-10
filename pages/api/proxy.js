export default async function handler(req, res) {
    const url = "http://139.59.42.156:11434/api/generate"; // Your backend API URL
  
    // Create the request data to forward to the backend
    const data = {
      model: "gemma:2b",
      prompt: `give me 15 questions for ${req.query.jobrole} at ${req.query.level} level`,
      stream: false,
    };
  
    const headers = {
      "Content-Type": "application/json",
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const responseData = await response.json();
        return res.status(200).json(responseData); // Forward the response back to the frontend
      } else {
        return res.status(500).json({ error: "Error fetching response from the backend" });
      }
    } catch (error) {
      return res.status(500).json({ error: `Error in the fetch operation: ${error.message}` });
    }
  }
  