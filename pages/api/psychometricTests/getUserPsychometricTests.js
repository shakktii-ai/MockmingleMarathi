import connectDb from "@/middleware/dbConnect";
import PsychometricTest from "@/models/PsychometricTest";
import PsychometricResponse from "@/models/PsychometricResponse";

async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get user ID from query parameters or use default for testing
    const userId = req.query.userId || "6462a8d8f12c6d92f9f1b9e3";

    // Find all tests for this user
    const tests = await PsychometricTest.find({ userId })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .lean(); // Convert to plain JavaScript objects

    // Find all responses for this user
    const responses = await PsychometricResponse.find({ userId })
      .sort({ completedAt: -1 }) // Sort by completion date, newest first
      .lean();

    // Combine tests with their responses
    const testsWithResponses = tests.map(test => {
      const testResponse = responses.find(r => r.testId.toString() === test._id.toString());
      return {
        ...test,
        response: testResponse || null
      };
    });

    return res.status(200).json({
      success: true,
      tests: testsWithResponses
    });
  } catch (error) {
    console.error('Error fetching psychometric tests:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch psychometric tests',
      message: error.message
    });
  }
}

// Apply database connection middleware only
export default connectDb(handler);
