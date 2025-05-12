import connectDb from "@/middleware/dbConnect";
import PsychometricTest from "@/models/PsychometricTest";
import User from "@/models/User";



export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

// Function to generate psychometric test questions with Claude AI
async function generateQuestionsWithClaude(profileType = 'employee') {
  try {
    console.log('Generating psychometric test questions with Claude');
    
    // Create prompt for Claude based on profile type
    let prompt;
    
    if (profileType === 'student') {
      prompt = `
        Generate a comprehensive 10-question psychometric test specifically designed for students that evaluates the following competency areas:
        - Academic collaboration
        - Learning environment ethics
        - Educational leadership
        - Study group dynamics
        - Academic conflict resolution
        - Classroom participation

        Each question should:
        1. Present a realistic academic or educational scenario that students commonly face
        2. Offer 4 multiple-choice options representing different approaches
        3. Have options that reflect varying degrees of effectiveness
        4. Include subtle differences that reveal personality traits and decision-making style in educational contexts

        Questions should range from easy to complex difficulty levels and be relevant to educational environments.

        Format your response as a JSON array with this structure:
        [
          {
            "scenario": "Detailed scenario description in an educational context",
            "options": [
              {"text": "Option A description", "value": 3},
              {"text": "Option B description", "value": 2},
              {"text": "Option C description", "value": 1},
              {"text": "Option D description", "value": 0}
            ],
            "difficulty": "Easy|Moderate|Complex"
          },
          ...more questions
        ]

        The "value" for each option should represent its effectiveness (3 = most effective, 0 = least effective).
        Ensure the questions cover all competency areas evenly and are appropriate for students in high school or college settings.
      `;
    } else {
      // Default to employee/professional profile
      prompt = `
        Generate a comprehensive 10-question psychometric test for working professionals that evaluates the following competency areas:
        - Workplace dynamics
        - Professional ethics
        - Management potential
        - Team collaboration
        - Workplace conflict resolution
        - Professional leadership

        Each question should:
        1. Present a realistic workplace scenario that professionals commonly face
        2. Offer 4 multiple-choice options representing different approaches
        3. Have options that reflect varying degrees of effectiveness
        4. Include subtle differences that reveal personality traits and decision-making style in professional contexts

        Questions should range from easy to complex difficulty levels and be relevant to modern workplace environments.

        Format your response as a JSON array with this structure:
        [
          {
            "scenario": "Detailed scenario description in a workplace context",
            "options": [
              {"text": "Option A description", "value": 3},
              {"text": "Option B description", "value": 2},
              {"text": "Option C description", "value": 1},
              {"text": "Option D description", "value": 0}
            ],
            "difficulty": "Easy|Moderate|Complex"
          },
          ...more questions
        ]

        The "value" for each option should represent its effectiveness (3 = most effective, 0 = least effective).
        Ensure the questions cover all competency areas evenly and are appropriate for professional workplace settings.
      `;
    }

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Claude API key is missing');
      throw new Error('API key is missing');
    }

    try {
      // Call Claude API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 4000,
          temperature: 0.7,
          messages: [{
            role: "user",
            content: prompt
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error response:', errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      if (!result.content || !result.content[0] || !result.content[0].text) {
        console.error('Unexpected Claude API response structure:', JSON.stringify(result));
        throw new Error('Invalid API response format');
      }

      const textResponse = result.content[0].text;
      console.log('Claude response received, length:', textResponse.length);

      // Extract JSON array from the response
      const jsonMatch = textResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        console.error('Could not find valid JSON array in Claude response');
        throw new Error('Invalid response format');
      }

      try {
        const questions = JSON.parse(jsonMatch[0]);
        
        // Validate the questions format
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('Invalid questions format');
        }

        // Ensure we have 10 questions
        const validQuestions = questions.slice(0, 10);
        
        return validQuestions;
      } catch (parseError) {
        console.error('Error parsing Claude response as JSON:', parseError);
        throw new Error('Failed to parse response');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  } catch (error) {
    console.error("Error generating questions with Claude:", error);
    throw error;
  }
}

// API handler
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId, profileType } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Default to employee if no profileType is provided
    const testProfileType = profileType || 'employee';

    // Skip user verification for testing
    
    // Find existing test for user
    const existingTest = await PsychometricTest.findOne({ 
      userId, 
      completed: false,
      profileType: testProfileType
    }).sort({ startTime: -1 });

    if (existingTest) {
      return res.status(200).json({ 
        success: true, 
        message: 'Existing psychometric test found',
        test: {
          _id: existingTest._id,
          profileType: existingTest.profileType,
          questions: existingTest.questions,
          startTime: existingTest.startTime
        }
      });
    }

    // Generate questions with Claude AI based on profile type
    const questions = await generateQuestionsWithClaude(testProfileType);

    // Create a new test document
    const newTest = new PsychometricTest({
      userId,
      profileType: testProfileType,
      questions,
      startTime: new Date(),
      completed: false
    });

    await newTest.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Psychometric test generated successfully',
      test: {
        _id: newTest._id,
        profileType: newTest.profileType,
        questions: newTest.questions,
        startTime: newTest.startTime
      }
    });
  } catch (error) {
    console.error('Error generating psychometric test:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate psychometric test',
      message: error.message
    });
  }
}

// Apply database connection middleware only
export default connectDb(handler);
