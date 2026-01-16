// Disease Detection Algorithm for Learning Disabilities
// Tracks emotion patterns and performance to identify dyslexia, dyscalculia, dysgraphia

class LearningDisabilityDetector {
    constructor() {
        // Emotion tracking
        this.emotionHistory = [];
        this.emotionTimestamps = [];
        
        // Performance tracking by task type
        this.readingAttempts = { success: 0, failure: 0 };
        this.numberAttempts = { success: 0, failure: 0 };
        this.writingAttempts = { success: 0, failure: 0 };
        
        // Emotion patterns tracked
        this.rapidEmotionChanges = 0;
        this.negativeTransitions = 0; // happy/neutral → sad/fearful
        this.confusionStates = 0;
        
        // Difficulty levels
        this.readingDifficulty = 1; // 1=easy, 2=medium, 3=hard
        this.numberDifficulty = 1;
        
        // Disease risk scores (0-100)
        this.riskScores = {
            dyslexia: 0,
            dyscalculia: 0,
            dysgraphia: 0
        };
        
        // Current state
        this.currentEmotion = 'neutral';
        this.previousEmotion = 'neutral';
        this.questionStartTime = Date.now();
    }
    
    // Record new emotion
    recordEmotion(emotion) {
        const now = Date.now();
        
        // Check for rapid emotion change (within 3 seconds)
        if (this.emotionTimestamps.length > 0) {
            const timeSinceLastChange = now - this.emotionTimestamps[this.emotionTimestamps.length - 1];
            if (timeSinceLastChange < 3000 && emotion !== this.currentEmotion) {
                this.rapidEmotionChanges++;
            }
        }
        
        // Check for negative transition (happy/neutral → sad/fearful/disgusted)
        const positiveEmotions = ['happy', 'neutral', 'surprised'];
        const negativeEmotions = ['sad', 'fearful', 'disgusted', 'angry'];
        
        if (positiveEmotions.includes(this.currentEmotion) && 
            negativeEmotions.includes(emotion)) {
            this.negativeTransitions++;
        }
        
        // Track confusion (fearful, disgusted emotions during task)
        if (['fearful', 'disgusted'].includes(emotion)) {
            this.confusionStates++;
        }
        
        // Update current state
        this.previousEmotion = this.currentEmotion;
        this.currentEmotion = emotion;
        
        // Store history
        this.emotionHistory.push(emotion);
        this.emotionTimestamps.push(now);
        
        // Keep only last 20 emotions
        if (this.emotionHistory.length > 20) {
            this.emotionHistory.shift();
            this.emotionTimestamps.shift();
        }
    }
    
    // Record question attempt
    recordAttempt(taskType, isCorrect, timeSpent) {
        const attempts = taskType === 'reading' ? this.readingAttempts : this.numberAttempts;
        
        if (isCorrect) {
            attempts.success++;
        } else {
            attempts.failure++;
            
            // Check emotion during failure
            const negativeEmotions = ['sad', 'fearful', 'disgusted', 'angry'];
            if (negativeEmotions.includes(this.currentEmotion)) {
                // Negative emotion + failure = higher risk indicator
                if (taskType === 'reading') {
                    this.riskScores.dyslexia += 5;
                } else if (taskType === 'number') {
                    this.riskScores.dyscalculia += 5;
                }
            }
        }
        
        // Update difficulty based on performance
        this.updateDifficulty(taskType);
        
        // Calculate risk scores
        this.calculateRiskScores();
    }
    
    // Calculate disease risk scores
    calculateRiskScores() {
        // DYSLEXIA detection
        // Indicators: reading failures, negative emotions, rapid emotion changes
        const readingTotal = this.readingAttempts.success + this.readingAttempts.failure;
        if (readingTotal > 0) {
            const readingFailureRate = this.readingAttempts.failure / readingTotal;
            
            let dyslexiaScore = 0;
            
            // 1. High reading failure rate
            if (readingFailureRate > 0.6) dyslexiaScore += 30;
            else if (readingFailureRate > 0.4) dyslexiaScore += 15;
            
            // 2. Negative emotion transitions during reading
            if (this.negativeTransitions > 3) dyslexiaScore += 20;
            
            // 3. Confusion states
            if (this.confusionStates > 4) dyslexiaScore += 15;
            
            // 4. Rapid emotion changes (frustration indicator)
            if (this.rapidEmotionChanges > 3) dyslexiaScore += 15;
            
            // 5. Pattern: happy → sad → confused
            if (this.hasEmotionPattern(['happy', 'sad', 'fearful'])) {
                dyslexiaScore += 20;
            }
            
            this.riskScores.dyslexia = Math.min(dyslexiaScore, 100);
        }
        
        // DYSCALCULIA detection (math issues)
        // Indicators: number task failures, confusion, anxiety
        const numberTotal = this.numberAttempts.success + this.numberAttempts.failure;
        if (numberTotal > 0) {
            const numberFailureRate = this.numberAttempts.failure / numberTotal;
            
            let dyscalculiaScore = 0;
            
            // 1. High number task failure rate
            if (numberFailureRate > 0.6) dyscalculiaScore += 30;
            else if (numberFailureRate > 0.4) dyscalculiaScore += 15;
            
            // 2. Anxiety/fear during number tasks
            if (this.confusionStates > 4) dyscalculiaScore += 20;
            
            // 3. Negative transitions
            if (this.negativeTransitions > 3) dyscalculiaScore += 20;
            
            // 4. Rapid emotion changes
            if (this.rapidEmotionChanges > 3) dyscalculiaScore += 15;
            
            // 5. Specific anxiety pattern
            if (this.hasEmotionPattern(['neutral', 'fearful', 'sad'])) {
                dyscalculiaScore += 15;
            }
            
            this.riskScores.dyscalculia = Math.min(dyscalculiaScore, 100);
        }
        
        // DYSGRAPHIA detection
        // Note: Limited detection in this game (would need writing tasks)
        // We can infer from general frustration + motor coordination issues
        let dysgraphiaScore = 0;
        
        // High failure rate across both task types suggests broader issues
        const totalAttempts = readingTotal + numberTotal;
        const totalFailures = this.readingAttempts.failure + this.numberAttempts.failure;
        
        if (totalAttempts > 0) {
            const overallFailureRate = totalFailures / totalAttempts;
            
            if (overallFailureRate > 0.5 && this.rapidEmotionChanges > 5) {
                dysgraphiaScore += 25;
            }
            
            // Persistent confusion across multiple tasks
            if (this.confusionStates > 6) {
                dysgraphiaScore += 20;
            }
        }
        
        this.riskScores.dysgraphia = Math.min(dysgraphiaScore, 100);
    }
    
    // Check if emotion pattern exists in recent history
    hasEmotionPattern(pattern) {
        const recentEmotions = this.emotionHistory.slice(-10);
        
        for (let i = 0; i <= recentEmotions.length - pattern.length; i++) {
            let matches = true;
            for (let j = 0; j < pattern.length; j++) {
                if (recentEmotions[i + j] !== pattern[j]) {
                    matches = false;
                    break;
                }
            }
            if (matches) return true;
        }
        return false;
    }
    
    // Update difficulty based on performance
    updateDifficulty(taskType) {
        const attempts = taskType === 'reading' ? this.readingAttempts : this.numberAttempts;
        const total = attempts.success + attempts.failure;
        
        if (total >= 3) {
            const successRate = attempts.success / total;
            
            // Decrease difficulty if struggling
            if (successRate < 0.4) {
                if (taskType === 'reading') {
                    this.readingDifficulty = Math.max(1, this.readingDifficulty - 1);
                } else {
                    this.numberDifficulty = Math.max(1, this.numberDifficulty - 1);
                }
            }
            // Increase difficulty if doing well
            else if (successRate > 0.8 && total >= 5) {
                if (taskType === 'reading') {
                    this.readingDifficulty = Math.min(3, this.readingDifficulty + 1);
                } else {
                    this.numberDifficulty = Math.min(3, this.numberDifficulty + 1);
                }
            }
        }
    }
    
    // Get appropriate difficulty task
    getDifficultyLevel(taskType) {
        return taskType === 'reading' ? this.readingDifficulty : this.numberDifficulty;
    }
    
    // Get assessment report
    getAssessmentReport() {
        const totalQuestions = this.readingAttempts.success + this.readingAttempts.failure +
                              this.numberAttempts.success + this.numberAttempts.failure;
        
        const report = {
            totalQuestions,
            emotionChanges: this.rapidEmotionChanges,
            negativeTransitions: this.negativeTransitions,
            confusionInstances: this.confusionStates,
            
            readingPerformance: {
                success: this.readingAttempts.success,
                failure: this.readingAttempts.failure,
                rate: this.readingAttempts.failure > 0 ? 
                      (this.readingAttempts.success / (this.readingAttempts.success + this.readingAttempts.failure) * 100).toFixed(1) : '100.0'
            },
            
            numberPerformance: {
                success: this.numberAttempts.success,
                failure: this.numberAttempts.failure,
                rate: this.numberAttempts.failure > 0 ?
                      (this.numberAttempts.success / (this.numberAttempts.success + this.numberAttempts.failure) * 100).toFixed(1) : '100.0'
            },
            
            riskAssessment: {
                dyslexia: {
                    score: this.riskScores.dyslexia,
                    level: this.getRiskLevel(this.riskScores.dyslexia),
                    indicators: this.getDyslexiaIndicators()
                },
                dyscalculia: {
                    score: this.riskScores.dyscalculia,
                    level: this.getRiskLevel(this.riskScores.dyscalculia),
                    indicators: this.getDyscalculiaIndicators()
                },
                dysgraphia: {
                    score: this.riskScores.dysgraphia,
                    level: this.getRiskLevel(this.riskScores.dysgraphia),
                    indicators: this.getDysgraphiaIndicators()
                }
            },
            
            recommendation: this.getRecommendation()
        };
        
        return report;
    }
    
    // Get risk level description
    getRiskLevel(score) {
        if (score >= 70) return 'HIGH - Recommend professional assessment';
        if (score >= 40) return 'MODERATE - Monitor closely';
        if (score >= 20) return 'LOW - Some indicators present';
        return 'MINIMAL - No significant concerns';
    }
    
    // Get specific dyslexia indicators
    getDyslexiaIndicators() {
        const indicators = [];
        const readingTotal = this.readingAttempts.success + this.readingAttempts.failure;
        
        if (readingTotal > 0) {
            const failureRate = this.readingAttempts.failure / readingTotal;
            if (failureRate > 0.5) indicators.push('High reading task failure rate');
        }
        
        if (this.negativeTransitions > 3) indicators.push('Frequent negative emotional responses');
        if (this.confusionStates > 4) indicators.push('Multiple confusion states during reading');
        if (this.hasEmotionPattern(['happy', 'sad', 'fearful'])) indicators.push('Frustration pattern detected');
        
        return indicators;
    }
    
    // Get specific dyscalculia indicators
    getDyscalculiaIndicators() {
        const indicators = [];
        const numberTotal = this.numberAttempts.success + this.numberAttempts.failure;
        
        if (numberTotal > 0) {
            const failureRate = this.numberAttempts.failure / numberTotal;
            if (failureRate > 0.5) indicators.push('High math task failure rate');
        }
        
        if (this.confusionStates > 4) indicators.push('Anxiety during number tasks');
        if (this.negativeTransitions > 3) indicators.push('Negative emotional patterns');
        
        return indicators;
    }
    
    // Get specific dysgraphia indicators
    getDysgraphiaIndicators() {
        const indicators = [];
        
        if (this.rapidEmotionChanges > 5) indicators.push('High emotional volatility');
        if (this.confusionStates > 6) indicators.push('Persistent confusion across tasks');
        
        return indicators;
    }
    
    // Get overall recommendation
    getRecommendation() {
        const maxScore = Math.max(
            this.riskScores.dyslexia,
            this.riskScores.dyscalculia,
            this.riskScores.dysgraphia
        );
        
        if (maxScore >= 70) {
            return 'URGENT: High risk indicators detected. Strongly recommend consultation with educational psychologist or learning specialist.';
        } else if (maxScore >= 40) {
            return 'MODERATE: Some concerning patterns observed. Consider screening assessment by qualified professional.';
        } else if (maxScore >= 20) {
            return 'LOW: Minor indicators present. Continue monitoring and provide supportive environment.';
        } else {
            return 'POSITIVE: No significant learning disability indicators detected. Continue engaging learning activities.';
        }
    }
    
    // Should skip current question?
    shouldSkipQuestion(consecutiveFailures) {
        // Skip after 2 consecutive failures with negative emotions
        if (consecutiveFailures >= 2) {
            const negativeEmotions = ['sad', 'fearful', 'disgusted', 'angry'];
            if (negativeEmotions.includes(this.currentEmotion)) {
                return true;
            }
        }
        return false;
    }
}

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningDisabilityDetector;
}
