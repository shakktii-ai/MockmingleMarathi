import connectDb from '@/middleware/dbConnect';
import AssessmentReport from '@/models/AssessmentReport';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    try {
        const history = await AssessmentReport.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Error fetching assessment history:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
}

export default connectDb(handler);
