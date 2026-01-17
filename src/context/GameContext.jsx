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
        dyscalculia: 0,
        dysgraphia: 0,
        adhd: 0,
        overall: 'Low'
    });

    // Track detailed question-level data for LLM analysis
    const [questionLevelData, setQuestionLevelData] = useState([]);
    
    // Track emotion timeline for correlation analysis
    const [emotionTimeline, setEmotionTimeline] = useState([]);

    const emotionDetectorRef = useRef(null);

    // Initialize emotion detector
    useEffect(() => {
        emotionDetectorRef.current = new EmotionDetector();
        
        // Set up emotion change callback
        emotionDetectorRef.current.onEmotionChange = (emotion, metrics) => {
            setEmotionData({
                currentEmotion: emotion,
                metrics: metrics,
                isActive: true
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
        
        // Add initial risk from questionnaire responses - more granular
        setLearningDisabilityRisk(prevRisk => {
            const updated = { ...prevRisk };
            
            // More precise risk calculation based on questionnaire
            // Each "yes" adds specific risk amount
            if (analysis.dyslexiaScore >= 2) {
                updated.dyslexia = Math.min(updated.dyslexia + 18, 80); // Changed from 25
            } else if (analysis.dyslexiaScore >= 1) {
                updated.dyslexia = Math.min(updated.dyslexia + 8, 80); // Changed from 15
            }
            
            if (analysis.dyscalculiaScore >= 2) {
                updated.dyscalculia = Math.min(updated.dyscalculia + 18, 80);
            } else if (analysis.dyscalculiaScore >= 1) {
                updated.dyscalculia = Math.min(updated.dyscalculia + 8, 80);
            }
            
            if (analysis.adhdScore >= 2) {
                updated.adhd = Math.min(updated.adhd + 18, 80);
            } else if (analysis.adhdScore >= 1) {
                updated.adhd = Math.min(updated.adhd + 8, 80);
            }
            
            if (analysis.dyspraxiaScore >= 1) {
                updated.dyspraxia = Math.min((updated.dyspraxia || 0) + 12, 80);
            }
            
            if (analysis.auditoryScore >= 1) {
                updated.auditoryProcessing = Math.min((updated.auditoryProcessing || 0) + 12, 80);
            }
            
            const maxRisk = Math.max(
                updated.dyslexia, 
                updated.dyscalculia, 
                updated.adhd,
                updated.dyspraxia || 0,
                updated.auditoryProcessing || 0
            );
            updated.overall = maxRisk < 25 ? 'Low' : maxRisk < 50 ? 'Medium' : 'High';
            
            console.log('Questionnaire risk initialized:', updated);
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
            if (difficulty === 1) {
                // LEVEL 1 FAILURE = HIGH RISK INDICATOR
                riskIncrease = 7; // Critical indicator - basic skills missing
                console.log(`🚨 LEVEL 1 FAILURE: +${riskIncrease}% risk (very easy question failed)`);
            } else if (difficulty === 2) {
                // LEVEL 2 FAILURE = MODERATE RISK
                if (timeSpent >= 7) {
                    riskIncrease = 5; // Below grade level + slow
                } else {
                    riskIncrease = 4; // Below grade level
                }
                console.log(`⚠️ LEVEL 2 FAILURE: +${riskIncrease}% risk (below grade level)`);
            } else {
                // LEVEL 3 FAILURE = LOWER RISK (grade appropriate is harder)
                if (timeSpent >= 7) {
                    riskIncrease = 4; // Grade level + slow
                } else if (timeSpent >= 4) {
                    riskIncrease = 3; // Grade level + medium time
                } else {
                    riskIncrease = 2; // Grade level + fast (impulsivity)
                }
                console.log(`ℹ️ LEVEL 3 FAILURE: +${riskIncrease}% risk (grade level difficulty)`);
            }
        } else if (isCorrect) {
            // Correct answer - only add risk if unusually slow
            if (timeSpent >= 8 && difficulty <= 2) {
                riskIncrease = 2; // Correct but very slow on easy/medium = processing concern
                console.log(`🐌 SLOW SUCCESS: +${riskIncrease}% risk (correct but slow on level ${difficulty})`);
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
                    // Good attention = no ADHD, cap at 20%
                    updated.adhd = Math.min(prev.adhd + riskData.adhdRisk, 20);
                } else {
                    // Normal ADHD risk calculation with granular increase, cap at 80%
                    updated.adhd = Math.min(prev.adhd + riskData.adhdRisk + (riskIncrease * 0.5), 80);
                }
                
                // Apply risk based on task type
                if (taskType === 'reading') {
                    updated.dyslexia = Math.min(prev.dyslexia + riskData.totalRisk + riskIncrease, 80);
                    console.log(`  Dyslexia risk: ${prev.dyslexia}% → ${updated.dyslexia}% (+${riskData.totalRisk + riskIncrease}%)`);
                } else if (taskType === 'number') {
                    updated.dyscalculia = Math.min(prev.dyscalculia + riskData.totalRisk + riskIncrease, 80);
                    console.log(`  Dyscalculia risk: ${prev.dyscalculia}% → ${updated.dyscalculia}% (+${riskData.totalRisk + riskIncrease}%)`);
                } else if (taskType === 'writing' || taskType === 'attention') {
                    // Attention tasks can indicate dysgraphia or ADHD
                    updated.dysgraphia = Math.min(prev.dysgraphia + riskData.totalRisk + (riskIncrease * 0.6), 80);
                    updated.adhd = Math.min(prev.adhd + riskData.adhdRisk + (riskIncrease * 0.8), 80);
                    console.log(`  Dysgraphia risk: ${prev.dysgraphia}% → ${updated.dysgraphia}% (+${(riskData.totalRisk + riskIncrease * 0.6).toFixed(1)}%)`);
                    console.log(`  ADHD risk: ${prev.adhd}% → ${updated.adhd}% (+${(riskData.adhdRisk + riskIncrease * 0.8).toFixed(1)}%)`);
                }

                // Calculate overall risk including ADHD (more conservative thresholds)
                const maxRisk = Math.max(updated.dyslexia, updated.dyscalculia, updated.dysgraphia, updated.adhd);
                updated.overall = maxRisk < 25 ? 'Low' : maxRisk < 50 ? 'Medium' : 'High';

                return updated;
            });

            return riskData.totalRisk + riskIncrease;
        }
        return riskIncrease;
        return 0;
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
            
            // Enhanced grade-based risk for better differentiation
            if (grade === 'F') gameRisk = 55; // Poor performance = high risk
            else if (grade === 'C') gameRisk = 32; // Below average
            else if (grade === 'B') gameRisk = 16; // Average
            else if (grade === 'A') gameRisk = 7; // Good
            else if (grade === 'S') gameRisk = 2; // Excellent
            
            // Enhanced accuracy-based adjustment for clearer differentiation
            if (correct !== undefined && incorrect !== undefined) {
                const total = correct + incorrect;
                if (total > 0) {
                    const accuracy = correct / total;
                    if (accuracy < 0.3) gameRisk += 20; // Very poor accuracy
                    else if (accuracy < 0.5) gameRisk += 14; // Poor accuracy
                    else if (accuracy < 0.7) gameRisk += 9; // Below average
                    else if (accuracy < 0.85) gameRisk += 4; // Average
                    else if (accuracy >= 0.95) gameRisk -= 5; // Excellent bonus
                }
            }
            
            // Enhanced score-based adjustment for clear differentiation
            if (score < 50) gameRisk += 18; // Very low score
            else if (score < 100) gameRisk += 12; // Low score
            else if (score < 150) gameRisk += 7; // Below average
            else if (score < 200) gameRisk += 3; // Average
            else if (score >= 300) gameRisk -= 8; // High score bonus
            else if (score >= 400) gameRisk -= 15; // Exceptional bonus
            
            // Apply game-specific risk to appropriate disorders - MORE PRECISE MAPPING
            setLearningDisabilityRisk(prevRisk => {
                const updated = { ...prevRisk };
                
                console.log(`Game ${gameId} completed - Score: ${score}, Grade: ${grade}, Calculated Risk: ${gameRisk}`);
                
                // Map games to disorder types with more specific risk distribution
                if (gameId === 'lexicalLegends') {
                    // Pure reading/dyslexia game - HIGH impact
                    updated.dyslexia = Math.min(updated.dyslexia + gameRisk * 1.2, 80);
                    console.log(`Dyslexia risk increased by ${gameRisk * 1.2} → ${updated.dyslexia}%`);
                } else if (gameId === 'treasureHunter') {
                    // Reading speed and word recognition
                    updated.dyslexia = Math.min(updated.dyslexia + gameRisk * 0.95, 80);
                    console.log(`Dyslexia risk increased by ${gameRisk * 0.95} → ${updated.dyslexia}%`);
                } else if (gameId === 'numberNinja') {
                    // Pure math/dyscalculia game - HIGH impact
                    updated.dyscalculia = Math.min(updated.dyscalculia + gameRisk * 1.15, 80);
                    console.log(`Dyscalculia risk increased by ${gameRisk * 1.15} → ${updated.dyscalculia}%`);
                } else if (gameId === 'defenderChallenge') {
                    // Number sense and operations
                    updated.dyscalculia = Math.min(updated.dyscalculia + gameRisk * 0.9, 80);
                    console.log(`Dyscalculia risk increased by ${gameRisk * 0.9} → ${updated.dyscalculia}%`);
                } else if (gameId === 'spatialRecall') {
                    // Visual-spatial/dysgraphia - HIGH impact
                    updated.dysgraphia = Math.min(updated.dysgraphia + gameRisk * 1.1, 80);
                    console.log(`Dysgraphia risk increased by ${gameRisk * 1.1} → ${updated.dysgraphia}%`);
                } else if (gameId === 'memoryQuest') {
                    // Memory and visual processing
                    updated.dysgraphia = Math.min(updated.dysgraphia + gameRisk * 0.65, 80);
                    console.log(`Dysgraphia risk increased by ${gameRisk * 0.65} → ${updated.dysgraphia}%`);
                } else if (gameId === 'focusFlight' || gameId === 'voidChallenge') {
                    // Attention games - LOW score = HIGH ADHD risk
                    if (score < 100) {
                        // Very poor attention
                        updated.adhd = Math.min(updated.adhd + gameRisk * 1.4, 80);
                        console.log(`ADHD risk increased by ${gameRisk * 1.4} (very low attention) → ${updated.adhd}%`);
                    } else if (score < 200) {
                        // Poor attention
                        updated.adhd = Math.min(updated.adhd + gameRisk * 0.9, 80);
                        console.log(`ADHD risk increased by ${gameRisk * 0.9} (low attention) → ${updated.adhd}%`);
                    } else if (score < 300) {
                        // Average attention
                        updated.adhd = Math.min(updated.adhd + gameRisk * 0.4, 80);
                        console.log(`ADHD risk increased by ${gameRisk * 0.4} (medium attention) → ${updated.adhd}%`);
                    } else if (score >= 350) {
                        // Excellent attention = SIGNIFICANTLY REDUCE ADHD
                        updated.adhd = Math.max(updated.adhd - 10, 0);
                        console.log(`ADHD risk DECREASED (excellent attention) → ${updated.adhd}%`);
                    }
                } else if (gameId === 'matrixReasoning') {
                    // Logic affects reading and math
                    updated.dyslexia = Math.min(updated.dyslexia + gameRisk * 0.25, 80);
                    updated.dyscalculia = Math.min(updated.dyscalculia + gameRisk * 0.4, 80);
                    console.log(`Matrix reasoning affects: Dyslexia +${gameRisk * 0.25}, Dyscalculia +${gameRisk * 0.4}`);
                } else if (gameId === 'warpExplorer') {
                    // Problem solving and strategy
                    updated.dyslexia = Math.min(updated.dyslexia + gameRisk * 0.2, 80);
                    updated.dyscalculia = Math.min(updated.dyscalculia + gameRisk * 0.35, 80);
                    console.log(`Warp explorer affects: Dyslexia +${gameRisk * 0.2}, Dyscalculia +${gameRisk * 0.35}`);
                } else if (gameId === 'bridgeGame') {
                    updated.dyspraxia = Math.min((updated.dyspraxia || 0) + gameRisk * 0.8, 80);
                    console.log(`Dyspraxia risk increased by ${gameRisk * 0.8} → ${updated.dyspraxia}%`);
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
            emotionDetector: emotionDetectorRef.current
        }}>
            {children}
        </GameContext.Provider>
    );
};
