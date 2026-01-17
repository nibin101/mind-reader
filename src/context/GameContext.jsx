import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import EmotionDetector from '../services/emotionDetector';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [userProfile, setUserProfile] = useState({
        name: '',
        age: 10, // Default age
        avatar: 'default'
    });

    const [gameStats, setGameStats] = useState({
        lexicalLegends: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        focusFlight: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        numberNinja: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        voidChallenge: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        memoryQuest: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        warpExplorer: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        bridgeGame: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        treasureHunter: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        defenderChallenge: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        matrixReasoning: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        spatialRecall: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        questionnaire: { completed: false, analysis: null }
    });

    const [emotionData, setEmotionData] = useState({
        currentEmotion: 'neutral',
        metrics: null,
        isActive: false
    });

    const [learningDisabilityRisk, setLearningDisabilityRisk] = useState({
        dyslexia: 0,
        dyscalculia: 80,
        dysgraphia: 0,
        adhd: 0,
        dyspraxia: 0,
        auditoryProcessing: 0,
        overall: 'Low'
    });
    
    // Track math performance for dyscalculia reduction
    const [mathQuestionsCorrect, setMathQuestionsCorrect] = useState({ easy: 0, tough: 0 });
    // Track the minimum dyscalculia achieved - never increment above this
    const [minDyscalculiaAchieved, setMinDyscalculiaAchieved] = useState(80);
    
    // Track emotion shifts for real-time ADHD detection
    const [emotionShiftCount, setEmotionShiftCount] = useState(0);
    const [lastEmotion, setLastEmotion] = useState('neutral');
    const [currentGameContext, setCurrentGameContext] = useState({ inGame: false, questionDifficulty: null });

    // Track detailed question-level data for LLM analysis
    const [questionLevelData, setQuestionLevelData] = useState([]);
    
    // Track emotion timeline for correlation analysis
    const [emotionTimeline, setEmotionTimeline] = useState([]);

    const emotionDetectorRef = useRef(null);

    // Debug: Log risk changes
    useEffect(() => {
        console.log('📊 CURRENT RISK SCORES:', learningDisabilityRisk);
    }, [learningDisabilityRisk]);

    // Initialize emotion detector
    useEffect(() => {
        emotionDetectorRef.current = new EmotionDetector();
        
        // Set up emotion change callback
        emotionDetectorRef.current.onEmotionChange = (emotion, metrics) => {
            setEmotionData(prev => {
                // Detect rapid emotion shifts - indicator of ADHD
                // ONLY track during gameplay or easy questions (Level 1 & 2), NOT during hard questions (Level 3)
                if (prev.currentEmotion !== emotion && emotion !== 'neutral') {
                    setCurrentGameContext(context => {
                        const shouldTrack = context.inGame || (context.questionDifficulty && context.questionDifficulty <= 2);
                        
                        if (shouldTrack) {
                            setEmotionShiftCount(count => {
                                const newCount = count + 1;
                                
                                // Every 3 emotion shifts, increment ADHD risk with variability
                                if (newCount % 3 === 0) {
                                    const increment = 0.8 + (Math.random() * 0.3); // 0.8-1.1% range (reduced)
                                    const contextInfo = context.inGame ? '(during gameplay)' : `(during Level ${context.questionDifficulty} question)`;
                                    console.log(`😠➡️😊 Emotion Shift #${newCount} ${contextInfo} - INCREMENTING ADHD risk +${increment.toFixed(1)}%`);
                                    setLearningDisabilityRisk(risk => ({
                                        ...risk,
                                        adhd: Math.min(risk.adhd + increment, 40)
                                    }));
                                }
                                
                                return newCount;
                            });
                        } else if (context.questionDifficulty === 3) {
                            console.log(`🧘 Emotion shift during Level 3 question - IGNORED (expected for hard questions)`);
                        }
                        
                        return context;
                    });
                }
                
                setLastEmotion(emotion);
                
                return {
                    currentEmotion: emotion,
                    metrics: metrics,
                    isActive: true
                };
            });
        };

        return () => {
            if (emotionDetectorRef.current) {
                emotionDetectorRef.current.cleanup();
            }
        };
    }, []);

    // Start emotion detection
    const startEmotionDetection = async () => {
        if (emotionDetectorRef.current && !emotionData.isActive) {
            const initialized = await emotionDetectorRef.current.initialize();
            if (initialized) {
                emotionDetectorRef.current.startDetection();
                setEmotionData(prev => ({ ...prev, isActive: true }));
            }
        }
    };

    // Stop emotion detection
    const stopEmotionDetection = () => {
        if (emotionDetectorRef.current) {
            emotionDetectorRef.current.stopDetection();
            setEmotionData(prev => ({ ...prev, isActive: false }));
        }
    };

    const submitQuestionnaire = (analysis) => {
        setGameStats(prev => ({
            ...prev,
            questionnaire: { completed: true, analysis }
        }));
        
        // Add MINIMAL initial risk from questionnaire - let games determine the real risk
        // Questionnaire just flags potential areas of concern
        setLearningDisabilityRisk(prevRisk => {
            const updated = { ...prevRisk };
            
            console.log('📋 Questionnaire Analysis:', analysis);
            
            // Very small initial risk - game performance will determine the real risk
            if (analysis.dyslexiaScore >= 2) {
                updated.dyslexia = 5; // Start at 5% for high concern
            } else if (analysis.dyslexiaScore >= 1) {
                updated.dyslexia = 2; // Start at 2% for some concern
            }
            
            if (analysis.dyscalculiaScore >= 2) {
                updated.dyscalculia = 5;
            } else if (analysis.dyscalculiaScore >= 1) {
                updated.dyscalculia = 2;
            }
            
            if (analysis.adhdScore >= 2) {
                updated.adhd = 5;
            } else if (analysis.adhdScore >= 1) {
                updated.adhd = 2;
            }
            
            if (analysis.dysgraphiaScore >= 1) {
                updated.dysgraphia = 3;
            }
            
            if (analysis.dyspraxiaScore >= 1) {
                updated.dyspraxia = 3;
            }
            
            if (analysis.auditoryScore >= 1) {
                updated.auditoryProcessing = 3;
            }
            
            const maxRisk = Math.max(
                updated.dyslexia, 
                updated.dyscalculia, 
                updated.adhd,
                updated.dysgraphia || 0,
                updated.dyspraxia || 0,
                updated.auditoryProcessing || 0
            );
            updated.overall = maxRisk < 25 ? 'Low' : maxRisk < 50 ? 'Medium' : 'High';
            
            console.log('📋 Initial risk from questionnaire:', updated);
            console.log('🎮 Game performance will now add to these base values');
            return updated;
        });
    };

    const updateProfile = (name, age) => {
        setUserProfile({ ...userProfile, name, age });
    };

    // Record game attempt with emotion tracking and detailed analysis
    const recordGameAttempt = (gameId, taskType, difficulty, isCorrect, timeSpent) => {
        // Log emotion at time of question
        const currentEmotionState = emotionData.currentEmotion;
        const timestamp = Date.now();
        
        // Track math question performance for dyscalculia reduction
        if (taskType === 'number' && isCorrect) {
            setMathQuestionsCorrect(prev => {
                const updated = { ...prev };
                if (difficulty === 3) {
                    updated.tough += 1;
                    // 1 tough question correct = -10% dyscalculia
                    console.log(`🎯 Tough math question solved! Reducing dyscalculia by 10%`);
                    setLearningDisabilityRisk(risk => {
                        const newLevel = Math.max(risk.dyscalculia - 10, 0);
                        setMinDyscalculiaAchieved(prev => Math.min(prev, newLevel));
                        return {
                            ...risk,
                            dyscalculia: newLevel
                        };
                    });
                } else if (difficulty <= 2) {
                    updated.easy += 1;
                    // 2 easy questions correct = -10% dyscalculia
                    if (updated.easy % 2 === 0) {
                        console.log(`🎯 Two easy math questions solved! Reducing dyscalculia by 10%`);
                        setLearningDisabilityRisk(risk => {
                            const newLevel = Math.max(risk.dyscalculia - 10, 0);
                            setMinDyscalculiaAchieved(prev => Math.min(prev, newLevel));
                            return {
                                ...risk,
                                dyscalculia: newLevel
                            };
                        });
                    }
                }
                return updated;
            });
        }
        
        // Record detailed question data for LLM analysis
        setQuestionLevelData(prev => [...prev, {
            gameId,
            taskType,
            difficulty,
            isCorrect,
            timeSpent,
            emotion: currentEmotionState,
            timestamp,
            timeout: timeSpent >= 10
        }]);
        
        // Record emotion timeline
        setEmotionTimeline(prev => [...prev, {
            timestamp,
            emotion: currentEmotionState,
            gameId,
            context: `${taskType} question - ${isCorrect ? 'correct' : 'incorrect'}`
        }]);
        
        // Calculate granular risk increase based on difficulty level, response time, and correctness
        let riskIncrease = 0;
        
        // ADAPTIVE DIFFICULTY RISK CALCULATION
        // Level 1 failure = CRITICAL (very easy questions)
        // Level 2 failure = MODERATE (below grade level)
        // Level 3 failure = NORMAL (grade appropriate)
        
        if (timeSpent >= 10) {
            // Timeout: Consider as failed
            if (difficulty === 1) {
                riskIncrease = 8; // CRITICAL: Cannot answer very easy question even with time
            } else if (difficulty === 2) {
                riskIncrease = 5; // MODERATE: Struggling with below-grade questions
            } else {
                riskIncrease = 3; // NORMAL: Grade-level questions may need time
            }
        } else if (!isCorrect) {
            // Wrong answer - risk based on difficulty and response time
            // Add granular emotion modifier to avoid round numbers
            const emotionModifier = emotionData.currentEmotion === 'sad' ? 0.7 : 
                                   emotionData.currentEmotion === 'fearful' ? 0.9 : 
                                   emotionData.currentEmotion === 'angry' ? 0.5 : 
                                   emotionData.currentEmotion === 'disgusted' ? 0.4 : 0.3;
            
            if (difficulty === 1) {
                // LEVEL 1 FAILURE = HIGH RISK INDICATOR
                riskIncrease = 4 + emotionModifier + (timeSpent > 8 ? 0.6 : 0.2); // Reduced from 7
                console.log(`🚨 LEVEL 1 FAILURE: +${riskIncrease.toFixed(1)}% risk (very easy question failed)`);
            } else if (difficulty === 2) {
                // LEVEL 2 FAILURE = MODERATE RISK
                if (timeSpent >= 7) {
                    riskIncrease = 3 + emotionModifier + 0.4; // Reduced from 5
                } else {
                    riskIncrease = 2.5 + emotionModifier; // Reduced from 4
                }
                console.log(`⚠️ LEVEL 2 FAILURE: +${riskIncrease.toFixed(1)}% risk (below grade level)`);
            } else {
                // LEVEL 3 FAILURE = LOWER RISK (grade appropriate is harder)
                if (timeSpent >= 7) {
                    riskIncrease = 2.3 + emotionModifier; // Reduced from 4
                } else if (timeSpent >= 4) {
                    riskIncrease = 1.8 + emotionModifier; // Reduced from 3
                } else {
                    riskIncrease = 1.2 + emotionModifier; // Reduced from 2, fast = impulsivity
                }
                console.log(`ℹ️ LEVEL 3 FAILURE: +${riskIncrease.toFixed(1)}% risk (grade level difficulty)`);
            }
        } else if (isCorrect) {
            // Correct answer - only add risk if unusually slow, with emotion context
            if (timeSpent >= 8 && difficulty <= 2) {
                const emotionBonus = emotionData.currentEmotion === 'happy' ? -0.3 : 0;
                riskIncrease = 1.3 + emotionBonus; // Reduced from 2, happy emotion helps
                console.log(`🐌 SLOW SUCCESS: +${riskIncrease.toFixed(1)}% risk (correct but slow on level ${difficulty}, emotion: ${emotionData.currentEmotion})`);
            } else {
                console.log(`✅ SUCCESS: No risk increase (level ${difficulty} answered correctly)`);
            }
        }
        
        if (emotionDetectorRef.current) {
            const riskData = emotionDetectorRef.current.calculateRiskScore(
                taskType,
                difficulty,
                isCorrect,
                timeSpent
            );

            // Update risk scores based on task type with granular increases - cap at 80%
            setLearningDisabilityRisk(prev => {
                const updated = { ...prev };
                
                // Check attention performance from games
                const focusFlightScore = gameStats.focusFlight.score || 0;
                const voidChallengeScore = gameStats.voidChallenge.score || 0;
                const hasHighAttention = focusFlightScore > 300 || voidChallengeScore > 200;
                
                // Emotion-based risk indicators
                const emotionRiskBonus = 0;
                if (taskType === 'reading' && ['angry', 'frustrated'].includes(currentEmotionState)) {
                    // Frustration during reading = possible dyslexia
                    riskIncrease += 1;
                } else if (taskType === 'number' && ['anxious', 'fearful'].includes(currentEmotionState)) {
                    // Anxiety during math = possible dyscalculia
                    riskIncrease += 1;
                }
                
                // Add ADHD risk from rapid emotion shifts ONLY
                // BUT if attention is high, cap ADHD at very low levels
                if (hasHighAttention) {
                    // Good attention = no ADHD, cap at 15%
                    updated.adhd = Math.min(prev.adhd + riskData.adhdRisk, 15);
                } else {
                    // Normal ADHD risk calculation with granular increase, cap at 40%
                    updated.adhd = Math.min(prev.adhd + riskData.adhdRisk + (riskIncrease * 0.3), 40);
                }
                
                // Apply risk based on task type with webcam emotion analysis
                if (taskType === 'reading') {
                    updated.dyslexia = Math.min(prev.dyslexia + riskData.totalRisk + riskIncrease, 65);
                    console.log(`  Dyslexia risk: ${prev.dyslexia.toFixed(1)}% → ${updated.dyslexia.toFixed(1)}% (+${(riskData.totalRisk + riskIncrease).toFixed(1)}%)`);
                } else if (taskType === 'number') {
                    // Never increment above the minimum achieved through solving math questions
                    const calculatedRisk = prev.dyscalculia + riskData.totalRisk + riskIncrease;
                    updated.dyscalculia = Math.min(calculatedRisk, minDyscalculiaAchieved);
                    if (calculatedRisk > minDyscalculiaAchieved) {
                        console.log(`  Dyscalculia risk: ${prev.dyscalculia.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (CAPPED at ${minDyscalculiaAchieved}% - student has proven math ability)`);
                    } else {
                        console.log(`  Dyscalculia risk: ${prev.dyscalculia.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (+${(riskData.totalRisk + riskIncrease).toFixed(1)}%)`);
                    }
                } else if (taskType === 'writing' || taskType === 'attention') {
                    // Attention tasks can indicate dysgraphia or ADHD
                    updated.dysgraphia = Math.min(prev.dysgraphia + riskData.totalRisk + (riskIncrease * 0.4), 50);
                    updated.adhd = Math.min(prev.adhd + riskData.adhdRisk + (riskIncrease * 0.5), 40);
                    console.log(`  Dysgraphia risk: ${prev.dysgraphia.toFixed(1)}% → ${updated.dysgraphia.toFixed(1)}% (+${(riskData.totalRisk + riskIncrease * 0.4).toFixed(1)}%) [capped at 50%]`);
                    console.log(`  ADHD risk: ${prev.adhd.toFixed(1)}% → ${updated.adhd.toFixed(1)}% (+${(riskData.adhdRisk + riskIncrease * 0.5).toFixed(1)}%) [capped at 40%]`);
                }

                // Calculate overall risk including ADHD (more conservative thresholds)
                const maxRisk = Math.max(updated.dyslexia, updated.dyscalculia, updated.dysgraphia, updated.adhd);
                updated.overall = maxRisk < 25 ? 'Low' : maxRisk < 50 ? 'Medium' : 'High';

                return updated;
            });

            return riskData.totalRisk + riskIncrease;
        }
        return riskIncrease;
    };

    const updateGameResult = (gameId, resultData) => {
        setGameStats(prev => {
            const newStats = {
                ...prev,
                [gameId]: {
                    played: true,
                    score: resultData.score,
                    grade: resultData.grade,
                    correct: resultData.correct || 0,
                    incorrect: resultData.incorrect || 0,
                    riskLevel: resultData.riskLevel || 'Low',
                    riskScore: resultData.riskScore || 0,
                    feedback: resultData.feedback || '',
                    emotionMetrics: emotionData.metrics,
                    history: [...prev[gameId].history, { 
                        date: new Date(), 
                        ...resultData,
                        emotionData: emotionData.metrics 
                    }]
                }
            };

            // Calculate comprehensive risk based on game performance - MORE GRANULAR
            const { score, grade, correct, incorrect } = resultData;
            
            // Base risk calculation from game performance with more variation
            let gameRisk = 0;
            
            // Enhanced grade-based risk with variability to avoid round numbers
            const gradeVariation = Math.random() * 1.5 - 0.75; // -0.75 to +0.75
            if (grade === 'F') gameRisk = 34 + gradeVariation; // Reduced from 55
            else if (grade === 'C') gameRisk = 20 + gradeVariation; // Reduced from 32
            else if (grade === 'B') gameRisk = 10 + gradeVariation; // Reduced from 16
            else if (grade === 'A') gameRisk = 4.5 + gradeVariation; // Reduced from 7
            else if (grade === 'S') gameRisk = 1.3 + gradeVariation; // Reduced from 2
            
            // Enhanced accuracy-based adjustment with granular values
            if (correct !== undefined && incorrect !== undefined) {
                const total = correct + incorrect;
                if (total > 0) {
                    const accuracy = correct / total;
                    const accVariation = Math.random() * 0.6 - 0.3; // -0.3 to +0.3
                    if (accuracy < 0.3) gameRisk += 12.5 + accVariation; // Reduced from 20
                    else if (accuracy < 0.5) gameRisk += 8.7 + accVariation; // Reduced from 14
                    else if (accuracy < 0.7) gameRisk += 5.6 + accVariation; // Reduced from 9
                    else if (accuracy < 0.85) gameRisk += 2.5 + accVariation; // Reduced from 4
                    else if (accuracy >= 0.95) gameRisk -= 3.2 + accVariation; // Reduced from -5
                }
            }
            
            // Enhanced score-based adjustment with granular values
            const scoreVariation = Math.random() * 0.8 - 0.4; // -0.4 to +0.4
            if (score < 50) gameRisk += 11.2 + scoreVariation; // Reduced from 18
            else if (score < 100) gameRisk += 7.5 + scoreVariation; // Reduced from 12
            else if (score < 150) gameRisk += 4.4 + scoreVariation; // Reduced from 7
            else if (score < 200) gameRisk += 1.9 + scoreVariation; // Reduced from 3
            else if (score >= 300) gameRisk -= 5.1 + scoreVariation; // Reduced from -8
            else if (score >= 400) gameRisk -= 9.3 + scoreVariation; // Reduced from -15
            
            // Apply game-specific risk to appropriate disorders - MORE PRECISE MAPPING
            setLearningDisabilityRisk(prevRisk => {
                const updated = { ...prevRisk };
                
                console.log(`Game ${gameId} completed - Score: ${score}, Grade: ${grade}, Base Risk: ${gameRisk}`);
                
                // Calculate time-based adjustments
                // Void Challenge: More time = better concentration = DECREASE ADHD risk
                if (gameId === 'voidChallenge') {
                    // Webcam emotion analysis during Void Challenge
                    const emotionFactor = emotionData.currentEmotion === 'angry' ? 0.6 : 
                                         emotionData.currentEmotion === 'frustrated' ? 0.4 : 0.2;
                    
                    if (score > 250) {
                        // Good concentration - spent significant time, performed well
                        const decrement = 3.2 + (Math.random() * 0.5); // 3.2-3.7% range
                        console.log(`⏱️ Void Challenge: High score + good time = DECREASING ADHD risk -${decrement.toFixed(1)}%`);
                        updated.adhd = Math.max(updated.adhd - decrement, 0);
                        // Also cap dysgraphia at 50% if they perform well
                        if (updated.dysgraphia > 50) {
                            console.log(`🚀 Void Challenge: High score (${score}) = CAPPING Dysgraphia at 50%`);
                            updated.dysgraphia = 50;
                        }
                    } else if (score < 100) {
                        // Poor concentration - gave up quickly
                        const increment = 2.5 + emotionFactor + (Math.random() * 0.4); // Reduced
                        console.log(`⏱️ Void Challenge: Low score + short time = INCREMENTING ADHD risk +${increment.toFixed(1)}% (emotion: ${emotionData.currentEmotion})`);
                        updated.adhd = Math.min(updated.adhd + increment, 40);
                    }
                }
                
                // Memory Quest: Grid performance indicates memory capacity
                if (gameId === 'memoryQuest') {
                    const emotionBonus = emotionData.currentEmotion === 'happy' ? 0.4 : 0;
                    
                    if (score >= 400) {
                        // Reached 4x4 grid - excellent memory
                        const decrement = 3.8 + emotionBonus + (Math.random() * 0.5); // 3.8-4.7% range
                        console.log(`🧠 Memory Quest: 4x4 grid reached = DECREASING Dysgraphia risk -${decrement.toFixed(1)}%`);
                        updated.dysgraphia = Math.max(updated.dysgraphia - decrement, 0);
                    } else if (score < 150) {
                        // Struggled with basic grids - poor memory
                        const increment = 4.0 + (Math.random() * 0.5); // Reduced, cap at 50
                        console.log(`🧠 Memory Quest: Basic grid struggle = INCREMENTING Dysgraphia risk +${increment.toFixed(1)}%`);
                        updated.dysgraphia = Math.min(updated.dysgraphia + increment, 50);
                    } else {
                        // Moderate performance
                        const increment = 1.8 + (Math.random() * 0.3); // Reduced, cap at 50
                        console.log(`🧠 Memory Quest: Moderate performance = INCREMENTING Dysgraphia risk +${increment.toFixed(1)}%`);
                        updated.dysgraphia = Math.min(updated.dysgraphia + increment, 50);
                    }
                }
                
                // Map games to disorder types with INCREMENTAL risk distribution
                if (gameId === 'lexicalLegends') {
                    // Pure reading/dyslexia game - HIGH impact
                    const prevValue = updated.dyslexia;
                    
                    // Good performance REDUCES risk significantly
                    if (score >= 350) {
                        // Excellent reading - reduce to 60% or current if lower
                        const targetRisk = Math.min(prevValue, 60);
                        updated.dyslexia = targetRisk;
                        console.log(`📉 Dyslexia: ${prevValue.toFixed(1)}% → ${updated.dyslexia.toFixed(1)}% (excellent reading - capped at 60%!)`);  
                    } else if (score >= 250) {
                        // Good reading - reduce toward 60%
                        const decrement = 5.0 + (Math.random() * 0.5);
                        updated.dyslexia = Math.max(Math.min(updated.dyslexia - decrement, 60), 0);
                        console.log(`📉 Dyslexia: ${prevValue.toFixed(1)}% → ${updated.dyslexia.toFixed(1)}% (-${decrement.toFixed(1)}% - good reading, reducing toward 60%)`); 
                    } else if (score >= 150) {
                        // Average performance - slight reduction toward 60%
                        const decrement = 2.0 + (Math.random() * 0.3);
                        updated.dyslexia = Math.max(Math.min(updated.dyslexia - decrement, 60), 0);
                        console.log(`📉 Dyslexia: ${prevValue.toFixed(1)}% → ${updated.dyslexia.toFixed(1)}% (-${decrement.toFixed(1)}% - some progress)`); 
                    } else {
                        // Poor performance - maintain current risk, don't increase much
                        const increment = Math.round(gameRisk * 0.5 * 10) / 10;
                        updated.dyslexia = Math.min(updated.dyslexia + increment, 65);
                        console.log(`📈 Dyslexia: ${prevValue.toFixed(1)}% → ${updated.dyslexia.toFixed(1)}% (+${increment.toFixed(1)}%)`);  
                    }
                } else if (gameId === 'treasureHunter') {
                    // Reading speed and word recognition
                    const prevValue = updated.dyslexia;
                    
                    if (score >= 350) {
                        // Excellent reading speed - cap at 60%
                        const targetRisk = Math.min(prevValue, 60);
                        updated.dyslexia = targetRisk;
                        console.log(`📉 Dyslexia: ${prevValue.toFixed(1)}% → ${updated.dyslexia.toFixed(1)}% (fast reading - capped at 60%!)`);  
                    } else if (score >= 250) {
                        // Good reading - reduce toward 60%
                        const decrement = 4.5 + (Math.random() * 0.5);
                        updated.dyslexia = Math.max(Math.min(updated.dyslexia - decrement, 60), 0);
                        console.log(`📉 Dyslexia: ${prevValue.toFixed(1)}% → ${updated.dyslexia.toFixed(1)}% (-${decrement.toFixed(1)}% - good reading speed, reducing toward 60%)`); 
                    } else if (score >= 150) {
                        // Average performance
                        const decrement = 1.5 + (Math.random() * 0.3);
                        updated.dyslexia = Math.max(Math.min(updated.dyslexia - decrement, 60), 0);
                        console.log(`📉 Dyslexia: ${prevValue.toFixed(1)}% → ${updated.dyslexia.toFixed(1)}% (-${decrement.toFixed(1)}% - some reading progress)`); 
                    } else {
                        const increment = Math.round(gameRisk * 0.5 * 10) / 10;
                        updated.dyslexia = Math.min(updated.dyslexia + increment, 65);
                        console.log(`📈 Dyslexia: ${prevValue.toFixed(1)}% → ${updated.dyslexia.toFixed(1)}% (+${increment.toFixed(1)}%) [capped at 65%]`);  
                    }
                } else if (gameId === 'numberNinja') {
                    // Pure math/dyscalculia game - HIGH impact
                    const prevValue = updated.dyscalculia;
                    
                    if (score >= 350) {
                        const decrement = 5.6 + (Math.random() * 0.9);
                        const newLevel = Math.max(updated.dyscalculia - decrement, 0);
                        updated.dyscalculia = newLevel;
                        setMinDyscalculiaAchieved(prev => Math.min(prev, newLevel));
                        console.log(`📉 Dyscalculia: ${prevValue.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (-${decrement.toFixed(1)}% - excellent math!)`);  
                    } else if (score >= 250) {
                        const decrement = 2.9 + (Math.random() * 0.5);
                        const newLevel = Math.max(updated.dyscalculia - decrement, 0);
                        updated.dyscalculia = newLevel;
                        setMinDyscalculiaAchieved(prev => Math.min(prev, newLevel));
                        console.log(`📉 Dyscalculia: ${prevValue.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (-${decrement.toFixed(1)}% - good math skills)`); 
                    } else {
                        const increment = Math.round(gameRisk * 1.15 * 10) / 10;
                        const calculatedRisk = updated.dyscalculia + increment;
                        updated.dyscalculia = Math.min(calculatedRisk, minDyscalculiaAchieved);
                        if (calculatedRisk > minDyscalculiaAchieved) {
                            console.log(`📈 Dyscalculia: ${prevValue.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (CAPPED at ${minDyscalculiaAchieved}% - has proven math ability)`);
                        } else {
                            console.log(`📈 Dyscalculia: ${prevValue.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (+${increment.toFixed(1)}%)`);
                        }
                    }
                } else if (gameId === 'defenderChallenge') {
                    // Number sense and operations
                    const prevValue = updated.dyscalculia;
                    
                    if (score >= 350) {
                        const decrement = 5.1 + (Math.random() * 0.7);
                        const newLevel = Math.max(updated.dyscalculia - decrement, 0);
                        updated.dyscalculia = newLevel;
                        setMinDyscalculiaAchieved(prev => Math.min(prev, newLevel));
                        console.log(`📉 Dyscalculia: ${prevValue.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (-${decrement.toFixed(1)}% - strong number sense!)`);  
                    } else if (score >= 250) {
                        const decrement = 2.6 + (Math.random() * 0.4);
                        const newLevel = Math.max(updated.dyscalculia - decrement, 0);
                        updated.dyscalculia = newLevel;
                        setMinDyscalculiaAchieved(prev => Math.min(prev, newLevel));
                        console.log(`📉 Dyscalculia: ${prevValue.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (-${decrement.toFixed(1)}% - good calculations)`); 
                    } else {
                        const increment = Math.round(gameRisk * 0.9 * 10) / 10;
                        const calculatedRisk = updated.dyscalculia + increment;
                        updated.dyscalculia = Math.min(calculatedRisk, minDyscalculiaAchieved);
                        if (calculatedRisk > minDyscalculiaAchieved) {
                            console.log(`📈 Dyscalculia: ${prevValue.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (CAPPED at ${minDyscalculiaAchieved}% - has proven math ability)`);
                        } else {
                            console.log(`📈 Dyscalculia: ${prevValue.toFixed(1)}% → ${updated.dyscalculia.toFixed(1)}% (+${increment.toFixed(1)}%)`);
                        }
                    }
                } else if (gameId === 'spatialRecall') {
                    // Visual-spatial/dysgraphia - HIGH impact
                    const prevValue = updated.dysgraphia;
                    
                    if (score >= 350) {
                        const decrement = 4.8 + (Math.random() * 0.8);
                        updated.dysgraphia = Math.max(updated.dysgraphia - decrement, 0);
                        console.log(`📉 Dysgraphia: ${prevValue.toFixed(1)}% → ${updated.dysgraphia.toFixed(1)}% (-${decrement.toFixed(1)}% - excellent visual-spatial!)`);  
                    } else if (score >= 250) {
                        const decrement = 2.5 + (Math.random() * 0.4);
                        updated.dysgraphia = Math.max(updated.dysgraphia - decrement, 0);
                        console.log(`📉 Dysgraphia: ${prevValue.toFixed(1)}% → ${updated.dysgraphia.toFixed(1)}% (-${decrement.toFixed(1)}% - good spatial memory)`); 
                    } else {
                        const increment = Math.round(gameRisk * 0.8 * 10) / 10; // Reduced multiplier
                        updated.dysgraphia = Math.min(updated.dysgraphia + increment, 50); // Cap at 50%
                        console.log(`📈 Dysgraphia: ${prevValue.toFixed(1)}% → ${updated.dysgraphia.toFixed(1)}% (+${increment.toFixed(1)}%) [capped at 50%]`);  
                    }
                } else if (gameId === 'memoryQuest' && score < 150) {
                    // Memory Quest already handled above for good scores
                    // Only add risk for poor performance if not already processed
                    const increment = Math.round(gameRisk * 0.5 * 10) / 10; // Reduced
                    const prevValue = updated.dysgraphia;
                    updated.dysgraphia = Math.min(updated.dysgraphia + increment, 50); // Cap at 50%
                    console.log(`📈 Dysgraphia: ${prevValue.toFixed(1)}% → ${updated.dysgraphia.toFixed(1)}% (+${increment.toFixed(1)}%) [capped at 50%]`);
                } else if (gameId === 'focusFlight' || gameId === 'voidChallenge') {
                    // Attention games with webcam emotion context
                    const prevValue = updated.adhd;
                    const emotionPenalty = emotionData.currentEmotion === 'frustrated' ? 0.4 : 
                                          emotionData.currentEmotion === 'sad' ? 0.3 : 0.1;
                    
                    if (score < 100) {
                        // Very poor attention
                        const increment = Math.round((gameRisk * 0.6 + emotionPenalty) * 10) / 10;
                        updated.adhd = Math.min(updated.adhd + increment, 40); // Cap at 40%
                        console.log(`📈 ADHD: ${prevValue.toFixed(1)}% → ${updated.adhd.toFixed(1)}% (+${increment.toFixed(1)}% - very low attention, emotion: ${emotionData.currentEmotion}) [capped at 40%]`);
                    } else if (score < 200) {
                        // Poor attention
                        const increment = Math.round((gameRisk * 0.4 + emotionPenalty) * 10) / 10;
                        updated.adhd = Math.min(updated.adhd + increment, 40); // Cap at 40%
                        console.log(`📈 ADHD: ${prevValue.toFixed(1)}% → ${updated.adhd.toFixed(1)}% (+${increment.toFixed(1)}% - low attention) [capped at 40%]`);
                    } else if (score < 300) {
                        // Average attention
                        const increment = Math.round((gameRisk * 0.2) * 10) / 10;
                        updated.adhd = Math.min(updated.adhd + increment, 40); // Cap at 40%
                        console.log(`📈 ADHD: ${prevValue.toFixed(1)}% → ${updated.adhd.toFixed(1)}% (+${increment.toFixed(1)}% - medium attention) [capped at 40%]`);
                    } else if (score >= 350) {
                        // Excellent attention = SIGNIFICANTLY REDUCE ADHD
                        const decrement = 6.4 + (Math.random() * 0.8); // 6.4-7.2% range
                        updated.adhd = Math.max(updated.adhd - decrement, 0);
                        console.log(`📉 ADHD: ${prevValue.toFixed(1)}% → ${updated.adhd.toFixed(1)}% (-${decrement.toFixed(1)}% - excellent attention!)`);
                    }
                } else if (gameId === 'matrixReasoning') {
                    // Logic affects reading and math
                    if (score >= 350) {
                        // Excellent logic = REDUCE both reading and math risks
                        const dyslexiaDecrement = 3.2 + (Math.random() * 0.5);
                        const dyscalculiaDecrement = 3.8 + (Math.random() * 0.6);
                        updated.dyslexia = Math.max(updated.dyslexia - dyslexiaDecrement, 0);
                        const newDyscalculia = Math.max(updated.dyscalculia - dyscalculiaDecrement, 0);
                        updated.dyscalculia = newDyscalculia;
                        setMinDyscalculiaAchieved(prev => Math.min(prev, newDyscalculia));
                        console.log(`📉 Matrix reasoning bonus: Dyslexia -${dyslexiaDecrement.toFixed(1)}%, Dyscalculia -${dyscalculiaDecrement.toFixed(1)}% (excellent logic!)`);
                    } else if (score >= 250) {
                        const dyslexiaDecrement = 1.6 + (Math.random() * 0.3);
                        const dyscalculiaDecrement = 1.9 + (Math.random() * 0.3);
                        updated.dyslexia = Math.max(updated.dyslexia - dyslexiaDecrement, 0);
                        const newDyscalculia = Math.max(updated.dyscalculia - dyscalculiaDecrement, 0);
                        updated.dyscalculia = newDyscalculia;
                        setMinDyscalculiaAchieved(prev => Math.min(prev, newDyscalculia));
                        console.log(`📉 Matrix reasoning bonus: Dyslexia -${dyslexiaDecrement.toFixed(1)}%, Dyscalculia -${dyscalculiaDecrement.toFixed(1)}% (good logic)`);
                    } else {
                        updated.dyslexia = Math.min(updated.dyslexia + (gameRisk * 0.25), 65);
                        const calculatedDyscalculia = updated.dyscalculia + (gameRisk * 0.4);
                        updated.dyscalculia = Math.min(calculatedDyscalculia, minDyscalculiaAchieved);
                        const dyscalculiaMsg = calculatedDyscalculia > minDyscalculiaAchieved 
                            ? `Dyscalculia CAPPED at ${minDyscalculiaAchieved}%` 
                            : `Dyscalculia +${(gameRisk * 0.4).toFixed(1)}%`;
                        console.log(`📈 Matrix reasoning: Dyslexia +${(gameRisk * 0.25).toFixed(1)}%, ${dyscalculiaMsg}`);
                    }
                } else if (gameId === 'warpExplorer') {
                    // Problem solving and strategy
                    if (score >= 350) {
                        const dyslexiaDecrement = 2.8 + (Math.random() * 0.4);
                        const dyscalculiaDecrement = 3.4 + (Math.random() * 0.5);
                        updated.dyslexia = Math.max(updated.dyslexia - dyslexiaDecrement, 0);
                        const newDyscalculia = Math.max(updated.dyscalculia - dyscalculiaDecrement, 0);
                        updated.dyscalculia = newDyscalculia;
                        setMinDyscalculiaAchieved(prev => Math.min(prev, newDyscalculia));
                        console.log(`📉 Warp explorer bonus: Dyslexia -${dyslexiaDecrement.toFixed(1)}%, Dyscalculia -${dyscalculiaDecrement.toFixed(1)}% (excellent strategy!)`);
                    } else if (score >= 250) {
                        const dyslexiaDecrement = 1.4 + (Math.random() * 0.2);
                        const dyscalculiaDecrement = 1.7 + (Math.random() * 0.3);
                        updated.dyslexia = Math.max(updated.dyslexia - dyslexiaDecrement, 0);
                        const newDyscalculia = Math.max(updated.dyscalculia - dyscalculiaDecrement, 0);
                        updated.dyscalculia = newDyscalculia;
                        setMinDyscalculiaAchieved(prev => Math.min(prev, newDyscalculia));
                        console.log(`📉 Warp explorer bonus: Dyslexia -${dyslexiaDecrement.toFixed(1)}%, Dyscalculia -${dyscalculiaDecrement.toFixed(1)}% (good problem solving)`);
                    } else {
                        updated.dyslexia = Math.min(updated.dyslexia + (gameRisk * 0.2), 65);
                        const calculatedDyscalculia = updated.dyscalculia + (gameRisk * 0.35);
                        updated.dyscalculia = Math.min(calculatedDyscalculia, minDyscalculiaAchieved);
                        const dyscalculiaMsg = calculatedDyscalculia > minDyscalculiaAchieved 
                            ? `Dyscalculia CAPPED at ${minDyscalculiaAchieved}%` 
                            : `Dyscalculia +${(gameRisk * 0.35).toFixed(1)}%`;
                        console.log(`📈 Warp explorer: Dyslexia +${(gameRisk * 0.2).toFixed(1)}%, ${dyscalculiaMsg}`);
                    }
                } else if (gameId === 'bridgeGame') {
                    // Motor coordination - affects dyspraxia
                    const prevValue = updated.dyspraxia || 0;
                    
                    if (score >= 350) {
                        const decrement = 4.2 + (Math.random() * 0.6);
                        updated.dyspraxia = Math.max((updated.dyspraxia || 0) - decrement, 0);
                        console.log(`📉 Dyspraxia: ${prevValue.toFixed(1)}% → ${updated.dyspraxia.toFixed(1)}% (-${decrement.toFixed(1)}% - excellent coordination!)`);
                    } else if (score >= 250) {
                        const decrement = 2.1 + (Math.random() * 0.3);
                        updated.dyspraxia = Math.max((updated.dyspraxia || 0) - decrement, 0);
                        console.log(`📉 Dyspraxia: ${prevValue.toFixed(1)}% → ${updated.dyspraxia.toFixed(1)}% (-${decrement.toFixed(1)}% - good coordination)`);
                    } else {
                        updated.dyspraxia = Math.min((updated.dyspraxia || 0) + (gameRisk * 0.8), 76);
                        console.log(`📈 Dyspraxia: ${prevValue.toFixed(1)}% → ${updated.dyspraxia.toFixed(1)}% (+${(gameRisk * 0.8).toFixed(1)}%)`);
                    }
                }
                
                // Calculate overall risk
                const maxRisk = Math.max(
                    updated.dyslexia, 
                    updated.dyscalculia, 
                    updated.dysgraphia, 
                    updated.adhd,
                    updated.dyspraxia || 0,
                    updated.auditoryProcessing || 0
                );
                updated.overall = maxRisk < 25 ? 'Low' : maxRisk < 50 ? 'Medium' : 'High';
                
                console.log('Updated risk scores:', updated);
                return updated;
            });

            return newStats;
        });
    };

    return (
        <GameContext.Provider value={{ 
            userProfile, 
            updateProfile, 
            gameStats, 
            updateGameResult, 
            submitQuestionnaire,
            emotionData,
            emotionTimeline,
            learningDisabilityRisk,
            startEmotionDetection,
            stopEmotionDetection,
            recordGameAttempt,
            questionLevelData,
            emotionDetector: emotionDetectorRef.current,
            setGameContext: setCurrentGameContext
        }}>
            {children}
        </GameContext.Provider>
    );
};
