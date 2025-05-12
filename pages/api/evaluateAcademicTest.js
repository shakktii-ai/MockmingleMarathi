import connectDb from "@/middleware/dbConnect";
import AcademicTest from "@/models/AcademicTest";
import AcademicTestResponse from "@/models/AcademicTestResponse";

async function evaluateWithClaude(testData, userAnswers) {
  console.log(`Evaluating test responses for ${testData.subject} (${testData.stream})...`);
  try {
    // Prepare data for Claude evaluation
    const prompt = `
      You're evaluating a student's academic test responses.
      
      Subject: ${testData.subject}
      Stream: ${testData.stream}
      Department: ${testData.department}
      Test Format: ${testData.testFormat}
      
      Below are the test questions and the student's answers.
      Please evaluate each answer and provide feedback.
      
      ${testData.questions.map((q, index) => `
        Question ${index + 1} (${q.difficulty}): ${q.questionText}
        ${testData.testFormat === 'MCQ' ? `Options: ${q.options.join(', ')}` : ''}
        Correct answer: ${q.correctAnswer}
        Student's answer: ${userAnswers[index] || 'No answer provided'}
      `).join('\n\n')}
      
      For each question, determine if the answer is correct, partially correct, or incorrect.
      Assign a score from 0-100 for each answer based on accuracy and completeness.
      Provide brief feedback for each answer.
      
      Then, calculate an overall score (0-100) and assign a star rating (0-3 stars).
      
      Return your evaluation as a JSON object with this structure:
      {
        "answers": [
          {
            "questionIndex": 0,
            "isCorrect": true/false/partial,
            "score": 85,
            "feedback": "Feedback on this answer"
          },
          ...
        ],
        "overallScore": 78,
        "stars": 2,
        "feedback": "Overall feedback on the test performance"
      }
    `;

    // Call Claude API
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
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.content && result.content[0] && result.content[0].text) {
        try {
          // Extract JSON from response
          const textResponse = result.content[0].text;
          const jsonStart = textResponse.indexOf('{');
          const jsonEnd = textResponse.lastIndexOf('}') + 1;
          const jsonString = textResponse.substring(jsonStart, jsonEnd);
          
          return JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Error parsing Claude response as JSON:', parseError);
          throw new Error('Failed to parse evaluation data');
        }
      }
    } else {
      console.error('Claude API error:', await response.text());
      throw new Error('Failed to evaluate test');
    }
  } catch (error) {
    console.error("Error evaluating with Claude:", error);
    throw error;
  }
}

// Generate basic evaluation if AI fails
function generateBasicEvaluation(testData, userAnswers) {
  const answers = testData.questions.map((q, index) => {
    const userAnswer = userAnswers[index] || '';
    
    // Simple string matching for MCQ or exact answers
    let isCorrect = false;
    let score = 0;
    
    if (testData.testFormat === 'MCQ') {
      isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      score = isCorrect ? 100 : 0;
    } else {
      // For written/speaking, check if key words from the correct answer appear in user answer
      const correctKeywords = q.correctAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      let matchedKeywords = 0;
      
      correctKeywords.forEach(keyword => {
        if (userAnswer.toLowerCase().includes(keyword)) {
          matchedKeywords++;
        }
      });
      
      const matchRatio = correctKeywords.length > 0 ? matchedKeywords / correctKeywords.length : 0;
      score = Math.round(matchRatio * 100);
      isCorrect = score >= 70;
    }
    
    return {
      questionIndex: index,
      isCorrect,
      score,
      feedback: isCorrect ? "Correct answer!" : "Your answer doesn't match the expected response."
    };
  });
  
  // Calculate overall score
  const overallScore = answers.reduce((sum, ans) => sum + ans.score, 0) / answers.length;
  
  // Determine stars (0-3)
  let stars;
  if (overallScore >= 85) stars = 3;
  else if (overallScore >= 70) stars = 2;
  else if (overallScore >= 50) stars = 1;
  else stars = 0;
  
  return {
    answers,
    overallScore,
    stars,
    feedback: `You scored ${Math.round(overallScore)}% on this test (${stars} stars).`
  };
}

async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract parameters from request body
    const { testId, answers, timeSpent } = req.body;
    
    console.log('Received test submission:', { testId, timeSpent, answersCount: answers?.length });
    console.log('First answer format:', answers[0]);
    
    if (!testId || !answers) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Validate answers format - ensure they have questionIndex and userAnswer
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be an array' });
    }

    // Get the test data
    const testData = await AcademicTest.findById(testId);
    if (!testData) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Evaluate the test using Claude AI
    let evaluation;
    try {
      evaluation = await evaluateWithClaude(testData, answers);
    } catch (aiError) {
      console.error("Error with AI evaluation, using basic evaluation:", aiError);
      evaluation = generateBasicEvaluation(testData, answers);
    }

    // Create a new test response record
    // Ensure stars value is within valid range (0-3) to prevent validation errors
    const starsValue = Math.min(Math.max(parseInt(evaluation.stars) || 0, 0), 3);
    console.log(`Original stars value: ${evaluation.stars}, Validated stars value: ${starsValue}`);
    
    const testResponse = new AcademicTestResponse({
      userId: testData.userId,
      testId: testData._id,
      answers: evaluation.answers.map(ans => {
        // Get the answer for this question index
        let userAnswer = '';
        
        // Handle both formats - array of strings or array of objects with userAnswer property
        if (Array.isArray(answers)) {
          if (typeof answers[ans.questionIndex] === 'string') {
            userAnswer = answers[ans.questionIndex];
          } else if (answers[ans.questionIndex] && typeof answers[ans.questionIndex] === 'object') {
            userAnswer = answers[ans.questionIndex].userAnswer;
          }
        }
        
        // Ensure userAnswer is never empty to satisfy the required constraint
        if (!userAnswer || userAnswer.trim() === '') {
          userAnswer = 'No answer provided';
        }
        
        return {
          questionIndex: ans.questionIndex,
          userAnswer: userAnswer,
          isCorrect: ans.isCorrect === true,
          score: ans.score,
          feedback: ans.feedback
        };
      }),
      overallScore: evaluation.overallScore,
      stars: starsValue, // Use the validated stars value
      feedback: evaluation.feedback,
      timeSpent,
      completedAt: new Date()
    });

    // Save to database
    await testResponse.save();
    
    // Update the test record to mark it as completed
    testData.isCompleted = true;
    testData.completedAt = new Date();
    await testData.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Academic test evaluated successfully',
      evaluation: {
        answers: evaluation.answers,
        overallScore: evaluation.overallScore,
        stars: evaluation.stars,
        feedback: evaluation.feedback
      }
    });
  } catch (error) {
    console.error('Error evaluating academic test:', error);
    res.status(500).json({ error: 'Failed to evaluate academic test', details: error.message });
  }
}

// No authentication required - directly connect to database
export default connectDb(handler);
