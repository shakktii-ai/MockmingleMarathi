import connectDB from "../../../middleware/dbConnect";
import Youtube from "../../../models/Youtube";

export default async function handler(req, res) {
  await connectDB();

  
  
  if (req.method === 'GET') {
    try {
      const userEmail = req.headers['user-email']; 
      console.log(userEmail);// read from custom header
      const query = userEmail ? { userEmail } : {};
      
      const recommendations = await Youtube.find(query);
      console.log("Recommendations:", recommendations);
  
      return res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { userId, userEmail, recommendations } = req.body;
      
      if (!recommendations || !Array.isArray(recommendations)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Recommendations array is required' 
        });
      }

      const newEntry = await Youtube.create({ 
        userId, 
        userEmail, 
        recommendations 
      });
      
      return res.status(201).json({ success: true, data: newEntry });
    } catch (error) {
      console.error('Error saving YouTube recommendations:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to save recommendations' 
      });
    }
  }

  // Handle unsupported HTTP methods
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ 
    success: false, 
    error: `Method ${req.method} not allowed` 
  });
}
