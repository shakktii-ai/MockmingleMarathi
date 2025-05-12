import connectDb from "@/middleware/dbConnect";
import PsychometricTest from "@/models/PsychometricTest";
import User from "@/models/User";

// Function to generate psychometric test questions with Claude AI
async function generateQuestionsWithClaude() {
  try {
    console.log('Generating psychometric test questions with Claude');
    
    // Create prompt for Claude
    const prompt = `
      Generate a comprehensive 10-question psychometric test that evaluates the following competency areas:
      - Empathy
      - Assertiveness
      - Ethical reasoning
      - Collaboration
      - Conflict resolution
      - Leadership potential

      Each question should:
      1. Present a realistic workplace or social scenario
      2. Offer 4 multiple-choice options representing different approaches
      3. Have options that reflect varying degrees of effectiveness
      4. Include subtle differences that reveal personality traits and decision-making style

      Questions should range from easy to complex difficulty levels.

      Format your response as a JSON array with this structure:
      [
        {
          "scenario": "Detailed scenario description",
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
      Ensure the questions cover all competency areas evenly.
    `;

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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // For testing purposes, use a fixed userId or get it from the request body
    const userId = req.body.userId || "6462a8d8f12c6d92f9f1b9e3"; // Use a default ID for testing

    // Skip user verification for testing
    
    // Check if user already has an incomplete test (optional for testing)
    const existingTest = await PsychometricTest.findOne({ 
      userId, 
      isCompleted: false 
    });

    if (existingTest) {
      return res.status(200).json({ 
        success: true, 
        message: 'Existing incomplete test found',
        test: existingTest 
      });
    }

    // Generate new questions with Claude
    const questions = await generateQuestionsWithClaude();
    console.log(`Successfully generated ${questions.length} psychometric test questions`);

    // Create new test in database
    const newTest = new PsychometricTest({
      userId,
      questions,
      dateCreated: new Date(),
      isCompleted: false
    });

    await newTest.save();

    return res.status(201).json({
      success: true,
      message: 'Psychometric test created successfully',
      test: newTest
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
