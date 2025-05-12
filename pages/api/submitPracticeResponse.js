import connectDb from "@/middleware/dbConnect";
import PracticeResponse from "@/models/PracticeResponse";
import PracticeProgress from "@/models/PracticeProgress";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Get token from request header (but don't fail if no token)
  const token = req.headers.authorization?.split(' ')[1];
  
  // Try to decode token if present, use a default user ID if not
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret');
      req.user = decoded;
    } catch (error) {
      console.log('Token verification failed, using default user ID');
      req.user = { id: '6462d8fbf6c3e30000000001' }; // Default user ID for testing
    }
  } else {
    // If no token provided, use a default user ID
    req.user = { id: '6462d8fbf6c3e30000000001' }; // Default user ID for testing
  }

  try {
    const { testId, cardId, userResponse, score, timeSpent, userId: bodyUserId, skillArea, difficulty, level } = req.body;
    // Use userId from body if provided, otherwise use from token, or default
    const userId = bodyUserId || req.user?.id || '6462d8fbf6c3e30000000001';
    
    // Only require cardId and userResponse
    if (!cardId || !userResponse) {
      return res.status(400).json({ error: 'Missing required fields: cardId and userResponse are required' });
    }
    
    // Log the request for debugging
    console.log('Received practice response:', { userId, cardId, userResponse });

    // Always use a valid ObjectId for testId
    let validTestId;
    try {
      // If the provided testId is a valid MongoDB ObjectId, use it
      if (testId && testId.match(/^[0-9a-fA-F]{24}$/) && mongoose.Types.ObjectId.isValid(testId)) {
        validTestId = testId;
      } 
      // If a hex string of correct length is provided but not valid, convert it
      else if (testId && testId.match(/^[0-9a-fA-F]{24}$/)) {
        validTestId = new mongoose.Types.ObjectId(testId).toString();
      }
      // If the testId is in our client-generated format (timestamp + random)
      else if (testId && testId.length === 24 && testId.match(/^[0-9a-fA-F]+$/)) {
        // It looks like a valid hex string, so we can try to use it directly
        validTestId = testId;
      } 
      // Otherwise generate a new ObjectId
      else {
        console.log('Generating new ObjectId for practice response. Original value:', testId);
        validTestId = new mongoose.Types.ObjectId().toString();
      }
    } catch (error) {
      console.error('Error validating testId:', error);
      validTestId = '6462d8fbf6c3e30000000001'; // Default ObjectId
    }
    
    // Save response to database with validated testId
    const practiceResponse = new PracticeResponse({
      userId,
      testId: validTestId,
      cardId, // Store the original cardId as a string
      userResponse,
      score: score || 1, // Default to 1 star if not provided
      timeSpent: timeSpent || 0,
      completedAt: new Date()
    });

    await practiceResponse.save();

    // Calculate a score between 1-3 based on response length and complexity
    // This is a simple scoring mechanism that you can improve later with more sophisticated criteria
    let calculatedScore = 1; // Default minimum score
    
    // Basic scoring criteria based on response length
    if (userResponse && userResponse.trim()) {
      const wordCount = userResponse.trim().split(/\s+/).length;
      
      if (wordCount >= 15) {
        calculatedScore = 3; // Excellent - longer, more detailed response
      } else if (wordCount >= 8) {
        calculatedScore = 2; // Good - moderate length response
      } else {
        calculatedScore = 1; // Needs improvement - very short response
      }
    }
    
    // Generate AI feedback for the response using our calculated score
    const feedback = await generateFeedback(userResponse, calculatedScore);

    // Update the response with feedback and the calculated score
    practiceResponse.feedbackResponse = feedback;
    practiceResponse.score = calculatedScore; // Update the score in the database
    await practiceResponse.save();

    // Extract skill area from card ID if not provided
    const detectedSkillArea = skillArea || getSkillAreaFromCardId(cardId) || 'Listening';
    const detectedDifficulty = difficulty || getDifficultyFromCardId(cardId) || 'Beginner';
    const detectedLevel = level || getLevelFromCardId(cardId) || 1;
    
    console.log('Practice response details:', {
      skillArea: detectedSkillArea,
      difficulty: detectedDifficulty,
      level: detectedLevel,
      score: calculatedScore,
      timeSpent: timeSpent || 60
    });
    
    // Update progress data
    await updatePracticeProgress(
      userId,
      detectedSkillArea,
      detectedDifficulty,
      calculatedScore,
      timeSpent || 60, // Default time if not provided
      detectedLevel
    );

    return res.status(200).json({
      success: true,
      message: 'Response submitted successfully',
      feedback,
      score: calculatedScore // Send the calculated score in the response
    });
  } catch (error) {
    console.error('Error submitting practice response:', error);
    return res.status(500).json({ error: 'Server error processing response' });
  }
}

// Function to generate feedback using Claude API
async function generateFeedback(userResponse, score) {
  const url = 'https://api.anthropic.com/v1/messages';

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };

  const prompt = `As a language assessment AI, provide constructive and encouraging feedback for this student response:
  
  Student response: "${userResponse}"
  Current assessment: ${score} out of 3 stars
  
  Give specific, actionable feedback in 2-3 sentences that would help the student improve.`;

  const payload = {
    model: "claude-3-haiku-20240307",
    max_tokens: 150,
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
      return responseData.content[0].text.trim();
    } else {
      console.error('Claude API error for feedback:', responseData);
      return "Thank you for your response. Keep practicing to improve your skills.";
    }
  } catch (error) {
    console.error('Error calling Claude API for feedback:', error);
    return "Thank you for your response. Keep practicing to improve your skills.";
  }
}

// Function to update practice progress
async function updatePracticeProgress(userId, skillArea, difficulty, score, timeSpent, level) {
  try {
    console.log(`Updating practice progress for user ${userId}, skill ${skillArea}, difficulty ${difficulty}, level ${level}`);
    
    // Find existing progress record or create a new one
    let progressRecord = await PracticeProgress.findOne({
      userId,
      skillArea,
      difficulty
    });
    
    if (!progressRecord) {
      // Create a new progress record with default level progression
      console.log('Creating new progress record');
      progressRecord = new PracticeProgress({
        userId,
        skillArea,
        difficulty,
        sessionsCompleted: 0,
        questionsAttempted: 0,
        averageScore: 0,
        timeSpent: 0,
        currentLevel: 1,
        totalStarsEarned: 0,
        levelProgress: [{
          level: 1,
          stars: 0,
          questionsCompleted: 0,
          completed: false
        }]
      });
    }
    
    // Ensure level progress exists for the current level
    const levelIndex = progressRecord.levelProgress.findIndex(lp => lp.level === parseInt(level));
    if (levelIndex === -1) {
      // Add this level to the progress
      progressRecord.levelProgress.push({
        level: parseInt(level),
        stars: 0,
        questionsCompleted: 0,
        completed: false
      });
    }
    
    // Update the level progress
    const levelProgressIndex = progressRecord.levelProgress.findIndex(lp => lp.level === parseInt(level));
    if (levelProgressIndex !== -1) {
      // Increment completed questions count
      progressRecord.levelProgress[levelProgressIndex].questionsCompleted++;
      
      // Update stars if new score is higher
      if (score > progressRecord.levelProgress[levelProgressIndex].stars) {
        // Calculate stars earned from previous score
        const prevStars = progressRecord.levelProgress[levelProgressIndex].stars || 0;
        const newStars = Math.min(3, score); // Max 3 stars
        
        // Add the difference to the total stars
        progressRecord.totalStarsEarned += (newStars - prevStars);
        
        // Update the stars for this level
        progressRecord.levelProgress[levelProgressIndex].stars = newStars;
      }
      
      // Mark as completed if 5 or more questions completed
      if (progressRecord.levelProgress[levelProgressIndex].questionsCompleted >= 5) {
        progressRecord.levelProgress[levelProgressIndex].completed = true;
        progressRecord.levelProgress[levelProgressIndex].completedAt = new Date();
        
        // Mark next level as unlocked if not already
        if (parseInt(level) < 30) { // Maximum 30 levels
          const nextLevelIndex = progressRecord.levelProgress.findIndex(lp => lp.level === parseInt(level) + 1);
          if (nextLevelIndex === -1) {
            // Add the next level
            progressRecord.levelProgress.push({
              level: parseInt(level) + 1,
              stars: 0,
              questionsCompleted: 0,
              completed: false
            });
          }
        }
        
        // Update current level if completed current level
        if (parseInt(level) === progressRecord.currentLevel) {
          progressRecord.currentLevel = Math.min(30, parseInt(level) + 1);
        }
      }
    }
    
    // Update overall progress metrics
    progressRecord.sessionsCompleted++;
    progressRecord.questionsAttempted++;
    progressRecord.timeSpent += timeSpent;
    
    // Update average score
    const oldTotal = progressRecord.averageScore * (progressRecord.questionsAttempted - 1);
    progressRecord.averageScore = (oldTotal + score) / progressRecord.questionsAttempted;
    
    // Update highest score if needed
    if (score > progressRecord.highestScore) {
      progressRecord.highestScore = score;
    }
    
    // Update timestamp
    progressRecord.lastUpdated = new Date();
    
    // Save the updated progress
    await progressRecord.save();
    console.log('Updated practice progress successfully');
  } catch (error) {
    console.error('Error updating practice progress:', error);
  }
}

// Helper function to determine skill area from card ID
function getSkillAreaFromCardId(cardId) {
  if (!cardId) return 'Listening';
  
  const cardIdLower = cardId.toString().toLowerCase();
  if (cardIdLower.includes('speak')) return 'Speaking';
  if (cardIdLower.includes('listen')) return 'Listening';
  if (cardIdLower.includes('read')) return 'Reading';
  if (cardIdLower.includes('writ')) return 'Writing';
  if (cardIdLower.includes('person')) return 'Personality';
  
  // Default to Listening if unknown
  return 'Listening';
}

// Helper function to determine difficulty from card ID
function getDifficultyFromCardId(cardId) {
  if (!cardId) return 'Beginner';
  
  const cardIdLower = cardId.toString().toLowerCase();
  if (cardIdLower.includes('expert')) return 'Expert';
  if (cardIdLower.includes('moderate')) return 'Moderate';
  if (cardIdLower.includes('beginner')) return 'Beginner';
  
  // Default to Beginner if unknown
  return 'Beginner';
}

// Helper function to determine level from card ID
function getLevelFromCardId(cardId) {
  if (!cardId) return 1;
  
  // Try to extract level number from the card ID
  const levelMatch = cardId.toString().match(/level[_-]?(\d+)/i);
  if (levelMatch && levelMatch[1]) {
    return parseInt(levelMatch[1]);
  }
  
  // Default to level 1 if no level found
  return 1;
}

export default connectDb(handler);
