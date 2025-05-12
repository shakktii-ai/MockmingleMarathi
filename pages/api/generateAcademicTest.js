import connectDb from "@/middleware/dbConnect";
import AcademicTest from "@/models/AcademicTest";
// Import the question cache utility
const { getCachedQuestions, cacheQuestions } = require("@/utils/academicTestCache");

async function generateQuestionsWithClaude(stream, department, subject, confidenceLevel, testFormat) {
  try {
    console.log(`Generating questions for ${subject} (${stream}, ${department}) at confidence level ${confidenceLevel} in ${testFormat} format`);
    
    // Create prompt for Claude
    const prompt = `
      Generate 10 ${subject} questions for a ${stream} student specializing in ${department}. 
      The student's self-reported confidence level is ${confidenceLevel}/5.
      
      The questions should be in ${testFormat} format.
      
      Create a mix of difficulty levels:
      - 3 Easy questions
      - 4 Moderate questions 
      - 3 Hard questions
      
      Return the questions as a JSON array with this structure:
      [
        {
          "questionText": "The full question text",
          "difficulty": "Easy/Moderate/Hard",
          "options": ["Option A", "Option B", "Option C", "Option D"], // Only for MCQ format
          "correctAnswer": "The correct answer", 
          "explanation": "Brief explanation of the answer"
        },
        ...
      ]
      
      Make sure the questions are appropriate for the academic stream, department, and subject.
      For the MCQ format, provide 4 options per question.
      For Written and Speaking formats, provide the expected key points in the correctAnswer field.
      
      IMPORTANT: Format your response as valid JSON only. Do not include any other text.
    `;

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY ;
    
    if (!apiKey) {
      console.error('Claude API key is missing');
      throw new Error('API key configuration error');
    }
    
    // Set timeout for API call (30 seconds - increased from 15)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      // Call Claude API with timeout
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
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
      
      clearTimeout(timeoutId); // Clear timeout as request completed
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error response:', errorText);
        throw new Error(`API returned status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.content || !result.content[0] || !result.content[0].text) {
        console.error('Unexpected Claude API response structure:', JSON.stringify(result));
        throw new Error('Invalid API response format');
      }
      
      // Extract JSON from response
      const textResponse = result.content[0].text;
      console.log('Claude response received, length:', textResponse.length);
      
      // Find the JSON array in the response
      const jsonStart = textResponse.indexOf('[');
      const jsonEnd = textResponse.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd <= jsonStart) {
        console.error('Could not find valid JSON array in Claude response');
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = textResponse.substring(jsonStart, jsonEnd);
      console.log('Extracted JSON string, length:', jsonString.length);
      
      try {
        const parsedQuestions = JSON.parse(jsonString);
        
        // Validate the structure
        if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
          throw new Error('Response is not a valid array of questions');
        }
        
        // Ensure questions have the required fields
        const validatedQuestions = parsedQuestions.map((q, index) => ({
          questionText: q.questionText || `Question ${index + 1}`,
          difficulty: q.difficulty || 'Moderate',
          options: Array.isArray(q.options) ? q.options : (testFormat === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : []),
          correctAnswer: q.correctAnswer || 'Answer not provided',
          explanation: q.explanation || 'No explanation available'
        }));
        
        return validatedQuestions;
      } catch (parseError) {
        console.error('Error parsing Claude response as JSON:', parseError);
        console.error('JSON string attempted to parse:', jsonString);
        throw new Error('Failed to parse questions data');
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('API request timed out after 15 seconds');
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Error generating questions with Claude:", error);
    throw error;
  }
}

// Generate fallback questions if API fails
function generateFallbackQuestions(stream, department, subject, testFormat) {
  console.log(`Generating fallback questions for ${stream}, ${department}, ${subject} in ${testFormat} format`);
  
  // Create subject-specific fallback questions based on common topics
  const subjectTopics = getSubjectTopics(subject, department);
  const mcqOptions = testFormat === "MCQ" ? generateMcqOptions(subject, 4) : [];
  
  return Array.from({ length: 10 }, (_, i) => {
    const difficulty = i < 3 ? "Easy" : i < 7 ? "Moderate" : "Hard";
    const topicIndex = i % subjectTopics.length;
    
    return {
      questionText: createQuestionText(subject, subjectTopics[topicIndex], difficulty, testFormat),
      difficulty,
      options: mcqOptions.length > 0 ? mcqOptions[i % mcqOptions.length] : [],
      correctAnswer: testFormat === "MCQ" ? mcqOptions[i % mcqOptions.length][0] : createSampleAnswer(subject, subjectTopics[topicIndex]),
      explanation: `This ${difficulty.toLowerCase()} question tests your knowledge of ${subjectTopics[topicIndex]} in ${subject}.`
    };
  });
}

// Get relevant topics for a subject
function getSubjectTopics(subject, department) {
  // Default topics if subject is not recognized
  const defaultTopics = ['fundamentals', 'theory', 'applications', 'history', 'modern developments'];
  
  const topicMap = {
    // Computer Science topics
    'Programming': ['variables and data types', 'control structures', 'functions', 'object-oriented programming', 'algorithms', 'data structures', 'debugging', 'version control', 'APIs', 'frameworks'],
    'Data Structures': ['arrays', 'linked lists', 'stacks', 'queues', 'trees', 'graphs', 'hash tables', 'heaps', 'complexity analysis', 'algorithm design'],
    'Algorithms': ['sorting', 'searching', 'recursion', 'dynamic programming', 'greedy algorithms', 'graph algorithms', 'computational complexity', 'optimization', 'divide and conquer', 'backtracking'],
    
    // Mathematics topics
    'Calculus': ['limits', 'derivatives', 'integrals', 'differential equations', 'series', 'vector calculus', 'applications', 'optimization', 'approximation', 'numerical methods'],
    'Algebra': ['linear equations', 'matrices', 'vectors', 'eigenvalues', 'groups', 'rings', 'fields', 'polynomials', 'abstract algebra', 'applications'],
    'Statistics': ['probability', 'distributions', 'hypothesis testing', 'regression', 'correlation', 'sampling', 'confidence intervals', 'ANOVA', 'non-parametric methods', 'Bayesian statistics'],
    
    // Physics topics
    'Mechanics': ['kinematics', 'dynamics', 'forces', 'energy', 'momentum', 'rotational motion', 'gravity', 'oscillations', 'waves', 'fluid mechanics'],
    'Electricity': ['electric fields', 'electric potential', 'circuits', 'capacitance', 'resistance', 'magnetism', 'electromagnetic induction', 'Maxwell\'s equations', 'alternating current', 'electronic components'],
    
    // Generic topics for other subjects
    'English': ['grammar', 'vocabulary', 'comprehension', 'literature', 'writing', 'analysis', 'communication', 'rhetoric', 'style', 'narrative'],
    'History': ['ancient civilizations', 'medieval period', 'renaissance', 'industrial revolution', 'world wars', 'cold war', 'modern history', 'political systems', 'economic developments', 'cultural changes']
  };
  
  return topicMap[subject] || defaultTopics;
}

// Generate MCQ options based on the subject
function generateMcqOptions(subject, count) {
  const optionSets = [
    // Programming
    ['Object-oriented programming', 'Functional programming', 'Procedural programming', 'Event-driven programming'],
    ['Variables', 'Constants', 'Functions', 'Classes'],
    ['JavaScript', 'Python', 'Java', 'C++'],
    ['HTML', 'CSS', 'JSON', 'XML'],
    ['Git', 'SVN', 'Mercurial', 'Perforce'],
    
    // Mathematics
    ['Integration', 'Differentiation', 'Limits', 'Series'],
    ['Mean', 'Median', 'Mode', 'Standard Deviation'],
    ['Linear', 'Quadratic', 'Exponential', 'Logarithmic'],
    
    // Generic
    ['True', 'False', 'Partially true', 'Cannot be determined'],
    ['Always', 'Sometimes', 'Rarely', 'Never']
  ];
  
  return optionSets;
}

// Create a realistic question text
function createQuestionText(subject, topic, difficulty, format) {
  const questionTemplates = {
    'Easy': [
      `Explain the basic concept of ${topic} in ${subject}.`,
      `What is the definition of ${topic} in ${subject}?`,
      `Describe the fundamental principles of ${topic}.`,
      `Identify the key components of ${topic}.`,
      `What are the main characteristics of ${topic}?`
    ],
    'Moderate': [
      `Compare and contrast different approaches to ${topic} in ${subject}.`,
      `How would you apply ${topic} to solve a real-world problem?`,
      `Analyze the relationship between ${topic} and other aspects of ${subject}.`,
      `Explain the advantages and limitations of ${topic}.`,
      `Discuss how ${topic} has evolved over time in the field of ${subject}.`
    ],
    'Hard': [
      `Critically evaluate the impact of ${topic} on the development of ${subject}.`,
      `Propose a novel approach to address challenges in ${topic}.`,
      `Synthesize various theoretical frameworks related to ${topic} in ${subject}.`,
      `Analyze a complex scenario involving ${topic} and recommend solutions.`,
      `How might recent advances in ${topic} change the future direction of ${subject}?`
    ]
  };
  
  const templates = questionTemplates[difficulty] || questionTemplates['Moderate'];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Create a sample answer for non-MCQ questions
function createSampleAnswer(subject, topic) {
  return `Key points: Definition of ${topic}, main principles, applications in ${subject}, common examples, and best practices.`;
}

async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract parameters from request body and validate them
    let { userId, stream, department, subject, confidenceLevel, testFormat } = req.body;
    
    // No auth token handling - directly use provided userId
    
    // Validate all required fields
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!stream) missingFields.push('stream');
    if (!department) missingFields.push('department');
    if (!subject) missingFields.push('subject');
    if (!confidenceLevel) missingFields.push('confidenceLevel');
    if (!testFormat) missingFields.push('testFormat');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        missingFields,
        received: { userId, stream, department, subject, confidenceLevel, testFormat }
      });
    }
    
    // Validate confidenceLevel is a number between 1-5
    const confLevel = parseInt(confidenceLevel, 10);
    if (isNaN(confLevel) || confLevel < 1 || confLevel > 5) {
      return res.status(400).json({ 
        error: 'Invalid confidence level', 
        message: 'Confidence level must be a number between 1 and 5'
      });
    }
    
    // Validate test format
    if (!['MCQ', 'Written', 'Speaking'].includes(testFormat)) {
      return res.status(400).json({ 
        error: 'Invalid test format', 
        message: 'Test format must be one of: MCQ, Written, Speaking'
      });
    }

    console.log('Generating academic test:', { stream, department, subject, confidenceLevel: confLevel, testFormat });
    
    // First check if we have cached questions for these parameters
    let questions = getCachedQuestions(stream, department, subject, confLevel, testFormat);
    
    if (questions) {
      console.log(`Using cached questions for ${stream}, ${department}, ${subject}`);
    } else {
      // No cache hit, generate new questions
      try {
        // Try to generate questions with Claude AI
        questions = await generateQuestionsWithClaude(stream, department, subject, confLevel, testFormat);
        console.log(`Successfully generated ${questions.length} questions with Claude`);
        
        // Cache the successfully generated questions
        cacheQuestions(stream, department, subject, confLevel, testFormat, questions);
      } catch (aiError) {
        console.error("Error with AI question generation, using fallback:", aiError);
        questions = generateFallbackQuestions(stream, department, subject, testFormat);
        console.log(`Using ${questions.length} fallback questions`);
      }
    }

    // Ensure we have exactly 10 questions
    if (!Array.isArray(questions) || questions.length < 10) {
      const fallbackQs = generateFallbackQuestions(subject, testFormat);
      questions = Array.isArray(questions) ? 
        [...questions, ...fallbackQs.slice(0, 10 - questions.length)] : 
        fallbackQs;
      console.log(`Added fallback questions to reach 10 total questions`);
    } else if (questions.length > 10) {
      questions = questions.slice(0, 10);
      console.log(`Trimmed excess questions to keep 10 total questions`);
    }

    // Ensure questions are properly formatted before creating test
    const formattedQuestions = questions.map((q, index) => ({
      questionText: q.questionText || `Question ${index + 1} about ${subject}`,
      difficulty: q.difficulty || 'Moderate',
      options: Array.isArray(q.options) ? q.options : 
              (testFormat === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : []),
      correctAnswer: q.correctAnswer || 'Sample answer',
      explanation: q.explanation || 'No explanation provided'
    }));
    
    console.log('Formatted questions to save to DB:', 
               JSON.stringify(formattedQuestions.map(q => q.questionText)).substring(0, 200));
    
    // Create a new academic test record
    const newTest = new AcademicTest({
      userId,
      stream,
      department,
      subject,
      confidenceLevel: confLevel,
      testFormat,
      questions: formattedQuestions,
      dateCreated: new Date(),
      isCompleted: false
    });

    try {
      // Save to database
      await newTest.save();
      console.log('Successfully saved academic test to database with ID:', newTest._id);
      
      // Log the raw question data before processing
      console.log('Raw question data from DB:', JSON.stringify(newTest.questions).substring(0, 200) + '...');
      
      // Convert to object and ensure all required fields are present
      const testObj = newTest.toObject();
      
      // Return the test without sending the correct answers to the client
      // Also ensure all question fields are properly passed to the client
      const clientTest = {
        ...testObj,
        questions: testObj.questions.map((q, index) => {
          console.log(`Processing question ${index}:`, q);
          return {
            questionText: q.questionText || `Question ${index + 1} about ${subject}`,
            difficulty: q.difficulty || 'Moderate',
            options: q.options || [],
            // Hide answers and explanations
            correctAnswer: undefined,
            explanation: undefined
          };
        })
      };
      
      // Log the processed questions being sent to client
      console.log('Sending to client questions:', JSON.stringify(clientTest.questions).substring(0, 200) + '...');
      
      res.status(200).json({ 
        success: true, 
        message: 'Academic test created successfully',
        test: clientTest
      });
    } catch (dbError) {
      console.error('Database error saving test:', dbError);
      // If we can't save to the database, still return the questions but notify of error
      res.status(200).json({
        success: true,
        warning: 'Test created but could not be saved to database',
        test: {
          _id: 'temporary_id_' + Date.now(),
          userId,
          stream, 
          department,
          subject,
          confidenceLevel: confLevel,
          testFormat,
          questions: questions.map(q => ({
            ...q,
            correctAnswer: undefined,
            explanation: undefined
          })),
          dateCreated: new Date(),
          isCompleted: false
        }
      });
    }
  } catch (error) {
    console.error('Error generating academic test:', error);
    // Give a more user-friendly error message
    res.status(500).json({ 
      error: 'Failed to create academic test', 
      message: 'There was a problem generating your academic test. Please try again.'
    });
  }
}

// Helper function to extract userId from token or request body
const getUserId = (req) => {
  try {
    // First try to get from req.user (set by auth middleware)
    if (req.user && req.user.id) {
      return req.user.id;
    }
    
    // Then try to get from request body
    if (req.body && req.body.userId) {
      return req.body.userId;
    }
    
    // Lastly, check if there's a user in localStorage via cookies
    if (req.cookies && req.cookies.user) {
      try {
        const userData = JSON.parse(req.cookies.user);
        return userData._id || userData.id;
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// No authentication required - directly connect to database
export default connectDb(handler);
