import connectDb from "@/middleware/dbConnect";
import PracticeProgress from "@/models/PracticeProgress";
import PracticeResponse from "@/models/PracticeResponse";
import { authMiddleware } from "@/middleware/authMiddleware";

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { skillArea, difficulty, sessionData } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!skillArea || !difficulty || !sessionData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find existing progress record or create new one
    let progressRecord = await PracticeProgress.findOne({
      userId,
      skillArea,
      difficulty
    });

    if (!progressRecord) {
      progressRecord = new PracticeProgress({
        userId,
        skillArea,
        difficulty,
        sessionsCompleted: 0,
        questionsAttempted: 0,
        averageScore: 0,
        highestScore: 0,
        timeSpent: 0,
        strengths: [],
        areasToImprove: []
      });
    }

    // Update progress stats
    progressRecord.sessionsCompleted += 1;
    progressRecord.questionsAttempted += sessionData.questionsAttempted || 0;
    progressRecord.timeSpent += sessionData.timeSpent || 0;
    progressRecord.lastUpdated = new Date();

    // Calculate new average score
    const newSessionScore = sessionData.sessionScore || 0;
    const totalScorePoints = (progressRecord.averageScore * (progressRecord.sessionsCompleted - 1)) + newSessionScore;
    progressRecord.averageScore = totalScorePoints / progressRecord.sessionsCompleted;
    
    // Update highest score if needed
    if (newSessionScore > progressRecord.highestScore) {
      progressRecord.highestScore = newSessionScore;
    }
    
    // Handle level progression system
    const currentLevel = sessionData.level || progressRecord.currentLevel || 1;
    
    // Initialize levelProgress array if it doesn't exist
    if (!progressRecord.levelProgress) {
      progressRecord.levelProgress = [];
    }
    
    // Find the current level's progress record or create it
    let levelProgressRecord = progressRecord.levelProgress.find(lp => lp.level === currentLevel);
    
    if (!levelProgressRecord) {
      levelProgressRecord = {
        level: currentLevel,
        stars: 0,
        questionsCompleted: 0,
        bestScore: 0,
        completed: false
      };
      progressRecord.levelProgress.push(levelProgressRecord);
    }
    
    // Update level progress based on session performance
    levelProgressRecord.questionsCompleted += sessionData.questionsAttempted || 0;
    
    // Update best score if needed
    if (newSessionScore > levelProgressRecord.bestScore) {
      levelProgressRecord.bestScore = newSessionScore;
    }
    
    // Calculate stars based on score (example thresholds)
    let earnedStars = 0;
    if (newSessionScore >= 90) {
      earnedStars = 3; // 3 stars for 90% or above
    } else if (newSessionScore >= 70) {
      earnedStars = 2; // 2 stars for 70-89%
    } else if (newSessionScore >= 50) {
      earnedStars = 1; // 1 star for 50-69%
    }
    
    // Update stars if earned more than current
    if (earnedStars > levelProgressRecord.stars) {
      // Calculate additional stars earned
      const additionalStars = earnedStars - levelProgressRecord.stars;
      progressRecord.totalStarsEarned += additionalStars;
      levelProgressRecord.stars = earnedStars;
    }
    
    // Mark level as completed if earned at least 1 star and not already completed
    if (earnedStars > 0 && !levelProgressRecord.completed) {
      levelProgressRecord.completed = true;
      levelProgressRecord.completedAt = new Date();
      
      // If this is the current level and it's completed, advance to next level if not at max
      if (currentLevel === progressRecord.currentLevel && progressRecord.currentLevel < 30) {
        progressRecord.currentLevel += 1;
      }
    }

    // Analyze strengths and areas to improve based on user responses
    const responses = await PracticeResponse.find({
      userId,
      'testId': { $in: sessionData.testIds || [] }
    }).sort({ createdAt: -1 }).limit(50);

    // Use Claude API to analyze responses and identify strengths/areas to improve
    if (responses.length > 0) {
      const analysis = await analyzeResponses(responses, skillArea);
      
      if (analysis && analysis.strengths && analysis.areasToImprove) {
        // Keep only unique strengths and areas to improve (max 5 of each)
        const allStrengths = [...new Set([...progressRecord.strengths, ...analysis.strengths])].slice(0, 5);
        const allAreasToImprove = [...new Set([...progressRecord.areasToImprove, ...analysis.areasToImprove])].slice(0, 5);
        
        progressRecord.strengths = allStrengths;
        progressRecord.areasToImprove = allAreasToImprove;
      }
    }

    await progressRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      progress: progressRecord
    });
  } catch (error) {
    console.error('Error updating practice progress:', error);
    return res.status(500).json({ error: 'Server error processing progress update' });
  }
}

// Function to analyze responses using Claude API
async function analyzeResponses(responses, skillArea) {
  const url = 'https://api.anthropic.com/v1/messages';

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };

  // Prepare the responses data for analysis
  const responsesData = responses.map(r => ({
    question: r.cardId,
    response: r.userResponse,
    score: r.score
  }));

  const prompt = `As a language assessment expert, please analyze the following ${skillArea} responses from a student:

${JSON.stringify(responsesData, null, 2)}

Based on these responses, identify:
1. 3-5 specific strengths this student demonstrates
2. 3-5 specific areas where the student could improve

Return your analysis in JSON format only, like this:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"]
}`;

  const payload = {
    model: "claude-3-haiku-20240307",
    max_tokens: 500,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (response.ok && responseData?.content?.[0]?.text) {
      // Extract the JSON from the response
      const jsonContent = responseData.content[0].text;
      const jsonMatch = jsonContent.match(/\{.*\}/s);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        return JSON.parse(jsonString);
      }
    }
    
    console.error('Claude API error or invalid format:', responseData);
    return {
      strengths: ["Good effort", "Active participation", "Consistent practice"],
      areasToImprove: ["Continue practicing", "Focus on more complex topics", "Review feedback"]
    };
  } catch (error) {
    console.error('Error calling Claude API for response analysis:', error);
    return null;
  }
}

export default authMiddleware(connectDb(handler));
