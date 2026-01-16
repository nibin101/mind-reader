// Game state
let bridgePlanks = 0;
let currentTask = null;
let emotionModel = null;
let isGameRunning = false;
let emotionInterval = null;
let detector = null; // Disease detection system
let consecutiveFailures = 0;
let currentTaskType = null;
let questionStartTime = null;

// Emotion labels
const emotions = ['angry', 'disgusted', 'fearful', 'happy', 'neutral', 'sad', 'surprised'];

// Reading tasks with difficulty levels
const readingTasks = {
    easy: [
        {
            question: "Which word starts with 'B'?",
            options: ["APPLE", "BALL", "CAR", "DOG"],
            correct: 1
        },
        {
            question: "Find the word 'CAT'",
            options: ["CAT", "DOG", "RAT", "BAT"],
            correct: 0
        },
        {
            question: "Which is a color?",
            options: ["TABLE", "BLUE", "CHAIR", "BOOK"],
            correct: 1
        }
    ],
    medium: [
        {
            question: "What word rhymes with 'CAT'?",
            options: ["BAT", "DOG", "SUN", "MOON"],
            correct: 0
        },
        {
            question: "Complete: The sky is ___",
            options: ["BLUE", "RED", "GREEN", "YELLOW"],
            correct: 0
        },
        {
            question: "Which word means 'BIG'?",
            options: ["SMALL", "LARGE", "TINY", "SHORT"],
            correct: 1
        }
    ],
    hard: [
        {
            question: "What is the opposite of 'HOT'?",
            options: ["WARM", "COOL", "COLD", "FREEZE"],
            correct: 2
        },
        {
            question: "What is a synonym for 'HAPPY'?",
            options: ["SAD", "JOYFUL", "ANGRY", "TIRED"],
            correct: 1
        },
        {
            question: "Complete: Night is to Day as Dark is to ___",
            options: ["LIGHT", "MOON", "SUN", "BRIGHT"],
            correct: 0
        }
    ]
};

// Number tasks with difficulty levels
const numberTasks = {
    easy: [
        {
            question: "What comes after 5?",
            options: ["4", "6", "7", "8"],
            correct: 1
        },
        {
            question: "What is 1 + 1?",
            options: ["1", "2", "3", "4"],
            correct: 1
        },
        {
            question: "Count: 🍎🍎🍎 = ?",
            options: ["2", "3", "4", "5"],
            correct: 1
        }
    ],
    medium: [
        {
            question: "What is 2 + 3?",
            options: ["4", "5", "6", "7"],
            correct: 1
        },
        {
            question: "What is 10 - 4?",
            options: ["5", "6", "7", "8"],
            correct: 1
        },
        {
            question: "What is 8 ÷ 2?",
            options: ["2", "3", "4", "5"],
            correct: 2
        }
    ],
    hard: [
        {
            question: "What is 3 × 4?",
            options: ["7", "10", "12", "15"],
            correct: 2
        },
        {
            question: "What is 15 - 7?",
            options: ["6", "7", "8", "9"],
            correct: 2
        },
        {
            question: "What is 20 ÷ 4?",
            options: ["4", "5", "6", "7"],
            correct: 1
        }
    ]
};

// Initialize emotion detection
async function initEmotionDetection() {
    try {
        // Request webcam access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 224, height: 224 } 
        });
        document.getElementById('webcam').srcObject = stream;
        
        // Note: In production, load your trained model
        // emotionModel = await tf.loadLayersModel('tfjs_model/model.json');
        
        // Start emotion detection loop
        emotionInterval = setInterval(detectEmotion, 2000);
        
        console.log('Emotion detection started (running locally in browser)');
    } catch (err) {
        console.log('Webcam not available, emotion detection disabled');
        document.getElementById('emotion-detector').textContent = '📷 Camera disabled';
    }
}

// Detect emotion from webcam
async function detectEmotion() {
    if (!emotionModel) {
        // Simulate emotion detection for demo
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        updateEmotionDisplay(randomEmotion);
        return;
    }
    
    const video = document.getElementById('webcam');
    const tensor = tf.browser.fromPixels(video)
        .resizeNearestNeighbor([48, 48])
        .mean(2)
        .expandDims(0)
        .expandDims(-1)
        .div(255.0);
    
    const prediction = await emotionModel.predict(tensor);
    const emotionIndex = prediction.argMax(-1).dataSync()[0];
    const detectedEmotion = emotions[emotionIndex];
    
    updateEmotionDisplay(detectedEmotion);
    
    tensor.dispose();
    prediction.dispose();
}

function updateEmotionDisplay(emotion) {
    const emojis = {
        'angry': '😠',
        'disgusted': '🤢',
        'fearful': '😨',
        'happy': '😊',
        'neutral': '😐',
        'sad': '😢',
        'surprised': '😲'
    };
    
    document.getElementById('emotion-detector').textContent = 
        `${emojis[emotion]} ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`;
    
    // Record emotion in detector
    if (detector && isGameRunning) {
        detector.recordEmotion(emotion);
        updateRiskDisplay();
    }
}

// Start game
async function startGame() {
    isGameRunning = true;
    bridgePlanks = 0;
    consecutiveFailures = 0;
    document.getElementById('startBtn').style.display = 'none';
    
    // Initialize disease detector
    detector = new LearningDisabilityDetector();
    
    // Initialize emotion detection
    await initEmotionDetection();
    
    // Show risk panel
    document.getElementById('riskPanel').style.display = 'block';
    
    // Start first task
    nextTask();
}

// Generate next task
function nextTask() {
    if (bridgePlanks >= 10) {
        winGame();
        return;
    }
    
    // Alternate between reading and number tasks
    currentTaskType = Math.random() < 0.5 ? 'reading' : 'number';
    
    // Get appropriate difficulty level from detector
    const difficultyLevel = detector.getDifficultyLevel(currentTaskType);
    const difficultyNames = ['easy', 'medium', 'hard'];
    const difficulty = difficultyNames[difficultyLevel - 1];
    
    // Select task based on difficulty
    const tasks = currentTaskType === 'reading' ? readingTasks[difficulty] : numberTasks[difficulty];
    currentTask = tasks[Math.floor(Math.random() * tasks.length)];
    
    // Record question start time
    questionStartTime = Date.now();
    
    displayTask();
}

// Update risk display in real-time
function updateRiskDisplay() {
    const report = detector.getAssessmentReport();
    
    document.getElementById('dyslexiaRisk').textContent = 
        `Dyslexia: ${report.riskAssessment.dyslexia.score}%`;
    document.getElementById('dyslexiaRisk').style.color = 
        report.riskAssessment.dyslexia.score >= 70 ? '#D32F2F' :
        report.riskAssessment.dyslexia.score >= 40 ? '#F57C00' : '#388E3C';
    
    document.getElementById('dyscalculiaRisk').textContent = 
        `Dyscalculia: ${report.riskAssessment.dyscalculia.score}%`;
    document.getElementById('dyscalculiaRisk').style.color = 
        report.riskAssessment.dyscalculia.score >= 70 ? '#D32F2F' :
        report.riskAssessment.dyscalculia.score >= 40 ? '#F57C00' : '#388E3C';
    
    document.getElementById('dysgraphiaRisk').textContent = 
        `Dysgraphia: ${report.riskAssessment.dysgraphia.score}%`;
    document.getElementById('dysgraphiaRisk').style.color = 
        report.riskAssessment.dysgraphia.score >= 70 ? '#D32F2F' :
        report.riskAssessment.dysgraphia.score >= 40 ? '#F57C00' : '#388E3C';
}

// Display current task
function displayTask() {
    const questionEl = document.getElementById('question');
    const answersEl = document.getElementById('answers');
    
    questionEl.textContent = currentTask.question;
    answersEl.innerHTML = '';
    
    currentTask.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(index);
        answersEl.appendChild(button);
    });
}

// Check answer
function checkAnswer(selectedIndex) {
    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = selectedIndex === currentTask.correct;
    
    // Record attempt in detector
    detector.recordAttempt(currentTaskType, isCorrect, timeSpent);
    
    if (isCorrect) {
        // Correct answer
        consecutiveFailures = 0;
        addBridgePlank();
        showFeedback('✅ Correct! Bridge plank added!', 'green');
        
        setTimeout(() => {
            nextTask();
        }, 1500);
    } else {
        // Wrong answer
        consecutiveFailures++;
        showFeedback('❌ Try again!', 'red');
        
        // Check if should skip question (too difficult + negative emotion)
        if (detector.shouldSkipQuestion(consecutiveFailures)) {
            showFeedback('Skipping to easier question...', 'orange');
            consecutiveFailures = 0;
            
            setTimeout(() => {
                nextTask();
            }, 2000);
        }
    }
}

// Add bridge plank
function addBridgePlank() {
    bridgePlanks++;
    document.getElementById('score').textContent = `Bridge Progress: ${bridgePlanks}/10 planks`;
    
    const canvas = document.getElementById('gameCanvas');
    const plank = document.createElement('div');
    plank.className = 'bridge-plank';
    plank.style.left = `${10 + bridgePlanks * 8}%`;
    canvas.appendChild(plank);
    
    // Move character forward
    const character = document.getElementById('character');
    character.style.left = `${5 + bridgePlanks * 8}%`;
}

// Show feedback
function showFeedback(message, color) {
    const questionEl = document.getElementById('question');
    const originalText = questionEl.textContent;
    questionEl.textContent = message;
    questionEl.style.color = color;
    
    setTimeout(() => {
        questionEl.style.color = '#333';
    }, 1000);
}

// Win game
function winGame() {
    const questionEl = document.getElementById('question');
    const answersEl = document.getElementById('answers');
    
    questionEl.textContent = '🎉 Bridge Complete! Generating Assessment...';
    questionEl.style.color = '#FFD700';
    questionEl.style.fontSize = '28px';
    answersEl.innerHTML = '';
    
    // Stop emotion detection
    if (emotionInterval) {
        clearInterval(emotionInterval);
    }
    
    // Generate full assessment report
    setTimeout(() => {
        showAssessmentReport();
    }, 1500);
}

// Show detailed assessment report
function showAssessmentReport() {
    const report = detector.getAssessmentReport();
    
    const reportHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; text-align: left; max-width: 700px; margin: 20px auto;">
            <h2 style="color: #2196F3; text-align: center;">Learning Assessment Report</h2>
            
            <div style="background: #F5F5F5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3 style="color: #333;">Performance Summary</h3>
                <p><strong>Total Questions:</strong> ${report.totalQuestions}</p>
                <p><strong>Reading Tasks:</strong> ${report.readingPerformance.success} correct, ${report.readingPerformance.failure} incorrect (${report.readingPerformance.rate}% success)</p>
                <p><strong>Number Tasks:</strong> ${report.numberPerformance.success} correct, ${report.numberPerformance.failure} incorrect (${report.numberPerformance.rate}% success)</p>
            </div>
            
            <div style="background: #FFF3E0; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3 style="color: #333;">Emotional Patterns</h3>
                <p><strong>Rapid Emotion Changes:</strong> ${report.emotionChanges}</p>
                <p><strong>Negative Transitions:</strong> ${report.negativeTransitions}</p>
                <p><strong>Confusion Instances:</strong> ${report.confusionInstances}</p>
            </div>
            
            <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3 style="color: #1B5E20;">Risk Assessment</h3>
                
                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                    <h4 style="color: ${report.riskAssessment.dyslexia.score >= 70 ? '#D32F2F' : report.riskAssessment.dyslexia.score >= 40 ? '#F57C00' : '#388E3C'};">
                        Dyslexia Risk: ${report.riskAssessment.dyslexia.score}%
                    </h4>
                    <p><strong>Level:</strong> ${report.riskAssessment.dyslexia.level}</p>
                    ${report.riskAssessment.dyslexia.indicators.length > 0 ? 
                        '<p><strong>Indicators:</strong></p><ul>' + 
                        report.riskAssessment.dyslexia.indicators.map(i => `<li>${i}</li>`).join('') + 
                        '</ul>' : '<p>No significant indicators</p>'}
                </div>
                
                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                    <h4 style="color: ${report.riskAssessment.dyscalculia.score >= 70 ? '#D32F2F' : report.riskAssessment.dyscalculia.score >= 40 ? '#F57C00' : '#388E3C'};">
                        Dyscalculia Risk: ${report.riskAssessment.dyscalculia.score}%
                    </h4>
                    <p><strong>Level:</strong> ${report.riskAssessment.dyscalculia.level}</p>
                    ${report.riskAssessment.dyscalculia.indicators.length > 0 ? 
                        '<p><strong>Indicators:</strong></p><ul>' + 
                        report.riskAssessment.dyscalculia.indicators.map(i => `<li>${i}</li>`).join('') + 
                        '</ul>' : '<p>No significant indicators</p>'}
                </div>
                
                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                    <h4 style="color: ${report.riskAssessment.dysgraphia.score >= 70 ? '#D32F2F' : report.riskAssessment.dysgraphia.score >= 40 ? '#F57C00' : '#388E3C'};">
                        Dysgraphia Risk: ${report.riskAssessment.dysgraphia.score}%
                    </h4>
                    <p><strong>Level:</strong> ${report.riskAssessment.dysgraphia.level}</p>
                    ${report.riskAssessment.dysgraphia.indicators.length > 0 ? 
                        '<p><strong>Indicators:</strong></p><ul>' + 
                        report.riskAssessment.dysgraphia.indicators.map(i => `<li>${i}</li>`).join('') + 
                        '</ul>' : '<p>No significant indicators</p>'}
                </div>
            </div>
            
            <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196F3;">
                <h3 style="color: #1565C0;">Recommendation</h3>
                <p style="font-size: 16px; line-height: 1.6;">${report.recommendation}</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="downloadReport()" style="padding: 12px 30px; background: #2196F3; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin: 5px;">
                    Download Report
                </button>
                <button onclick="location.reload()" style="padding: 12px 30px; background: #4CAF50; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin: 5px;">
                    New Assessment
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('taskPanel').innerHTML = reportHTML;
}

// Download report as JSON
function downloadReport() {
    const report = detector.getAssessmentReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning_assessment_${Date.now()}.json`;
    link.click();
}

// Initialize
console.log('Bridge Builder Game - All processing runs locally in your browser');
console.log('No data is sent to the cloud');
