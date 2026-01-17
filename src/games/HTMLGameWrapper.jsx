import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDiseaseQuestions } from '../services/openai';

const HTMLGameWrapper = ({ gameId, htmlContent, nextGame }) => {
    const iframeRef = useRef(null);
    const navigate = useNavigate();
    const { updateGameResult, recordGameAttempt, userProfile } = useGame();
    const [showFailQuestions, setShowFailQuestions] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [gameFailed, setGameFailed] = useState(false);
    const [gameScore, setGameScore] = useState(0);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [currentDifficulty, setCurrentDifficulty] = useState(3); // Start at level 3 (student's expected level)
    const [performanceHistory, setPerformanceHistory] = useState([]); // Track right/wrong answers

    // Reset all question states when gameId changes
    useEffect(() => {
        setShowFailQuestions(false);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setGameFailed(false);
        setGameScore(0);
    }, [gameId]);

    // Map game IDs to disease types for question generation
    const getDiseaseTypeForGame = (gameType) => {
        const gameToDisease = {
            voidChallenge: 'adhd',
            focusFlight: 'adhd',
            treasureHunter: 'dyslexia',
            lexicalLegends: 'dyslexia',
            defenderChallenge: 'dyscalculia',
            numberNinja: 'dyscalculia',
            memoryQuest: 'dysgraphia',
            spatialRecall: 'dysgraphia',
            warpExplorer: 'adhd',
            matrixReasoning: 'dyslexia',
            bridgeGame: 'adhd'
        };
        return gameToDisease[gameType] || 'dyslexia';
    };

    // Generate questions using OpenAI with adaptive difficulty
    const generateFailQuestions = async (gameType) => {
        setLoadingQuestions(true);
        const diseaseType = getDiseaseTypeForGame(gameType);
        const age = userProfile?.age || 13; // Default to 13 as requested
        
        console.log('=== GENERATING QUESTIONS ===');
        console.log('Game:', gameType, '| Disease:', diseaseType, '| Age:', age, '| Difficulty Level:', currentDifficulty);
        
        try {
            // Try OpenAI with specific difficulty level
            console.log('Attempting OpenAI generation...');
            const aiQuestions = await generateDiseaseQuestions(diseaseType, gameType, age, currentDifficulty, 3);
            
            if (aiQuestions && aiQuestions.length > 0) {
                console.log('✅ OpenAI generated', aiQuestions.length, 'questions');
                
                // Transform AI questions to match our format
                const transformedQuestions = aiQuestions.map((q, idx) => ({
                    type: diseaseType === 'dyscalculia' ? 'number' : diseaseType === 'dyslexia' ? 'reading' : 'attention',
                    instruction: q.instruction || 'Answer the following question',
                    question: q.question,
                    options: q.options,
                    answer: q.correct,
                    taskType: diseaseType === 'dyscalculia' ? 'number' : diseaseType === 'dyslexia' ? 'reading' : 'attention',
                    difficulty: currentDifficulty,
                    startTime: Date.now()
                }));
                
                setLoadingQuestions(false);
                return transformedQuestions;
            }
        } catch (error) {
            console.error('❌ OpenAI generation failed:', error.message);
            console.log('Falling back to clinically-focused questions');
        }
        
        // Use fallback with specific difficulty level
        setLoadingQuestions(false);
        return getFallbackQuestions(gameType, currentDifficulty);
    };

    // Fallback questions with 3 difficulty levels (age 13 focused)
    const getFallbackQuestions = (gameType, difficultyLevel = 3) => {
        console.log(`Using fallback questions - Difficulty Level ${difficultyLevel}`);
        
        // Define base question sets first
        const dyslexiaQuestions = difficultyLevel === 1 ? [
            {
                type: 'reading',
                instruction: 'Basic Letter Recognition',
                question: 'Which of these is the letter "A"?',
                options: ['A', 'B', 'C', 'D'],
                answer: 'A',
                taskType: 'visual_discrimination',
                difficulty: 1,
                startTime: Date.now()
            },
            {
                type: 'reading',
                instruction: 'Simple Word Reading',
                question: 'Which word says "CAT"?',
                options: ['CAT', 'DOG', 'BAT', 'RAT'],
                answer: 'CAT',
                taskType: 'word_recognition',
                difficulty: 1,
                startTime: Date.now()
            },
            {
                type: 'reading',
                instruction: 'Common Word Identification',
                question: 'Which word spells "THE"?',
                options: ['TEH', 'THE', 'EHT', 'HET'],
                answer: 'THE',
                taskType: 'basic_spelling',
                difficulty: 1,
                startTime: Date.now()
            }
        ] : difficultyLevel === 2 ? [
            {
                type: 'reading',
                instruction: 'Letter Reversal Recognition',
                question: 'Which letter is "b" (not d, p, or q)?',
                options: ['b', 'd', 'p', 'q'],
                answer: 'b',
                taskType: 'visual_discrimination',
                difficulty: 2,
                startTime: Date.now()
            },
            {
                type: 'reading',
                instruction: 'Phonological Blending',
                question: 'Combine these sounds: "c" + "at" = ?',
                options: ['cat', 'bat', 'mat', 'rat'],
                answer: 'cat',
                taskType: 'phonology',
                difficulty: 2,
                startTime: Date.now()
            },
            {
                type: 'reading',
                instruction: 'Simple Rhyming',
                question: 'Which word rhymes with "BOOK"?',
                options: ['Look', 'Boot', 'Boat', 'Back'],
                answer: 'Look',
                taskType: 'phonological_awareness',
                difficulty: 2,
                startTime: Date.now()
            }
        ] : [
            {
                type: 'reading',
                instruction: 'Phonological Manipulation',
                question: 'Remove the "str" sound from "STRAP". What word is left?',
                options: ['Trap', 'Tap', 'Rap', 'Sap'],
                answer: 'Tap',
                taskType: 'phonology',
                difficulty: 3,
                startTime: Date.now()
            },
            {
                type: 'reading',
                instruction: 'Complex Word Recognition',
                question: 'Which is spelled correctly for age 13?',
                options: ['Rhythm', 'Rythm', 'Rhythem', 'Rithm'],
                answer: 'Rhythm',
                taskType: 'advanced_spelling',
                difficulty: 3,
                startTime: Date.now()
            },
            {
                type: 'reading',
                instruction: 'Morphological Awareness',
                question: 'What is the root word in "unhappiness"?',
                options: ['happy', 'unhappy', 'happiness', 'hap'],
                answer: 'happy',
                taskType: 'morphology',
                difficulty: 3,
                startTime: Date.now()
            }
        ];

        const mathQuestions = difficultyLevel === 1 ? [
            {
                type: 'number',
                instruction: 'Basic Addition',
                question: '2 + 2 = ?',
                options: ['3', '4', '5', '6'],
                answer: '4',
                taskType: 'basic_arithmetic',
                difficulty: 1,
                startTime: Date.now()
            },
            {
                type: 'number',
                instruction: 'Simple Counting',
                question: 'How many dots? ●●●●●',
                options: ['4', '5', '6', '7'],
                answer: '5',
                taskType: 'counting',
                difficulty: 1,
                startTime: Date.now()
            },
            {
                type: 'number',
                instruction: 'Number Recognition',
                question: 'Which is the number 7?',
                options: ['7', '1', '9', '4'],
                answer: '7',
                taskType: 'number_recognition',
                difficulty: 1,
                startTime: Date.now()
            }
        ] : difficultyLevel === 2 ? [
            {
                type: 'number',
                instruction: 'Magnitude Comparison',
                question: 'Which number is LARGER: 23 or 17?',
                options: ['23', '17'],
                answer: '23',
                taskType: 'magnitude',
                difficulty: 2,
                startTime: Date.now()
            },
            {
                type: 'number',
                instruction: 'Simple Multiplication',
                question: '6 × 3 = ?',
                options: ['15', '18', '21', '24'],
                answer: '18',
                taskType: 'multiplication',
                difficulty: 2,
                startTime: Date.now()
            },
            {
                type: 'number',
                instruction: 'Number Sequencing',
                question: 'What comes next: 5, 10, 15, __?',
                options: ['18', '20', '25', '30'],
                answer: '20',
                taskType: 'pattern_recognition',
                difficulty: 2,
                startTime: Date.now()
            }
        ] : [
            {
                type: 'number',
                instruction: 'Algebraic Thinking',
                question: 'If x + 7 = 15, what is x?',
                options: ['6', '7', '8', '9'],
                answer: '8',
                taskType: 'algebra',
                difficulty: 3,
                startTime: Date.now()
            },
            {
                type: 'number',
                instruction: 'Fraction Understanding',
                question: 'What is 1/4 of 20?',
                options: ['4', '5', '10', '15'],
                answer: '5',
                taskType: 'fractions',
                difficulty: 3,
                startTime: Date.now()
            },
            {
                type: 'number',
                instruction: 'Multi-step Problem',
                question: 'If 3 books cost $15, how much does 1 book cost?',
                options: ['$3', '$5', '$12', '$18'],
                answer: '$5',
                taskType: 'word_problem',
                difficulty: 3,
                startTime: Date.now()
            }
        ];

        const attentionQuestions = difficultyLevel === 1 ? [
            {
                type: 'attention',
                instruction: 'Basic Memory',
                question: 'Remember: RED. What color was it?',
                options: ['Red', 'Blue', 'Green', 'Yellow'],
                answer: 'Red',
                taskType: 'memory',
                difficulty: 1,
                startTime: Date.now()
            },
            {
                type: 'attention',
                instruction: 'Shape Recognition',
                question: 'Which shape is a circle?',
                options: ['○', '△', '□', '◇'],
                answer: '○',
                taskType: 'shape_id',
                difficulty: 1,
                startTime: Date.now()
            },
            {
                type: 'attention',
                instruction: 'Simple Counting',
                question: 'How many: ★ ★ ★',
                options: ['2', '3', '4', '5'],
                answer: '3',
                taskType: 'counting',
                difficulty: 1,
                startTime: Date.now()
            }
        ] : difficultyLevel === 2 ? [
            {
                type: 'attention',
                instruction: 'Working Memory',
                question: 'Remember: Cat, Dog, Bird. What was second?',
                options: ['Cat', 'Dog', 'Bird', 'Fish'],
                answer: 'Dog',
                taskType: 'sequence_memory',
                difficulty: 2,
                startTime: Date.now()
            },
            {
                type: 'attention',
                instruction: 'Pattern Recognition',
                question: 'What comes next: ○ △ ○ △ ○ ?',
                options: ['○', '△', '□', '◇'],
                answer: '△',
                taskType: 'pattern',
                difficulty: 2,
                startTime: Date.now()
            },
            {
                type: 'attention',
                instruction: 'Spatial Attention',
                question: 'Which is different: ■ ■ □ ■',
                options: ['1st', '2nd', '3rd', '4th'],
                answer: '3rd',
                taskType: 'attention',
                difficulty: 2,
                startTime: Date.now()
            }
        ] : [
            {
                type: 'attention',
                instruction: 'Complex Memory Sequence',
                question: 'Remember: 7, Apple, Blue, Triangle. What was third?',
                options: ['7', 'Apple', 'Blue', 'Triangle'],
                answer: 'Blue',
                taskType: 'working_memory',
                difficulty: 3,
                startTime: Date.now()
            },
            {
                type: 'attention',
                instruction: 'Multi-Step Instructions',
                question: 'If you add 5 to 8, then subtract 3, what do you get?',
                options: ['8', '10', '11', '13'],
                answer: '10',
                taskType: 'executive_function',
                difficulty: 3,
                startTime: Date.now()
            },
            {
                type: 'attention',
                instruction: 'Visual Memory',
                question: 'Which pattern did you NOT see: △○□ ○△□ □○△',
                options: ['△○□', '○△□', '□○△', '○□△'],
                answer: '○□△',
                taskType: 'visual_memory',
                difficulty: 3,
                startTime: Date.now()
            }
        ];
        
        const questionSets = {
            // Dyslexia games
            voidChallenge: dyslexiaQuestions,
            treasureHunter: dyslexiaQuestions,
            lexicalLegends: dyslexiaQuestions,
            matrixReasoning: dyslexiaQuestions,
            
            // Dyscalculia games
            warpExplorer: mathQuestions,
            numberNinja: mathQuestions,
            defenderChallenge: mathQuestions,
            
            // ADHD/Dysgraphia games
            memoryQuest: attentionQuestions,
            focusFlight: attentionQuestions,
            spatialRecall: attentionQuestions,
            bridgeGame: attentionQuestions
        };

        return questionSets[gameType] || dyslexiaQuestions;
    };

    const handleQuestionAnswer = (answer) => {
        if (!questions[currentQuestionIndex]) return; // Safety check
        if (selectedAnswer !== null) return; // Prevent multiple clicks
        
        const question = questions[currentQuestionIndex];
        const timeSpent = (Date.now() - question.startTime) / 1000;
        const isCorrect = answer === question.answer;
        
        // Track performance for adaptive difficulty
        setPerformanceHistory(prev => [...prev, { 
            correct: isCorrect, 
            difficulty: currentDifficulty,
            timeSpent,
            questionType: question.taskType
        }]);
        
        console.log(`📝 Question ${currentQuestionIndex + 1}/${questions.length}: ${isCorrect ? '✅ CORRECT' : '❌ WRONG'} | Level ${currentDifficulty} | Time: ${timeSpent.toFixed(1)}s`);
        
        // ============================================
        // ADAPTIVE DIFFICULTY LOGIC
        // ============================================
        if (currentQuestionIndex < questions.length - 1) { // Don't adjust after last question
            if (currentDifficulty === 3) {
                if (isCorrect) {
                    // Success at expected level - stay at level 3
                    console.log('  ✅ Maintaining Level 3 (performing at grade level)');
                } else {
                    // Failed at level 3 - drop to level 2
                    setCurrentDifficulty(2);
                    console.log('  ⬇️ Dropping to Level 2 (below grade level)');
                }
            } else if (currentDifficulty === 2) {
                if (isCorrect) {
                    // Success at medium - try harder again
                    setCurrentDifficulty(3);
                    console.log('  ⬆️ Increasing to Level 3 (ready for grade-level)');
                } else {
                    // Failed at medium - drop to very easy
                    setCurrentDifficulty(1);
                    console.log('  ⚠️ Dropping to Level 1 (significant struggle)');
                }
            } else if (currentDifficulty === 1) {
                if (isCorrect) {
                    // Success at very easy - move to medium
                    setCurrentDifficulty(2);
                    console.log('  ⬆️ Increasing to Level 2 (basic skills present)');
                } else {
                    // Failed at very easy - CRITICAL INDICATOR
                    console.log('  🚨 FAILURE AT LEVEL 1: HIGH RISK INDICATOR - Cannot perform basic tasks');
                }
            }
        }
        
        // Calculate difficulty based on speed and correctness for risk calculation
        let adjustedDifficulty = currentDifficulty;
        
        // If very fast (< 2 sec) and wrong = impulsive/careless (increase risk)
        if (timeSpent < 2 && !isCorrect) {
            adjustedDifficulty = Math.min(currentDifficulty + 1, 3);
            console.log('  ⚡ Impulsive answer (too fast + wrong)');
        }
        // If very slow (> 10 sec) and wrong = struggling (increase risk)
        else if (timeSpent > 10 && !isCorrect) {
            adjustedDifficulty = Math.min(currentDifficulty + 1, 3);
            console.log('  🐌 Struggling (too slow + wrong)');
        }
        
        // Map question task types to disorder categories for risk calculation
        let taskCategory = 'reading'; // default
        if (question.type === 'number') {
            taskCategory = 'number';
        } else if (question.type === 'attention') {
            taskCategory = 'attention';
        } else if (question.type === 'reading') {
            taskCategory = 'reading';
        }
        
        console.log(`  📊 Recording: ${taskCategory} task, difficulty ${adjustedDifficulty}, ${isCorrect ? 'correct' : 'wrong'}, ${timeSpent.toFixed(1)}s`);
        recordGameAttempt(gameId, taskCategory, adjustedDifficulty, isCorrect, timeSpent);
        
        // Immediately update selectedAnswer to disable buttons
        setSelectedAnswer(answer);
        
        // Determine next action immediately
        const isLastQuestion = currentQuestionIndex >= questions.length - 1;
        
        setTimeout(() => {
            if (isLastQuestion) {
                // All questions answered, proceed to next game
                setShowFailQuestions(false);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setTimeout(() => {
                    if (nextGame) {
                        if (nextGame === 'results') {
                            navigate('/results');
                        } else {
                            navigate(`/play/${nextGame}`);
                        }
                    }
                }, 500);
            } else {
                // Move to next question
                const nextIndex = currentQuestionIndex + 1;
                if (questions[nextIndex]) {
                    // Update both question index and reset selected answer together
                    setCurrentQuestionIndex(nextIndex);
                    setSelectedAnswer(null);
                    // Set start time for next question
                    setQuestions(q => {
                        const updated = [...q];
                        updated[nextIndex].startTime = Date.now();
                        return updated;
                    });
                }
            }
        }, 1500);
    };

    useEffect(() => {
        const handleMessage = (event) => {
            // Ensure message is from our iframe
            if (event.data.type === 'gameComplete') {
                const { score, correct, incorrect, grade } = event.data;
                console.log('Game Complete:', { gameId, score, correct, incorrect, grade });
                
                // Calculate risk based on game score and performance
                let calculatedRisk = 'Low';
                if (score < 100 || incorrect > correct) {
                    calculatedRisk = 'High';
                } else if (score < 200 || grade === 'C') {
                    calculatedRisk = 'Medium';
                }
                
                updateGameResult(gameId, {
                    score,
                    grade: grade || 'B',
                    correct,
                    incorrect,
                    riskLevel: calculatedRisk
                });
                
                console.log('Should show questions?', grade === 'C' || grade === 'F' || score < 150 || incorrect >= correct);
                
                // Check if game was failed (low score, low grade, or more mistakes than correct)
                if (grade === 'C' || grade === 'F' || score < 150 || incorrect >= correct) {
                    setGameFailed(true);
                    console.log('Generating questions for', gameId);
                    // Generate questions asynchronously
                    generateFailQuestions(gameId).then(failQuestions => {
                        console.log('Questions generated:', failQuestions);
                        // Set start time for first question
                        if (failQuestions && failQuestions.length > 0) {
                            failQuestions[0].startTime = Date.now();
                            setQuestions(failQuestions);
                            setCurrentQuestionIndex(0);
                            setSelectedAnswer(null);
                            setShowFailQuestions(true);
                        }
                    });
                } else {
                    // Clear any existing question state before navigating
                    setShowFailQuestions(false);
                    setQuestions([]);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswer(null);
                    setTimeout(() => {
                        if (nextGame === 'results') {
                            navigate('/results');
                        } else {
                            navigate(`/play/${nextGame}`);
                        }
                    }, 2000);
                }
            }
            
            if (event.data.type === 'questionAnswered') {
                const { isCorrect, timeSpent, difficulty, taskType } = event.data;
                
                // Adjust difficulty based on speed in HTML games too
                let adjustedDifficulty = difficulty;
                if (timeSpent < 1.5 && !isCorrect) {
                    adjustedDifficulty = Math.min(difficulty + 1, 3); // Too fast + wrong = impulsive
                }
                
                recordGameAttempt(gameId, taskType, adjustedDifficulty, isCorrect, timeSpent);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [gameId, nextGame, navigate, updateGameResult, recordGameAttempt]);

    // Focus iframe when it loads to enable keyboard input
    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe) {
            const focusIframe = () => {
                try {
                    iframe.contentWindow?.focus();
                } catch (e) {
                    console.warn('Could not focus iframe:', e);
                }
            };
            
            // Focus immediately and after load
            iframe.addEventListener('load', focusIframe);
            focusIframe();
            
            // Also focus when user clicks anywhere on the page
            const handleClick = () => focusIframe();
            document.addEventListener('click', handleClick);
            
            return () => {
                iframe.removeEventListener('load', focusIframe);
                document.removeEventListener('click', handleClick);
            };
        }
    }, []);

    return (
        <div className="w-full h-screen flex items-center justify-center bg-black p-8">
            <div className="w-full max-w-5xl h-[700px] bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <iframe
                    ref={iframeRef}
                    srcDoc={htmlContent}
                    className="w-full h-full border-0"
                    title={gameId}
                    sandbox="allow-scripts"
                    tabIndex="0"
                />
            </div>
            
            {/* Fail Questions Modal */}
            <AnimatePresence>
                {showFailQuestions && questions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border-4 border-yellow-500 max-w-2xl w-full mx-4"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                                    Additional Assessment
                                </h2>
                                <p className="text-gray-300 mb-3">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </p>
                                {questions[currentQuestionIndex].instruction && (
                                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-4">
                                        <p className="text-blue-300 text-sm font-medium">
                                            📚 {questions[currentQuestionIndex].instruction}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-black/30 p-6 rounded-xl mb-6">
                                <p className="text-white text-2xl font-semibold text-center mb-8 whitespace-pre-line">
                                    {questions[currentQuestionIndex].question}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {questions[currentQuestionIndex].options.map((option, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuestionAnswer(option)}
                                            disabled={selectedAnswer !== null}
                                            className={`px-6 py-4 rounded-xl text-xl font-bold transition-all ${
                                                selectedAnswer === null
                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                                    : selectedAnswer === option
                                                    ? option === questions[currentQuestionIndex].answer
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                    : 'bg-gray-700 text-gray-400'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {selectedAnswer && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`text-center text-lg font-bold ${
                                        selectedAnswer === questions[currentQuestionIndex].answer
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                    }`}
                                >
                                    {selectedAnswer === questions[currentQuestionIndex].answer
                                        ? '✓ Correct!'
                                        : '✗ Incorrect'}
                                </motion.p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HTMLGameWrapper;
