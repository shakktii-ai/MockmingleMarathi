import connectDb from "@/middleware/dbConnect";
import PsychometricTest from "@/models/PsychometricTest";
import PsychometricResponse from "@/models/PsychometricResponse";
import User from "@/models/User";


export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

// Function to safely parse JSON with fallback
function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return fallback;
  }
}

// Function to extract JSON from Claude's response
function extractJsonFromResponse(text) {
  if (!text) return null;
  
  // Try to find JSON in code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    const parsed = safeJsonParse(codeBlockMatch[1]);
    if (parsed) return parsed;
  }
  
  // Try to find raw JSON object
  try {
    // First try to parse the entire response as JSON
    const parsed = safeJsonParse(text);
    if (parsed) return parsed;
    
    // If that fails, try to find a JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      // Clean up potential JSON syntax errors
      let jsonStr = jsonMatch[0]
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .replace(/,([^,]*)$/, '$1') // Remove trailing comma if any
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure proper JSON keys
        .replace(/'/g, '"'); // Replace single quotes with double quotes
      
      // Try to parse the cleaned JSON
      const cleanedParsed = safeJsonParse(jsonStr);
      if (cleanedParsed) return cleanedParsed;
    }
  } catch (e) {
    console.error('Error parsing JSON from response:', e);
  }
  
  return null;
}

// Helper function to ensure score objects have the right structure
function ensureScoreObject(scoreObj) {
  if (!scoreObj || typeof scoreObj !== 'object') {
    return { score: 2, comments: 'Evaluation not available' };
  }
  return {
    score: typeof scoreObj.score === 'number' ? Math.max(0, Math.min(3, scoreObj.score)) : 2,
    comments: typeof scoreObj.comments === 'string' ? scoreObj.comments : 'Evaluation not available'
  };
}

// Helper function to calculate overall score from individual competencies
function calculateOverallScore(evaluation, defaultValue = 2) {
  try {
    const scores = [
      evaluation.empathy?.score,
      evaluation.assertiveness?.score,
      evaluation.ethicalReasoning?.score,
      evaluation.collaboration?.score,
      evaluation.conflictResolution?.score,
      evaluation.leadershipPotential?.score
    ].filter(score => typeof score === 'number');
    
    if (scores.length === 0) return defaultValue;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  } catch (e) {
    console.error('Error calculating overall score:', e);
    return defaultValue;
  }
}

// Function to create a fallback evaluation when Claude response is incomplete
function createFallbackEvaluation(profileType) {
  try {
    const defaultScore = 2; // Middle score
    const defaultComment = "Our system is currently experiencing high demand. Here's a preliminary assessment based on your responses.";
    
    const commonEvaluation = {
      empathy: { score: defaultScore, comments: defaultComment },
      assertiveness: { score: defaultScore, comments: defaultComment },
      ethicalReasoning: { score: defaultScore, comments: defaultComment },
      collaboration: { score: defaultScore, comments: defaultComment },
      conflictResolution: { score: defaultScore, comments: defaultComment },
      leadershipPotential: { score: defaultScore, comments: defaultComment },
      overallScore: defaultScore,
      analysis: "This is an automatically generated analysis. For a more detailed evaluation, please try again later.",
      strengths: ["Communication skills", "Problem-solving ability", "Adaptability"],
      areasToImprove: ["Time management", "Team collaboration", "Self-assessment"],
      isFallback: true
    };

    if (profileType === 'student') {
      return {
        ...commonEvaluation,
        recommendedLearningStyles: ["Visual learning", "Practical application", "Group study"],
        academicPathRecommendations: ["Consider peer tutoring", "Join study groups", "Seek hands-on learning opportunities"]
      };
    } else {
      return {
        ...commonEvaluation,
        careerPathRecommendations: ["Project management", "Team leadership", "Specialized technical role"],
        roleFitRecommendations: ["Team lead", "Project coordinator", "Technical specialist"]
      };
    }
  } catch (error) {
    console.error('Error in createFallbackEvaluation:', error);
    // Return a minimal valid evaluation as a last resort
    return {
      empathy: { score: 2, comments: 'Evaluation not available' },
      assertiveness: { score: 2, comments: 'Evaluation not available' },
      ethicalReasoning: { score: 2, comments: 'Evaluation not available' },
      collaboration: { score: 2, comments: 'Evaluation not available' },
      conflictResolution: { score: 2, comments: 'Evaluation not available' },
      leadershipPotential: { score: 2, comments: 'Evaluation not available' },
      overallScore: 2,
      analysis: 'An error occurred while generating your evaluation. Please try again later.',
      strengths: [],
      areasToImprove: [],
      ...(profileType === 'student' ? {
        recommendedLearningStyles: [],
        academicPathRecommendations: []
      } : {
        careerPathRecommendations: [],
        roleFitRecommendations: []
      })
    };
  }
}

// Function to evaluate psychometric test responses with Claude AI
async function evaluateWithClaude(test, responses, profileType = 'employee') {
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
    
    // Create prompt for Claude based on profile type
    let prompt;
    
    if (profileType === 'student') {
      prompt = `
        You are evaluating a student's responses to a psychometric test that assesses the following core competencies:
        - Empathy: Ability to understand and share the feelings of others
        - Assertiveness: Confidence in expressing thoughts and needs while respecting others
        - Ethical Reasoning: Ability to identify and analyze ethical issues and make principled decisions
        - Collaboration: Working effectively with others to achieve common goals
        - Conflict Resolution: Managing and resolving disagreements constructively
        - Leadership Potential: Capacity to guide, motivate, and influence others

        Here are the student's responses to 10 educational scenarios:
        ${JSON.stringify(formattedResponses, null, 2)}

        Please provide a comprehensive evaluation of the student's behavioral traits, learning style, and academic potential.
        
        Return your response as a JSON object with the following structure:
        {
          "empathy": {
            "score": (number from 0-3),
            "comments": "Assessment of the student's ability to understand and respond to others' emotions"
          },
          "assertiveness": {
            "score": (number from 0-3),
            "comments": "Assessment of the student's confidence in expressing themselves"
          },
          "ethicalReasoning": {
            "score": (number from 0-3),
            "comments": "Assessment of the student's ability to reason through ethical dilemmas"
          },
          "collaboration": {
            "score": (number from 0-3),
            "comments": "Assessment of the student's ability to work effectively with others"
          },
          "conflictResolution": {
            "score": (number from 0-3),
            "comments": "Assessment of the student's approach to resolving conflicts"
          },
          "leadershipPotential": {
            "score": (number from 0-3),
            "comments": "Assessment of the student's potential to lead and influence others"
          },
          "overallScore": (number from 0-3, average of all competency scores),
          "analysis": "Comprehensive analysis of the student's profile (200-300 words)",
          "strengths": ["Strength 1", "Strength 2", "Strength 3"],
          "areasToImprove": ["Area 1", "Area 2", "Area 3"],
          "recommendedLearningStyles": ["Learning Style 1", "Learning Style 2", "Learning Style 3"],
          "academicPathRecommendations": ["Path 1", "Path 2", "Path 3"]
        }
        
        The scores should be on a 3-star rating system:
        - 0: Needs significant improvement
        - 1: Basic competency
        - 2: Strong competency
        - 3: Exceptional competency
        
        Please ensure your evaluation is balanced, constructive, and provides actionable insights for the student's development.
      `;
    } else {
      // Default to employee/professional profile
      prompt = `
        You are evaluating a professional's responses to a psychometric test that assesses the following core competencies:
        - Empathy: Ability to understand and share the feelings of colleagues and clients
        - Assertiveness: Confidence in expressing professional opinions and boundaries
        - Ethical Reasoning: Ability to navigate complex workplace ethics and make principled decisions
        - Collaboration: Working effectively in teams and across departments
        - Conflict Resolution: Managing and resolving workplace disagreements constructively
        - Leadership Potential: Capacity to lead, motivate, and develop others in a professional setting

        Here are the professional's responses to 10 workplace scenarios:
        ${JSON.stringify(formattedResponses, null, 2)}

        Please provide a comprehensive evaluation of the professional's behavioral traits, decision-making style, and career potential.
        
        Return your response as a JSON object with the following structure:
        {
          "empathy": {
            "score": (number from 0-3),
            "comments": "Assessment of the professional's emotional intelligence and ability to understand others"
          },
          "assertiveness": {
            "score": (number from 0-3),
            "comments": "Assessment of the professional's confidence in expressing their views"
          },
          "ethicalReasoning": {
            "score": (number from 0-3),
            "comments": "Assessment of the professional's approach to ethical decision-making"
          },
          "collaboration": {
            "score": (number from 0-3),
            "comments": "Assessment of the professional's ability to work in teams"
          },
          "conflictResolution": {
            "score": (number from 0-3),
            "comments": "Assessment of the professional's approach to resolving workplace conflicts"
          },
          "leadershipPotential": {
            "score": (number from 0-3),
            "comments": "Assessment of the professional's potential to lead and develop others"
          },
          "overallScore": (number from 0-3, average of all competency scores),
          "analysis": "Comprehensive analysis of the professional's work style and potential (200-300 words)",
          "strengths": ["Strength 1", "Strength 2", "Strength 3"],
          "areasToImprove": ["Area 1", "Area 2", "Area 3"],
          "careerPathRecommendations": ["Career Path 1", "Career Path 2", "Career Path 3"],
          "roleFitRecommendations": ["Role 1", "Role 2", "Role 3"]
        }
        
        The scores should be on a 3-star rating system:
        - 0: Needs significant improvement
        - 1: Basic competency
        - 2: Strong competency
        - 3: Exceptional competency
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

      console.log('Sending request to Claude API...');
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
        console.error('Claude API error response:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      if (!result.content || !result.content[0] || !result.content[0].text) {
        console.error('Unexpected Claude API response structure:', JSON.stringify(result));
        throw new Error('Invalid API response format');
      }

      const textResponse = result.content[0].text;
      console.log('Claude response received, length:', textResponse.length);

      // Log a portion of the response for debugging (first 500 chars)
      const previewLength = Math.min(500, textResponse.length);
      console.log('Claude response preview:', textResponse.substring(0, previewLength) + 
                 (previewLength < textResponse.length ? '...' : ''));
      
      // Extract and parse JSON from the response
      const evaluation = extractJsonFromResponse(textResponse);
      
      if (!evaluation) {
        console.error('Could not extract valid JSON from Claude response');
        console.log('Full Claude response (first 1000 chars):', 
                   textResponse.substring(0, 1000) + 
                   (textResponse.length > 1000 ? '...' : ''));
        throw new Error('Could not extract valid evaluation from response');
      }
      
      console.log('Successfully parsed evaluation from Claude response');
      
      // Ensure all required fields are present and have valid structure
      const defaultEvaluation = createFallbackEvaluation(profileType);
      
      // Merge the received evaluation with default values
      const mergedEvaluation = {
        ...defaultEvaluation,
        ...evaluation,
        // Ensure scores are numbers
        empathy: ensureScoreObject(evaluation.empathy || defaultEvaluation.empathy),
        assertiveness: ensureScoreObject(evaluation.assertiveness || defaultEvaluation.assertiveness),
        ethicalReasoning: ensureScoreObject(evaluation.ethicalReasoning || defaultEvaluation.ethicalReasoning),
        collaboration: ensureScoreObject(evaluation.collaboration || defaultEvaluation.collaboration),
        conflictResolution: ensureScoreObject(evaluation.conflictResolution || defaultEvaluation.conflictResolution),
        leadershipPotential: ensureScoreObject(evaluation.leadershipPotential || defaultEvaluation.leadershipPotential),
        // Calculate overall score if not provided
        overallScore: typeof evaluation.overallScore === 'number' 
          ? evaluation.overallScore 
          : calculateOverallScore(evaluation, defaultEvaluation.overallScore)
      };
      
      return mergedEvaluation;
      
      return evaluation;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Claude API request timed out after 30 seconds');
        throw new Error('Request timed out. Please try again.');
      }
      console.error('Error in Claude API call:', error.message);
      throw error;
    }
  } catch (error) {
    console.error("Error evaluating with Claude:", error);
    // Instead of throwing, return a fallback evaluation
    console.log('Falling back to default evaluation due to error');
    try {
      return createFallbackEvaluation(profileType);
    } catch (fallbackError) {
      console.error('Error creating fallback evaluation:', fallbackError);
      // Return a minimal valid evaluation to prevent crashes
      return {
        empathy: { score: 2, comments: 'Evaluation not available' },
        assertiveness: { score: 2, comments: 'Evaluation not available' },
        ethicalReasoning: { score: 2, comments: 'Evaluation not available' },
        collaboration: { score: 2, comments: 'Evaluation not available' },
        conflictResolution: { score: 2, comments: 'Evaluation not available' },
        leadershipPotential: { score: 2, comments: 'Evaluation not available' },
        overallScore: 2,
        analysis: 'An error occurred while evaluating your responses. Please try again later.',
        strengths: [],
        areasToImprove: [],
        ...(profileType === 'student' ? {
          recommendedLearningStyles: [],
          academicPathRecommendations: []
        } : {
          careerPathRecommendations: [],
          roleFitRecommendations: []
        })
      };
    }
  }
}

// Helper function to ensure evaluation has all required fields
function ensureEvaluationStructure(evaluation, profileType) {
  const defaultEval = createFallbackEvaluation(profileType);
  const safeEval = { ...defaultEval, ...evaluation };
  
  // Ensure all score objects have the correct structure
  const ensureScore = (scoreObj, defaultScore = 2) => ({
    score: typeof scoreObj?.score === 'number' ? Math.max(0, Math.min(3, scoreObj.score)) : defaultScore,
    comments: typeof scoreObj?.comments === 'string' ? scoreObj.comments : 'Evaluation not available'
  });
  
  // Ensure all competencies have valid score objects
  const competencies = [
    'empathy', 'assertiveness', 'ethicalReasoning',
    'collaboration', 'conflictResolution', 'leadershipPotential'
  ];
  
  competencies.forEach(comp => {
    safeEval[comp] = ensureScore(safeEval[comp]);
  });
  
  // Calculate overall score if not present or invalid
  const scores = competencies.map(comp => safeEval[comp].score);
  safeEval.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  // Ensure arrays exist and are arrays
  const ensureArray = (arr, defaultValue = []) => Array.isArray(arr) ? arr : defaultValue;
  safeEval.strengths = ensureArray(safeEval.strengths);
  safeEval.areasToImprove = ensureArray(safeEval.areasToImprove);
  
  if (profileType === 'student') {
    safeEval.recommendedLearningStyles = ensureArray(safeEval.recommendedLearningStyles);
    safeEval.academicPathRecommendations = ensureArray(safeEval.academicPathRecommendations);
  } else {
    safeEval.careerPathRecommendations = ensureArray(safeEval.careerPathRecommendations);
    safeEval.roleFitRecommendations = ensureArray(safeEval.roleFitRecommendations);
  }
  
  return safeEval;
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

    // Find the test
    const test = await PsychometricTest.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }
    
    // Get profile type from test
    const profileType = test.profileType || 'employee';

    // Validate that all questions have been answered
    if (responses.length !== test.questions.length) {
      return res.status(400).json({ 
        success: false, 
        error: `All questions must be answered. Expected ${test.questions.length}, got ${responses.length}` 
      });
    }

    let evaluation;
    try {
      // Evaluate responses with Claude AI based on profile type
      evaluation = await evaluateWithClaude(test, responses, profileType);
      evaluation = ensureEvaluationStructure(evaluation, profileType);
    } catch (error) {
      console.error('Error in Claude evaluation, using fallback:', error);
      evaluation = createFallbackEvaluation(profileType);
    }
    
    // Update test as completed
    test.completed = true;
    test.isCompleted = true; // Add isCompleted for frontend compatibility
    test.completedAt = new Date();
    await test.save();
    
    // Create response record in database
    const newResponse = new PsychometricResponse({
      userId,
      testId,
      responses,
      results: {
        ...evaluation,
        isFallback: evaluation.isFallback || false
      },
      completedAt: new Date()
    });

    await newResponse.save();

    // Prepare response data
    const responseData = {
      success: true,
      message: `${profileType === 'student' ? 'Student' : 'Professional'} psychometric test evaluated successfully`,
      profileType,
      evaluation: {
        empathy: evaluation.empathy,
        assertiveness: evaluation.assertiveness,
        ethicalReasoning: evaluation.ethicalReasoning,
        collaboration: evaluation.collaboration,
        conflictResolution: evaluation.conflictResolution,
        leadershipPotential: evaluation.leadershipPotential,
        overallScore: evaluation.overallScore,
        analysis: evaluation.analysis,
        strengths: evaluation.strengths,
        areasToImprove: evaluation.areasToImprove
      }
    };

    // Add profile-specific fields
    if (profileType === 'student') {
      responseData.evaluation.recommendedLearningStyles = evaluation.recommendedLearningStyles;
      responseData.evaluation.academicPathRecommendations = evaluation.academicPathRecommendations;
    } else {
      responseData.evaluation.careerPathRecommendations = evaluation.careerPathRecommendations;
      responseData.evaluation.roleFitRecommendations = evaluation.roleFitRecommendations;
    }

    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error evaluating psychometric test:', error);
    
    // Try to return a fallback evaluation
    try {
      const profileType = req.body?.testId ? 
        (await PsychometricTest.findById(req.body.testId))?.profileType || 'employee' : 
        'employee';
      const fallbackEval = createFallbackEvaluation(profileType);
      
      return res.status(200).json({
        success: true,
        evaluation: fallbackEval,
        isFallback: true,
        warning: 'An error occurred during evaluation. Showing fallback results.'
      });
    } catch (fallbackError) {
      console.error('Error creating fallback evaluation:', fallbackError);
      return res.status(500).json({
        success: false,
        error: 'Failed to evaluate psychometric test',
        message: error.message
      });
    }
  }
}

// Apply database connection middleware only
export default connectDb(handler);
