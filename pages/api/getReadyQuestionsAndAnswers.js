import mongoose from 'mongoose';
import JobRole from '../../models/JobRole'; // Adjust the path to your JobRole model
import Standard from '@/models/Standard';
// Function to connect to the MongoDB database
const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    return; // Already connected
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default async function handler(req, res) {
  // const {jobRoleId} = req.query
//   const jobRoleId = '67a3510b89f02d7f5bed194e';
const {standardId}=req.query
  // Connect to the database
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      // Fetch the JobRole by its ID
      const standard = await Standard.findById(standardId);

      // Check if the job role was found
      if (!standard) {
        return res.status(404).json({ message: 'JobRole not found' });
      }

      // Send the data in the response
      res.status(200).json({ message: 'JobRole fetched successfully', data: standard });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    // Handle unsupported methods
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
