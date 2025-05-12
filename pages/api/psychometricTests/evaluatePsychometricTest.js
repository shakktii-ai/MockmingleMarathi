import connectDb from "@/middleware/dbConnect";
import PsychometricTest from "@/models/PsychometricTest";
import PsychometricResponse from "@/models/PsychometricResponse";
import User from "@/models/User";

// Function to evaluate psychometric test responses with Claude AI
async function evaluateWithClaude(test, responses) {
  try {
    console.log('Evaluating psychometric test responses with Claude');
    
    // Prepare the data for Claude
    const formattedResponses = responses.map(r => {
      const question = test.questions[r.questionIndex];
      const selectedOption = question.options[r.selectedOption];
      
      return {
        scenario: question.scenario,
        selectedOption: selectedOption.text,
        reasoning: r.reasoning || "No reasoning provided"
      };
    });
    
    // Create prompt for Claude
    const prompt = `
      You are evaluating a user's responses to a psychometric test that assesses the following competency areas:
      - Empathy
      - Assertiveness
      - Ethical reasoning
      - Collaboration
      - Conflict resolution
      - Leadership potential

      Here are the user's responses to 10 scenarios:
      ${JSON.stringify(formattedResponses, null, 2)}

      Please provide a comprehensive evaluation of the user's behavioral traits, decision-making style, and professional potential.
      
      Return your response as a JSON object with the following structure:
      {
        "empathy": {
          "score": (number from 0-3),
          "comments": "Brief assessment of empathy skills"
        },
        "assertiveness": {
          "score": (number from 0-3),
          "comments": "Brief assessment of assertiveness skills"
        },
        "ethicalReasoning": {
          "score": (number from 0-3),
          "comments": "Brief assessment of ethical reasoning skills"
        },
        "collaboration": {
          "score": (number from 0-3),
          "comments": "Brief assessment of collaboration skills"
        },
        "conflictResolution": {
          "score": (number from 0-3),
          "comments": "Brief assessment of conflict resolution skills"
        },
        "leadershipPotential": {
          "score": (number from 0-3),
          "comments": "Brief assessment of leadership potential"
        },
        "overallScore": (number from 0-3),
        "analysis": "Comprehensive analysis of decision-making approach (200-300 words)",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "areasToImprove": ["Area 1", "Area 2", "Area 3"],
        "roleFitRecommendations": ["Role 1", "Role 2", "Role 3"]
      }
      
      The scores should be on a 3-star rating system:
      - 0: Needs significant improvement
      - 1: Basic competency
      - 2: Strong competency
      - 3: Exceptional competency
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
          temperature: 0.5,
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

      // Extract JSON object from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Could not find valid JSON object in Claude response');
        throw new Error('Invalid response format');
      }

      try {
        const evaluation = JSON.parse(jsonMatch[0]);
        
        // Validate the evaluation format
        if (!evaluation.empathy || !evaluation.assertiveness || !evaluation.ethicalReasoning ||
            !evaluation.collaboration || !evaluation.conflictResolution || !evaluation.leadershipPotential ||
            !evaluation.overallScore || !evaluation.analysis || !evaluation.strengths ||
            !evaluation.areasToImprove || !evaluation.roleFitRecommendations) {
          throw new Error('Invalid evaluation format');
        }
        
        return evaluation;
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
    console.error("Error evaluating with Claude:", error);
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
    // Get user ID from request body or use default for testing
    const userId = req.body.userId || "6462a8d8f12c6d92f9f1b9e3";
    
    // Get test ID and responses from request body
    const { testId, responses } = req.body;
    
    if (!testId || !responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data. Test ID and responses array are required.' 
      });
    }

    // Skip user verification for testing

    // Find the test
    const test = await PsychometricTest.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }
    
    // Skip authorization check for testing
    // Comment: In production, we would verify the test belongs to the user
    
    // Verify we have responses for all questions
    if (responses.length !== test.questions.length) {
      return res.status(400).json({ 
        success: false, 
        error: `Expected ${test.questions.length} responses, received ${responses.length}` 
      });
    }

    // Evaluate responses with Claude
    const evaluation = await evaluateWithClaude(test, responses);
    
    // Update test as completed
    test.isCompleted = true;
    test.completedAt = new Date();
    await test.save();
    
    // Create response record in database
    const newResponse = new PsychometricResponse({
      userId,
      testId,
      responses,
      results: {
        empathy: evaluation.empathy.score,
        assertiveness: evaluation.assertiveness.score,
        ethicalReasoning: evaluation.ethicalReasoning.score,
        collaboration: evaluation.collaboration.score,
        conflictResolution: evaluation.conflictResolution.score,
        leadershipPotential: evaluation.leadershipPotential.score,
        overallScore: evaluation.overallScore,
        analysis: evaluation.analysis,
        strengths: evaluation.strengths,
        areasToImprove: evaluation.areasToImprove,
        roleFitRecommendations: evaluation.roleFitRecommendations
      },
      completedAt: new Date()
    });

    await newResponse.save();

    return res.status(200).json({
      success: true,
      message: 'Psychometric test evaluated successfully',
      evaluation: {
        empathy: {
          score: evaluation.empathy.score,
          comments: evaluation.empathy.comments
        },
        assertiveness: {
          score: evaluation.assertiveness.score,
          comments: evaluation.assertiveness.comments
        },
        ethicalReasoning: {
          score: evaluation.ethicalReasoning.score,
          comments: evaluation.ethicalReasoning.comments
        },
        collaboration: {
          score: evaluation.collaboration.score,
          comments: evaluation.collaboration.comments
        },
        conflictResolution: {
          score: evaluation.conflictResolution.score,
          comments: evaluation.conflictResolution.comments
        },
        leadershipPotential: {
          score: evaluation.leadershipPotential.score,
          comments: evaluation.leadershipPotential.comments
        },
        overallScore: evaluation.overallScore,
        analysis: evaluation.analysis,
        strengths: evaluation.strengths,
        areasToImprove: evaluation.areasToImprove,
        roleFitRecommendations: evaluation.roleFitRecommendations
      }
    });
  } catch (error) {
    console.error('Error evaluating psychometric test:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate psychometric test',
      message: error.message
    });
  }
}

// Apply database connection middleware only
export default connectDb(handler);
