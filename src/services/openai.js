import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
let openai = null;
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (apiKey && apiKey !== 'undefined') {
    openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });
}

// Fallback mission briefings for when OpenAI is not available
const fallbackBriefings = {
    'Number Ninja': [
        "Agent, hostile mathematical entities detected in Sector 7. Engage and neutralize with precision calculations. Time is of the essence!",
        "Command to Agent: The Calculation Grid has been compromised. Deploy your numerical combat skills immediately. Good luck, soldier!",
        "Urgent: Math-based defense systems failing. We need your computational prowess to restore order. Proceed with extreme focus!"
    ],
    'Lexical Legends': [
        "Agent, ancient language codes must be deciphered before the enemy intercepts our communications. Your linguistic expertise is required!",
        "Priority Alpha: Decode the letter sequences before the security breach escalates. Your reading skills are our last defense!",
        "Command: Hostile symbols detected. Use your pattern recognition to identify friend from foe. Swift action required!"
    ],
    'Focus Flight': [
        "Agent, navigate through the quantum tunnel without collision. Your concentration is the only thing keeping this mission alive!",
        "Warning: Obstacle field detected ahead. Maintain absolute focus or risk mission failure. We're counting on you!",
        "Command: Thread the needle through hostile territory. One mistake could be catastrophic. Stay sharp!"
    ],
    'Matrix Reasoning': [
        "Agent, alien logic patterns detected. Decipher their reasoning before they decode ours. Your analytical mind is our greatest weapon!",
        "Priority: Break the enemy's pattern-based encryption. Use your abstract thinking to outmaneuver their defenses!",
        "Command: Unknown intelligence test incoming. Prove humanity's cognitive superiority. Mission critical!"
    ],
    'Spatial Recall': [
        "Agent, memorize these coordinates before they're erased. Our entire operation depends on your spatial memory!",
        "Warning: Star map data corrupting. Commit these positions to memory now or lose our only navigation reference!",
        "Command: Visual intelligence required. Lock these patterns into your memory banks. Time sensitive!"
    ]
};

export const generateMissionBriefing = async (agentName, missionType) => {
    // If OpenAI is available, try to use it
    if (openai) {
        try {
            const prompt = `
          You are "Command", a futuristic AI handler for a secret agent named ${agentName}.
          The agent is about to start a cognitive training mission: "${missionType}".
          
          Mission Types:
          - "Number Ninja": A fast-paced math battle.
          - "Matrix Logic": Deciphering alien patterns.
          - "Spatial Recall": Memorizing star maps.
          
          Generate a short, exciting, 2-sentence mission briefing.
          Style: Sci-fi, urgent, encouraging.
          Format: JSON { "briefing": "string" }
        `;

            const completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: "You are a sci-fi mission control AI." }, { role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" },
            });

            const result = JSON.parse(completion.choices[0].message.content);
            return result.briefing;
        } catch (error) {
            console.warn("OpenAI unavailable, using fallback briefing:", error.message);
        }
    }
    
    // Use fallback briefings
    const briefings = fallbackBriefings[missionType] || fallbackBriefings['Number Ninja'];
    const randomBriefing = briefings[Math.floor(Math.random() * briefings.length)];
    return randomBriefing;
};

// NEW: Generate age-appropriate questions with difficulty level for specific disease/game
export const generateDiseaseQuestions = async (diseaseType, gameType, age, difficultyLevel = 3, count = 3) => {
    if (!openai) {
        console.warn("⚠️ OpenAI not initialized - API key missing or invalid");
        console.log("Falling back to clinical question bank");
        return null; // Return null to trigger fallback
    }

    try {
        const ageGroup = age <= 8 ? 'early elementary (6-8 years)' : 
                        age <= 10 ? 'late elementary (9-10 years)' :
                        age <= 12 ? 'middle school (11-12 years)' : 'early teens (13-14 years)';

        const difficultyDesc = difficultyLevel === 1 
            ? 'VERY EASY - elementary school level (failure indicates significant deficit)'
            : difficultyLevel === 2
            ? 'MEDIUM - below grade level but appropriate for struggling students'
            : 'GRADE-APPROPRIATE - expected level for age 13 students';

        const diseasePrompts = {
            dyslexia: `Generate ${count} ${difficultyDesc} questions to assess reading and language processing for ${ageGroup} children.

DIFFICULTY LEVEL ${difficultyLevel} REQUIREMENTS:
${difficultyLevel === 1 ? `
- Very basic letter recognition (A, B, C)
- Simple 3-letter words (CAT, DOG, RUN)
- Letter reversals (b vs d)
- Failure at this level = HIGH dyslexia risk
` : difficultyLevel === 2 ? `
- Simple phonics and rhyming
- Basic sight words
- Letter combinations
- Below grade level but manageable for struggling readers
` : `
- Complex phonological manipulation  
- Multi-syllable words
- Morphological awareness
- Grade-level spelling and decoding
`}

Focus on: Letter discrimination, phonological awareness, word recognition, spelling
Use age-appropriate vocabulary that ${ageGroup} students would commonly know.`,

            dyscalculia: `Generate ${count} ${difficultyDesc} questions to assess mathematical understanding for ${ageGroup} children.

DIFFICULTY LEVEL ${difficultyLevel} REQUIREMENTS:
${difficultyLevel === 1 ? `
- Basic single-digit addition (2+2, 3+1)
- Simple counting (count 5 objects)
- Number recognition (identify 5, 7, 9)
- Failure at this level = HIGH dyscalculia risk
` : difficultyLevel === 2 ? `
- Two-digit addition/subtraction
- Simple multiplication tables (2x, 3x, 5x)
- Number comparisons and sequences
- Below grade level but manageable
` : `
- Algebraic thinking (solve for x)
- Fractions and percentages
- Multi-step word problems
- Grade 7-8 level math concepts
`}

Focus on: Number sense, magnitude comparison, arithmetic operations, problem-solving
Use age-appropriate math concepts familiar to ${ageGroup} students.`,

            adhd: `Generate ${count} ${difficultyDesc} attention and impulse control tasks for ${ageGroup} children.

DIFFICULTY LEVEL ${difficultyLevel} REQUIREMENTS:
${difficultyLevel === 1 ? `
- Very simple "spot the difference" (2-3 obvious differences)
- Basic pattern recognition
- Simple one-step instructions
- Failure at this level = HIGH ADHD risk
` : difficultyLevel === 2 ? `
- Moderate attention tasks
- Two-step instructions
- Filtering one distraction
- Below grade level focus requirements
` : `
- Multi-step instructions with distractions
- Sustained attention tasks
- Complex filtering requirements
- Grade-appropriate attention span
`}

Focus on: Sustained attention, impulse control, following instructions, filtering distractions
Design tasks that ${ageGroup} children can understand.`,

            dysgraphia: `Generate ${count} ${difficultyDesc} visual-spatial and memory tasks for ${ageGroup} children.

DIFFICULTY LEVEL ${difficultyLevel} REQUIREMENTS:
${difficultyLevel === 1 ? `
- Remember 2-3 simple items
- Basic shape recognition (circle, square, triangle)
- Simple spatial relationships
- Failure at this level = HIGH dysgraphia risk
` : difficultyLevel === 2 ? `
- Remember 4-5 items in sequence
- Complex shape patterns
- Spatial orientation tasks
- Below grade level but manageable
` : `
- Remember 6+ items with categories
- Complex spatial reasoning
- Multi-step visual patterns
- Grade-appropriate visual-motor tasks
`}

Focus on: Visual memory, spatial relationships, fine motor planning, symbol recognition
Use familiar shapes, objects, and patterns appropriate for ${ageGroup} students.`
        };

        const prompt = diseasePrompts[diseaseType] || diseasePrompts.dyslexia;

        const systemPrompt = `You are a pediatric neuropsychological assessment specialist creating questions for LEVEL ${difficultyLevel} testing.

CRITICAL: Generate questions that are:
1. Precisely calibrated to LEVEL ${difficultyLevel} difficulty
2. Age-appropriate for ${ageGroup} (age ${age})
3. Based on familiar concepts (family, school, food, animals, colors, numbers)
4. Clear and unambiguous with exactly 4 multiple choice options
5. Clinically valid for detecting ${diseaseType}

LEVEL 1 = Very easy (elementary level) - failure indicates HIGH risk
LEVEL 2 = Medium (below grade level) - indicates some struggle
LEVEL 3 = Expected for age 13 - grade-appropriate difficulty

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "question": "Clear question text for level ${difficultyLevel}",
      "instruction": "Brief task instruction",
      "type": "multiple-choice",
      "options": ["option1", "option2", "option3", "option4"],
      "correct": "option1",
      "difficulty": ${difficultyLevel},
      "timeLimit": ${difficultyLevel === 1 ? 8 : difficultyLevel === 2 ? 10 : 12},
      "explanation": "Why this tests for ${diseaseType} at level ${difficultyLevel}"
    }
  ]
}`;

        console.log(`🤖 Calling OpenAI GPT-4 for ${diseaseType} questions (Level ${difficultyLevel}, Age ${age})...`);

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            model: "gpt-4",
            response_format: { type: "json_object" },
            temperature: 0.7
        });

        const result = JSON.parse(completion.choices[0].message.content);
        console.log(`✅ OpenAI returned ${result.questions?.length || 0} questions`);
        return result.questions || [];
    } catch (error) {
        console.error("❌ OpenAI API Error:", error.message);
        if (error.code === 'invalid_api_key') {
            console.error("  → API key is invalid");
        } else if (error.code === 'insufficient_quota') {
            console.error("  → API quota exceeded");
        }
        return null; // Return null to trigger fallback
    }
};

function generateFallbackDiseaseQuestions(diseaseType, gameType, age, count) {
    const ageGroup = age <= 8 ? 'young' : age <= 10 ? 'middle' : 'older';
    
    const questionBanks = {
        dyslexia: {
            young: [
                { question: "Which letter is 'b'?", options: ["b", "d", "p", "q"], correct: "b", difficulty: "easy", timeLimit: 10 },
                { question: "Find the word: CAT", options: ["CAT", "TAC", "ACT", "CTA"], correct: "CAT", difficulty: "easy", timeLimit: 10 },
                { question: "Which letters spell 'DOG'?", options: ["DOG", "GOD", "BOG", "DOB"], correct: "DOG", difficulty: "medium", timeLimit: 10 },
                { question: "What comes next: A, B, C, __?", options: ["D", "E", "F", "B"], correct: "D", difficulty: "easy", timeLimit: 10 },
                { question: "Which word is different: BAT, BAT, BAT, DAT?", options: ["1st", "2nd", "3rd", "4th"], correct: "4th", difficulty: "medium", timeLimit: 10 }
            ],
            middle: [
                { question: "Which is spelled correctly?", options: ["Friend", "Freind", "Frend", "Fiend"], correct: "Friend", difficulty: "medium", timeLimit: 10 },
                { question: "Find 'p' in: b p d q", options: ["1st", "2nd", "3rd", "4th"], correct: "2nd", difficulty: "easy", timeLimit: 8 },
                { question: "Backwards word: STAR → ?", options: ["RATS", "TARS", "ARTS", "RAST"], correct: "RATS", difficulty: "medium", timeLimit: 10 },
                { question: "Complete: TH__ (they)", options: ["EY", "AY", "IE", "EA"], correct: "EY", difficulty: "medium", timeLimit: 10 },
                { question: "Which word rhymes with 'CAT'?", options: ["BAT", "CUT", "COT", "CAR"], correct: "BAT", difficulty: "easy", timeLimit: 8 }
            ],
            older: [
                { question: "Which is the correct spelling?", options: ["Necessary", "Neccessary", "Necesary", "Neccesary"], correct: "Necessary", difficulty: "hard", timeLimit: 12 },
                { question: "Identify the palindrome:", options: ["RACECAR", "SCHOOL", "FRIEND", "HOUSE"], correct: "RACECAR", difficulty: "medium", timeLimit: 10 },
                { question: "Which word has silent letters?", options: ["KNIGHT", "FRIEND", "SCHOOL", "HAPPY"], correct: "KNIGHT", difficulty: "medium", timeLimit: 10 },
                { question: "Find the homophone: THERE", options: ["THEIR", "WHERE", "HERE", "WERE"], correct: "THEIR", difficulty: "medium", timeLimit: 10 },
                { question: "Which prefix means 'not'?", options: ["UN-", "RE-", "PRE-", "DE-"], correct: "UN-", difficulty: "hard", timeLimit: 12 }
            ]
        },
        dyscalculia: {
            young: [
                { question: "3 + 2 = ?", options: ["5", "4", "6", "7"], correct: "5", difficulty: "easy", timeLimit: 8 },
                { question: "Which is bigger: 7 or 4?", options: ["7", "4"], correct: "7", difficulty: "easy", timeLimit: 8 },
                { question: "10 - 3 = ?", options: ["7", "6", "8", "9"], correct: "7", difficulty: "medium", timeLimit: 10 },
                { question: "Count: ●●●●● = ?", options: ["5", "4", "6", "3"], correct: "5", difficulty: "easy", timeLimit: 8 },
                { question: "2 × 3 = ?", options: ["6", "5", "7", "8"], correct: "6", difficulty: "medium", timeLimit: 10 }
            ],
            middle: [
                { question: "15 + 12 = ?", options: ["27", "25", "28", "26"], correct: "27", difficulty: "medium", timeLimit: 10 },
                { question: "7 × 8 = ?", options: ["56", "54", "48", "64"], correct: "56", difficulty: "medium", timeLimit: 10 },
                { question: "What's 1/2 of 20?", options: ["10", "5", "15", "8"], correct: "10", difficulty: "medium", timeLimit: 10 },
                { question: "45 - 18 = ?", options: ["27", "28", "26", "29"], correct: "27", difficulty: "hard", timeLimit: 12 },
                { question: "Next in sequence: 5, 10, 15, __?", options: ["20", "25", "18", "30"], correct: "20", difficulty: "easy", timeLimit: 10 }
            ],
            older: [
                { question: "12 × 12 = ?", options: ["144", "124", "132", "156"], correct: "144", difficulty: "hard", timeLimit: 12 },
                { question: "What is 25% of 80?", options: ["20", "25", "15", "30"], correct: "20", difficulty: "hard", timeLimit: 15 },
                { question: "72 ÷ 8 = ?", options: ["9", "8", "7", "10"], correct: "9", difficulty: "medium", timeLimit: 10 },
                { question: "If x + 5 = 12, x = ?", options: ["7", "6", "8", "17"], correct: "7", difficulty: "hard", timeLimit: 12 },
                { question: "3² + 4² = ?", options: ["25", "49", "16", "20"], correct: "25", difficulty: "hard", timeLimit: 15 }
            ]
        },
        adhd: {
            young: [
                { question: "Which one is different? ●●●○", options: ["4th", "1st", "2nd", "3rd"], correct: "4th", difficulty: "easy", timeLimit: 8 },
                { question: "Quick! What color is the sky?", options: ["Blue", "Green", "Red", "Yellow"], correct: "Blue", difficulty: "easy", timeLimit: 5 },
                { question: "Find the red circle: 🔴🔵🔴", options: ["1st", "2nd", "3rd"], correct: "1st", difficulty: "easy", timeLimit: 8 },
                { question: "Remember: CAT. Now, what was it?", options: ["CAT", "DOG", "RAT", "BAT"], correct: "CAT", difficulty: "medium", timeLimit: 10 },
                { question: "Count only ●: ●■●■●", options: ["3", "2", "4", "5"], correct: "3", difficulty: "medium", timeLimit: 10 }
            ],
            middle: [
                { question: "Pattern: ▲●▲●▲__", options: ["●", "▲", "■", "★"], correct: "●", difficulty: "medium", timeLimit: 10 },
                { question: "Quick math: 7 + 3 = ?", options: ["10", "9", "11", "8"], correct: "10", difficulty: "easy", timeLimit: 6 },
                { question: "Find 'A' in: XAYBZAC", options: ["2nd", "5th", "7th", "All"], correct: "All", difficulty: "hard", timeLimit: 12 },
                { question: "Remember sequence: 3-7-2. What was it?", options: ["3-7-2", "3-2-7", "7-3-2", "2-7-3"], correct: "3-7-2", difficulty: "medium", timeLimit: 15 },
                { question: "Different one: AAABAA", options: ["4th", "3rd", "1st", "5th"], correct: "4th", difficulty: "medium", timeLimit: 10 }
            ],
            older: [
                { question: "Follow: Add 3, multiply by 2. Start with 5.", options: ["16", "13", "10", "15"], correct: "16", difficulty: "hard", timeLimit: 15 },
                { question: "Count backwards from 20 by 3s. What's 4th number?", options: ["11", "14", "8", "17"], correct: "11", difficulty: "hard", timeLimit: 15 },
                { question: "Pattern completion: 2,4,8,16,__", options: ["32", "24", "20", "18"], correct: "32", difficulty: "medium", timeLimit: 10 },
                { question: "Remember: DOG, CAT, BIRD. How many animals?", options: ["3", "2", "4", "1"], correct: "3", difficulty: "easy", timeLimit: 10 },
                { question: "Odd one out: 2,4,7,8,10", options: ["7", "2", "4", "8"], correct: "7", difficulty: "medium", timeLimit: 12 }
            ]
        },
        dysgraphia: {
            young: [
                { question: "Which shape is a circle?", options: ["○", "□", "△", "⬟"], correct: "○", difficulty: "easy", timeLimit: 8 },
                { question: "Mirror image of 'b' is:", options: ["d", "p", "q", "b"], correct: "d", difficulty: "medium", timeLimit: 10 },
                { question: "Pattern: ●■●■__", options: ["●", "■", "▲", "★"], correct: "●", difficulty: "easy", timeLimit: 8 },
                { question: "Which way does 'p' point?", options: ["Right", "Left", "Up", "Down"], correct: "Right", difficulty: "medium", timeLimit: 10 },
                { question: "Copy: ●●■. What comes next?", options: ["●●■", "■●●", "●■●", "■■●"], correct: "●●■", difficulty: "medium", timeLimit: 10 }
            ],
            middle: [
                { question: "Rotate △ 180°:", options: ["▽", "△", "◁", "▷"], correct: "▽", difficulty: "medium", timeLimit: 12 },
                { question: "Which is symmetrical?", options: ["H", "G", "L", "P"], correct: "H", difficulty: "medium", timeLimit: 10 },
                { question: "Remember: ●■▲. What was 2nd?", options: ["■", "●", "▲", "★"], correct: "■", difficulty: "medium", timeLimit: 15 },
                { question: "3D cube has ___ faces", options: ["6", "4", "8", "5"], correct: "6", difficulty: "hard", timeLimit: 12 },
                { question: "Which letter is NOT symmetrical?", options: ["P", "O", "H", "X"], correct: "P", difficulty: "medium", timeLimit: 10 }
            ],
            older: [
                { question: "Fold paper: ⬜→ ◣. What shape after unfold?", options: ["△", "⬜", "◇", "○"], correct: "△", difficulty: "hard", timeLimit: 15 },
                { question: "Remember: ●■▲★○. What was 3rd?", options: ["▲", "■", "★", "●"], correct: "▲", difficulty: "medium", timeLimit: 15 },
                { question: "Which is the top view of a cone?", options: ["○", "△", "⬜", "▭"], correct: "○", difficulty: "hard", timeLimit: 12 },
                { question: "Pattern: ●●■■▲▲__", options: ["★★", "●●", "■■", "▲▲"], correct: "★★", difficulty: "medium", timeLimit: 12 },
                { question: "Mirror line: |  'b' becomes:", options: ["d", "p", "q", "b"], correct: "d", difficulty: "medium", timeLimit: 10 }
            ]
        }
    };

    const questions = questionBanks[diseaseType]?.[ageGroup] || questionBanks.dyslexia.middle;
    return questions.slice(0, count);
}

// NEW: Comprehensive Game Analysis with LLM
export const analyzeLearningDisabilityRisk = async (gameData, emotionData, questionData) => {
    if (!openai) {
        console.warn("OpenAI not available, using fallback analysis");
        return generateFallbackAnalysis(gameData, emotionData, questionData);
    }

    try {
        const prompt = `You are a pediatric neuropsychologist AI analyzing cognitive assessment data from children aged 8-14. 
        
Analyze the following comprehensive data and provide detailed risk assessment for learning disabilities:

GAME PERFORMANCE DATA:
${JSON.stringify(gameData, null, 2)}

EMOTION DATA (captured during gameplay):
${JSON.stringify(emotionData, null, 2)}

QUESTION-LEVEL DATA (response times, accuracy, patterns):
${JSON.stringify(questionData, null, 2)}

ANALYSIS GUIDELINES:
1. For each question/task:
   - If response time > 10 seconds: Consider as failed/timeout (indicates processing difficulty)
   - If response time 7-10s with wrong answer: +4% risk increase for relevant disorder
   - If response time 4-7s with wrong answer: +3% risk increase
   - If response time < 4s with wrong answer: +2% risk increase (may indicate impulsivity)
   - If correct but slow (>7s): +1% risk increase (processing speed concern)

2. Emotion correlation:
   - Frustrated/Angry during reading tasks → Dyslexia indicator
   - Anxious/Fearful during math tasks → Dyscalculia indicator  
   - Frequent emotion shifts (>3 changes/minute) → ADHD indicator
   - Sad/Neutral throughout → May indicate learned helplessness

3. Pattern recognition:
   - Consistent errors in b/d/p/q distinction → Dyslexia
   - Number reversal errors (12 vs 21) → Dyscalculia
   - Spatial/memory errors → Dysgraphia
   - Impulsive fast errors + attention lapses → ADHD

Return JSON with this EXACT structure:
{
  "overallAssessment": {
    "dyslexia": { "risk": 0-80, "confidence": "low/medium/high" },
    "dyscalculia": { "risk": 0-80, "confidence": "low/medium/high" },
    "dysgraphia": { "risk": 0-80, "confidence": "low/medium/high" },
    "adhd": { "risk": 0-80, "confidence": "low/medium/high" },
    "auditoryProcessing": { "risk": 0-80, "confidence": "low/medium/high" },
    "dyspraxia": { "risk": 0-80, "confidence": "low/medium/high" }
  },
  "gameAnalysis": {
    "voidChallenge": { "reasoning": "string explaining why risk was assigned", "keyIndicators": ["indicator1", "indicator2"] },
    "memoryQuest": { "reasoning": "string", "keyIndicators": [] },
    "warpExplorer": { "reasoning": "string", "keyIndicators": [] },
    "treasureHunter": { "reasoning": "string", "keyIndicators": [] },
    "defenderChallenge": { "reasoning": "string", "keyIndicators": [] },
    "matrixReasoning": { "reasoning": "string", "keyIndicators": [] },
    "spatialRecall": { "reasoning": "string", "keyIndicators": [] },
    "bridgeGame": { "reasoning": "string", "keyIndicators": [] }
  },
  "criticalFindings": ["finding1", "finding2", "finding3"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Be thorough but compassionate. Cap all risks at 80% maximum.`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a pediatric neuropsychologist specializing in learning disability assessment. Be precise, evidence-based, and compassionate." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4",
            response_format: { type: "json_object" },
            temperature: 0.3
        });

        const analysis = JSON.parse(completion.choices[0].message.content);
        
        // Ensure all risks are capped at 80%
        Object.keys(analysis.overallAssessment).forEach(disorder => {
            if (analysis.overallAssessment[disorder].risk > 80) {
                analysis.overallAssessment[disorder].risk = 80;
            }
        });
        
        return analysis;
    } catch (error) {
        console.error("LLM analysis failed:", error);
        return generateFallbackAnalysis(gameData, emotionData, questionData);
    }
};

function generateFallbackAnalysis(gameData, emotionData, questionData) {
    // Calculate basic risk scores based on performance
    const analysis = {
        overallAssessment: {
            dyslexia: { risk: 0, confidence: "medium" },
            dyscalculia: { risk: 0, confidence: "medium" },
            dysgraphia: { risk: 0, confidence: "medium" },
            adhd: { risk: 0, confidence: "medium" },
            auditoryProcessing: { risk: 0, confidence: "low" },
            dyspraxia: { risk: 0, confidence: "low" }
        },
        gameAnalysis: {},
        criticalFindings: [],
        recommendations: [
            "Continue monitoring cognitive development",
            "Encourage regular reading and math practice",
            "Maintain a supportive learning environment"
        ]
    };

    // Analyze each game
    Object.keys(gameData).forEach(gameId => {
        const game = gameData[gameId];
        if (!game.played) return;

        let reasoning = `Performance analysis for ${gameId}: `;
        const indicators = [];

        // Grade-based assessment
        if (game.grade === 'F' || game.grade === 'C') {
            reasoning += "Below average performance detected. ";
            indicators.push("Low score");
        }

        // Accuracy assessment
        const total = (game.correct || 0) + (game.incorrect || 0);
        if (total > 0) {
            const accuracy = game.correct / total;
            if (accuracy < 0.5) {
                reasoning += `Low accuracy (${Math.round(accuracy * 100)}%). `;
                indicators.push("Accuracy concerns");
            }
        }

        // Map to disorders
        if (gameId === 'treasureHunter' || gameId === 'lexicalLegends') {
            analysis.overallAssessment.dyslexia.risk += game.grade === 'F' ? 15 : game.grade === 'C' ? 10 : 0;
            reasoning += "Reading/language task performance evaluated.";
        } else if (gameId === 'defenderChallenge' || gameId === 'numberNinja') {
            analysis.overallAssessment.dyscalculia.risk += game.grade === 'F' ? 15 : game.grade === 'C' ? 10 : 0;
            reasoning += "Mathematical reasoning assessed.";
        } else if (gameId === 'voidChallenge' || gameId === 'focusFlight') {
            if (game.score < 200) {
                analysis.overallAssessment.adhd.risk += 15;
                indicators.push("Attention deficit indicators");
            }
            reasoning += "Sustained attention and focus evaluated.";
        } else if (gameId === 'memoryQuest' || gameId === 'spatialRecall') {
            analysis.overallAssessment.dysgraphia.risk += game.grade === 'F' ? 12 : game.grade === 'C' ? 8 : 0;
            reasoning += "Visual-spatial memory assessed.";
        }

        analysis.gameAnalysis[gameId] = { reasoning, keyIndicators: indicators };
    });

    // Cap at 80%
    Object.keys(analysis.overallAssessment).forEach(disorder => {
        analysis.overallAssessment[disorder].risk = Math.min(analysis.overallAssessment[disorder].risk, 80);
    });

    return analysis;
}
