import connectDb from "@/middleware/dbConnect";
import PracticeTest from "@/models/PracticeTest";
import jwt from 'jsonwebtoken';

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

/**
 * API handler for fetching practice questions
 * Uses Claude API to generate questions if not enough exist in the database
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  
  const { skillArea, difficulty, count = 5, level = 1 } = req.body;

  if (!skillArea || !difficulty) {
    return res.status(400).json({ success: false, error: 'Skill area and difficulty are required.' });
  }
  
  // Validate level is a number between 1 and 30
  const levelNum = parseInt(level, 10);
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 30) {
    return res.status(400).json({ success: false, error: 'Level must be a number between 1 and 30.' });
  }

  try {
    // Check if we already have enough questions for this skill/difficulty and level
    const existingQuestions = await PracticeTest.find({ 
      skillArea: skillArea,
      difficulty: difficulty,
      level: levelNum // Include level in the query
    }).limit(count);

    if (existingQuestions.length >= count) {
      // Return random selection if we have enough
      const randomQuestions = existingQuestions.sort(() => 0.5 - Math.random()).slice(0, count);
      return res.status(200).json({
        success: true,
        message: 'Questions fetched successfully.',
        questions: randomQuestions,
      });
    }

    // If we don't have enough, generate new questions with Claude API
    let newQuestions = null;
    let retryAttempts = 0;
    const maxRetries = 2; // Maximum number of retries
    
    // Try to get questions from Claude API with retries
    while (retryAttempts <= maxRetries && !newQuestions) {
      try {
        if (retryAttempts > 0) {
          console.log(`Claude API retry attempt ${retryAttempts} of ${maxRetries}...`);
        }
        newQuestions = await generatePracticeQuestions(skillArea, difficulty, levelNum, count - existingQuestions.length, retryAttempts);
        if (newQuestions && newQuestions.length > 0) {
          console.log('Successfully generated questions from Claude API');
          break;
        }
      } catch (apiError) {
        console.error(`Claude API attempt ${retryAttempts + 1} failed:`, apiError);
      }
      retryAttempts++;
    }
    
    // If all API attempts fail, return an error - no fallback to mock data
    if (!newQuestions) {
      return res.status(503).json({ 
        success: false, 
        error: 'Failed to generate practice questions from API after multiple attempts. Please try again later.' 
      });
    }

    // Save new questions to database
    const formattedQuestions = newQuestions.map(q => {
      // Ensure the level is included in each question
      if (!q.level) {
        q.level = levelNum;
      }
      // Properly format evaluationCriteria based on the response structure
      let formattedEvalCriteria;
      
      if (Array.isArray(q.evaluationCriteria)) {
        // Handle array format from Claude API response
        formattedEvalCriteria = {
          basic: q.evaluationCriteria[0] || "Basic level performance",
          intermediate: q.evaluationCriteria[1] || "Intermediate level performance",
          advanced: q.evaluationCriteria[2] || "Advanced level performance"
        };
      } else if (typeof q.evaluationCriteria === 'object') {
        // Handle object format from existing structure
        formattedEvalCriteria = {
          basic: q.evaluationCriteria.basic || "Basic level performance",
          intermediate: q.evaluationCriteria.intermediate || "Intermediate level performance",
          advanced: q.evaluationCriteria.advanced || "Advanced level performance"
        };
      } else {
        // Fallback if structure is unexpected
        formattedEvalCriteria = {
          basic: "Basic level performance",
          intermediate: "Intermediate level performance",
          advanced: "Advanced level performance"
        };
      }
      
      return {
        cardId: q.cardId || `${skillArea.charAt(0)}-${difficulty.charAt(0)}-${Math.floor(Math.random() * 1000)}`,
        skillArea: skillArea,
        difficulty: difficulty,
        instructions: q.instructions || "Complete this practice exercise.",
        content: q.content || "Sample content for practice",
        expectedResponse: q.expectedResponse || "",
        options: q.options || [],
        timeLimit: q.timeLimit || 60,
        evaluationCriteria: formattedEvalCriteria,
        imageUrl: q.imageUrl || "",
        audioUrl: q.audioUrl || "",
      };
    });

    // Try to save questions to database, but don't fail the whole request if this errors
    try {
      await PracticeTest.insertMany(formattedQuestions);
      console.log(`Successfully saved ${formattedQuestions.length} new questions to database`);
    } catch (dbError) {
      console.error('Error saving questions to database:', dbError);
      // Continue with the request even if saving fails
    }
    
    // Return combination of existing and new questions
    const allQuestions = [...existingQuestions, ...formattedQuestions];
    const randomSelection = allQuestions.sort(() => 0.5 - Math.random()).slice(0, count);

    return res.status(200).json({
      success: true,
      message: 'Questions generated and fetched successfully.',
      questions: randomSelection,
    });
  } catch (error) {
    console.error('Error processing practice questions:', error);
    return res.status(500).json({ success: false, error: 'Error during question processing.' });
  }
}

/**
 * Function to generate practice questions using the Claude API
 * @param {string} skillArea - The skill area for the questions (Speaking, Listening, etc.)
 * @param {string} difficulty - The difficulty level (Beginner, Moderate, Expert)
 * @param {number} level - The specific level number (1-30) within the difficulty tier
 * @param {number} count - Number of questions to generate
 * @param {number} retryAttempt - Current retry attempt number
 * @returns {Promise<Array>} - Array of practice question objects
 */
async function generatePracticeQuestions(skillArea, difficulty, level, count, retryAttempt = 0) {
  const url = 'https://api.anthropic.com/v1/messages';

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };

  // Create prompt based on skill area, difficulty, and specific level, adjusting for retry attempts
  let prompt = `Generate ${count} ${difficulty} level ${skillArea} assessment cards for language testing at level ${level} (out of 30 levels).

For each card, include:
- Card ID (format: first letter of skill area-first letter of difficulty level-${level.toString().padStart(2, '0')}-number)
- Instructions
- Content (text or audio)
- Expected Response (if applicable)
- Time Limit (in seconds)
- Evaluation Criteria (three levels: basic, intermediate, advanced)

IMPORTANT: 
1. These questions are for level ${level} out of 30 levels, so adjust the difficulty appropriately. Level 1 should be the easiest, and level 30 the most challenging within the ${difficulty} tier.
2. Your response must be ONLY a valid JSON array, with no explanations, no markdown formatting, and no additional text. Just return the JSON array directly:
[
  {
    "cardId": "S-B-${level.toString().padStart(2, '0')}-01",
    "instructions": "Listen to the audio and repeat the word.",
    "content": "Audio of the word 'Apple'",
    "expectedResponse": "Apple",
    "timeLimit": 5,
    "level": ${level},
    "evaluationCriteria": [
      "Basic pronunciation with significant errors",
      "Clear pronunciation with minor errors",
      "Perfect pronunciation of the word"
    ]
  }
]
  
  Be creative and varied with the questions, ensuring they properly test ${skillArea} skills at ${difficulty} level ${level}/30. Make sure the questions are appropriate for this specific level - they should get progressively more challenging as levels increase.`;
  
  // Add additional instruction for retry attempts to improve chances of success
  if (retryAttempt > 0) {
    prompt += `\n\nThis is retry attempt #${retryAttempt}. Previous attempts failed to generate valid JSON. PLEASE ONLY RETURN A VALID JSON ARRAY WITH NO EXPLANATIONS OR OTHER TEXT. DO NOT INCLUDE CODE BLOCKS, MARKDOWN FORMATTING, OR ANY TEXT OUTSIDE THE JSON ARRAY.`;
  }

  const payload = {
    model: "claude-3-haiku-20240307",
    max_tokens: 2000,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  try {
    console.log(`Attempting to generate ${count} ${difficulty} ${skillArea} questions from Claude API (attempt ${retryAttempt + 1})`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
console.log("responseData",responseData);
    if (response.ok && responseData?.content?.[0]?.text) {
      const jsonContent = responseData.content[0].text;
      
      // Log only the first 100 characters of the response to avoid console pollution
      console.log(`Claude response (preview): ${jsonContent.substring(0, 100)}...`);
      
      // Strategy 1: Try to parse the entire response directly
      try {
        const parsedData = JSON.parse(jsonContent.trim());
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log(`Successfully parsed full Claude response directly as JSON array with ${parsedData.length} items`);
          return parsedData;
        }
      } catch (directParseErr) {
        console.log('Direct JSON parse failed, trying extraction methods');
      }
      
      // Strategy 2: Try to extract JSON from markdown code blocks
      const codeBlockMatches = jsonContent.match(/```(?:json)?([\s\S]*?)```/g);
      if (codeBlockMatches && codeBlockMatches.length > 0) {
        for (const block of codeBlockMatches) {
          try {
            // Extract content between code block markers and parse
            const codeContent = block.replace(/```(?:json)?|```/g, '').trim();
            const parsedData = JSON.parse(codeContent);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log(`Successfully extracted JSON from code block with ${parsedData.length} items`);
              return parsedData;
            }
          } catch (blockErr) {
            console.log('Failed to parse code block as JSON, trying next block');
          }
        }
      }
      
      // Strategy 3: Try to find JSON array pattern with [ ... ] brackets
      try {
        // Find all content between square brackets including nested brackets
        // This more complex regex tries to match complete JSON arrays
        const regex = /\[(\s*\{[\s\S]*?\}\s*(?:,\s*\{[\s\S]*?\}\s*)*)?\]/g;
        const arrayMatches = jsonContent.match(regex);
        
        if (arrayMatches && arrayMatches.length > 0) {
          // Try each match until we find valid JSON
          for (const match of arrayMatches) {
            try {
              // Check if this looks like a JSON array with objects
              if (match.includes('{') && match.includes('}')) {
                const parsedData = JSON.parse(match);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                  console.log(`Successfully extracted JSON array with bracket matching: ${parsedData.length} items`);
                  return parsedData;
                }
              }
            } catch (err) {
              // Continue to next match if parsing fails
              console.log('Failed to parse potential JSON match');
            }
          }
        }
        
        // Strategy 4: Last resort - try to build the JSON manually by looking for key patterns
        console.log('Attempting to manually reconstruct JSON from text');
        if (jsonContent.includes('"cardId"') && jsonContent.includes('"instructions"')) {
          const manualMatches = jsonContent.match(/\{[\s\S]*?"cardId"[\s\S]*?\}/g);
          if (manualMatches && manualMatches.length > 0) {
            try {
              // Build a JSON array from the individual object matches
              const reconstructed = `[${manualMatches.join(',')}]`;
              const parsedData = JSON.parse(reconstructed);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log(`Successfully reconstructed JSON array manually with ${parsedData.length} items`);
                return parsedData;
              }
            } catch (reconstructErr) {
              console.log('Failed to reconstruct JSON manually');
            }
          }
        }
        
        // If all extraction methods fail, return null to trigger a retry
        console.log('All JSON extraction methods failed');
        return null;
      } catch (jsonError) {
        console.error('JSON extraction error:', jsonError);
        throw new Error(`Failed to extract JSON from Claude API response: ${jsonError.message}`);
      }
    } else {
      console.error('Claude API error:', responseData);
      throw new Error(`Claude API returned an error: ${responseData?.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error(`Failed to connect to Claude API: ${error.message}`);
  }
}

// TEMPORARY: Simplified auth function that bypasses token verification completely
const flexibleAuth = (handler) => async (req, res) => {
  try {
    // TEMPORARY FIX: Skip token verification entirely
    console.warn('Auth temporarily disabled - using default user ID');
    
    // Extract userId from body if present
    const userId = req.body?.userId || '6462d8fbf6c3e30000000001';
    
    // Set user object without token verification
    req.user = { id: userId };
    
    // Log for debugging
    console.log('Using userId for practice questions:', userId);
    
    /* ORIGINAL AUTH CODE - TEMPORARILY DISABLED
    // Get token from request header
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (token) {
      try {
        // Verify token if provided
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret');
        // Add user data to request
        req.user = decoded;
      } catch (error) {
        console.warn('Token verification failed, proceeding without authentication');
        // Continue without authentication
        req.user = { id: '6462d8fbf6c3e30000000001' }; // Default user ID for testing
      }
    } else {
      console.warn('No authentication token provided, proceeding with default user');
      // Use a default user ID for testing
      req.user = { id: '6462d8fbf6c3e30000000001' };
    }
    */
    
    // Call the original handler
    return handler(req, res);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Export the handler with flexible authentication
export default flexibleAuth(connectDb(handler));

// For testing purposes only - remove in production
// export default connectDb(handler);
