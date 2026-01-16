// Story Game Engine with Emotion Detection Integration
let storyData = null;
let currentSegment = 0;
let emotionDetector = null;
let emotionInterval = null;

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Initialize emotion detection (from existing system)
async function initEmotionDetection() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 224, height: 224 } 
        });
        
        // Simulate emotion detection for demo
        emotionInterval = setInterval(() => {
            const emotions = ['happy', 'neutral', 'sad', 'fearful', 'surprised'];
            const emotion = emotions[Math.floor(Math.random() * emotions.length)];
            updateEmotionIndicator(emotion);
        }, 2000);
        
        console.log('Emotion detection active');
    } catch (err) {
        console.log('Webcam not available, emotion detection disabled');
        document.getElementById('emotionIndicator').textContent = '📷 Camera disabled';
    }
}

function updateEmotionIndicator(emotion) {
    const emojis = {
        'happy': '😊',
        'sad': '😢',
        'fearful': '😨',
        'angry': '😠',
        'neutral': '😐',
        'surprised': '😲'
    };
    document.getElementById('emotionIndicator').textContent = 
        `${emojis[emotion] || '😐'} Tracking emotions`;
}

// Start the adventure
async function startAdventure() {
    // Hide start screen
    document.getElementById('startScreen').classList.add('hidden');
    
    // Show loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.classList.remove('hidden');
    
    // Initialize emotion detection
    await initEmotionDetection();
    
    // Generate story
    await generateStory();
    
    // Hide loading, show story
    loadingScreen.classList.add('hidden');
    document.getElementById('storyContainer').classList.remove('hidden');
    
    // Start displaying story segments
    displayStorySequentially();
}

// Generate story from API
async function generateStory() {
    try {
        updateLoadingText('Connecting to story generator...');
        
        const response = await fetch(`${API_BASE_URL}/generate-story`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate story');
        }
        
        updateLoadingText('Creating magical images...');
        const data = await response.json();
        
        if (data.success) {
            storyData = data.story;
            document.getElementById('storyTitle').textContent = storyData.storyTitle;
        } else {
            throw new Error(data.error || 'Story generation failed');
        }
        
    } catch (error) {
        console.error('Error generating story:', error);
        // Use fallback story
        storyData = getFallbackStory();
    }
}

// Display story segments one by one
async function displayStorySequentially() {
    const storyContent = document.getElementById('storyContent');
    
    for (let i = 0; i < storyData.segments.length; i++) {
        currentSegment = i;
        updateProgress((i / storyData.segments.length) * 100);
        
        const segment = storyData.segments[i];
        
        // Create segment element
        const segmentEl = createSegmentElement(segment, i + 1);
        storyContent.appendChild(segmentEl);
        
        // Scroll into view
        segmentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Show "before" phase
        await showPhase(segmentEl, 'before');
        await wait(2000); // Wait 2 seconds
        
        // Show game slot
        await showGameSlot(segmentEl);
        
        // Wait for game completion (simulated for now)
        await simulateGameCompletion(segment, i + 1);
        
        // Show "after" phase
        await showPhase(segmentEl, 'after');
        await wait(2000); // Wait 2 seconds before next segment
    }
    
    // Update progress to 100%
    updateProgress(100);
    
    // Show completion message
    showCompletionMessage();
}

// Create segment HTML element
function createSegmentElement(segment, number) {
    const segmentEl = document.createElement('div');
    segmentEl.className = 'segment';
    segmentEl.style.animationDelay = '0.2s';
    
    segmentEl.innerHTML = `
        <span class="segment-number">Chapter ${number}: ${segment.location}</span>
        
        <!-- Before Challenge Phase -->
        <div class="story-phase phase-before" data-phase="before" style="display: none;">
            <div class="story-image loading" data-image="before">
                <img src="" alt="Before challenge" style="display: none;">
            </div>
            <div class="story-text">
                <h3>The Challenge</h3>
                <p>${segment.beforeChallenge.sentence}</p>
            </div>
        </div>
        
        <!-- Game Slot -->
        <div class="game-slot" data-game-slot style="display: none;">
            <h3>🎮 Challenge ${number}</h3>
            <p>${segment.challenge}</p>
            <div class="game-placeholder">
                [ Game ${number} will be inserted here by your team ]
            </div>
        </div>
        
        <!-- After Success Phase -->
        <div class="story-phase phase-after" data-phase="after" style="display: none;">
            <div class="story-text">
                <h3>Success!</h3>
                <p>${segment.afterSuccess.sentence}</p>
            </div>
            <div class="story-image loading" data-image="after">
                <img src="" alt="After success" style="display: none;">
            </div>
        </div>
    `;
    
    // Load images
    loadSegmentImages(segmentEl, segment);
    
    return segmentEl;
}

// Load images for segment
function loadSegmentImages(segmentEl, segment) {
    // Load "before" image
    const beforeImg = segmentEl.querySelector('[data-image="before"] img');
    const beforeContainer = segmentEl.querySelector('[data-image="before"]');
    
    if (segment.beforeChallenge.imageUrl) {
        beforeImg.onload = () => {
            beforeContainer.classList.remove('loading');
            beforeImg.style.display = 'block';
        };
        beforeImg.src = segment.beforeChallenge.imageUrl;
    } else {
        // Use placeholder
        beforeImg.src = `https://via.placeholder.com/400x400/FFB6B9/FFFFFF?text=Before+Challenge`;
        beforeImg.style.display = 'block';
        beforeContainer.classList.remove('loading');
    }
    
    // Load "after" image
    const afterImg = segmentEl.querySelector('[data-image="after"] img');
    const afterContainer = segmentEl.querySelector('[data-image="after"]');
    
    if (segment.afterSuccess.imageUrl) {
        afterImg.onload = () => {
            afterContainer.classList.remove('loading');
            afterImg.style.display = 'block';
        };
        afterImg.src = segment.afterSuccess.imageUrl;
    } else {
        // Use placeholder
        afterImg.src = `https://via.placeholder.com/400x400/A8E6CF/FFFFFF?text=Success!`;
        afterImg.style.display = 'block';
        afterContainer.classList.remove('loading');
    }
}

// Show specific phase (before/after)
async function showPhase(segmentEl, phase) {
    const phaseEl = segmentEl.querySelector(`[data-phase="${phase}"]`);
    phaseEl.style.display = 'flex';
    return wait(100);
}

// Show game slot
async function showGameSlot(segmentEl) {
    const gameSlot = segmentEl.querySelector('[data-game-slot]');
    gameSlot.style.display = 'block';
    return wait(100);
}

// Simulate game completion (will be replaced with actual game)
async function simulateGameCompletion(segment, gameNumber) {
    // For now, just wait to simulate game play
    // In production, this will wait for actual game completion
    await wait(3000);
    
    console.log(`Game ${gameNumber} completed!`);
    
    // Here you would integrate with the actual learning disability detector
    // Example: detector.recordAttempt(taskType, isCorrect, timeSpent);
}

// Show completion message
function showCompletionMessage() {
    const storyContent = document.getElementById('storyContent');
    
    const completionEl = document.createElement('div');
    completionEl.className = 'segment';
    completionEl.innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <h2 style="font-size: 48px; color: #667eea; margin-bottom: 20px;">
                🎉 Adventure Complete!
            </h2>
            <p style="font-size: 24px; color: #555; margin-bottom: 30px;">
                Luna made it across the river! You helped her overcome all challenges!
            </p>
            <button onclick="location.href='index.html'" style="padding: 15px 40px; font-size: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 50px; cursor: pointer; font-family: inherit;">
                View Assessment Report
            </button>
            <button onclick="location.reload()" style="padding: 15px 40px; font-size: 20px; background: #4CAF50; color: white; border: none; border-radius: 50px; cursor: pointer; margin-left: 10px; font-family: inherit;">
                Play Again
            </button>
        </div>
    `;
    
    storyContent.appendChild(completionEl);
}

// Update progress bar
function updateProgress(percent) {
    document.getElementById('progressBar').style.width = `${percent}%`;
}

// Update loading text
function updateLoadingText(text) {
    document.getElementById('loadingText').textContent = text;
}

// Utility: wait function
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fallback story (if API fails)
function getFallbackStory() {
    return {
        storyTitle: "Luna's Bridge Adventure",
        protagonist: "Luna",
        segments: [
            {
                segmentNumber: 1,
                location: "The Riverbank",
                beforeChallenge: {
                    sentence: "Luna stands at the river's edge, looking sadly at the broken bridge ahead.",
                    imagePrompt: "A young girl with brown hair looking sad at a broken wooden bridge over a blue river",
                    imageUrl: "https://via.placeholder.com/400x400/FFB6B9/FFFFFF?text=Broken+Bridge"
                },
                challenge: "Help Luna identify rhyming words to rebuild the bridge planks",
                afterSuccess: {
                    sentence: "Luna smiles with joy as the first bridge planks magically appear beneath her feet!",
                    imagePrompt: "A happy young girl standing on new wooden planks over a river",
                    imageUrl: "https://via.placeholder.com/400x400/A8E6CF/FFFFFF?text=Bridge+Built!"
                }
            },
            {
                segmentNumber: 2,
                location: "The Stepping Stones",
                beforeChallenge: {
                    sentence: "Luna faces a series of floating stepping stones, but they're covered with number puzzles!",
                    imagePrompt: "Girl looking worried at floating stones with numbers in a river",
                    imageUrl: "https://via.placeholder.com/400x400/FFB6B9/FFFFFF?text=Number+Stones"
                },
                challenge: "Solve addition problems to reveal the safe path across the stones",
                afterSuccess: {
                    sentence: "Luna leaps joyfully from stone to stone, each number lighting up as she passes!",
                    imagePrompt: "Happy girl jumping on glowing stepping stones",
                    imageUrl: "https://via.placeholder.com/400x400/A8E6CF/FFFFFF?text=Path+Found!"
                }
            },
            {
                segmentNumber: 3,
                location: "The Letter Gate",
                beforeChallenge: {
                    sentence: "A tall gate blocks Luna's path, locked with mixed-up letters that need matching.",
                    imagePrompt: "Girl looking confused at a gate with scattered letters",
                    imageUrl: "https://via.placeholder.com/400x400/FFB6B9/FFFFFF?text=Locked+Gate"
                },
                challenge: "Match uppercase and lowercase letters to unlock the magical gate",
                afterSuccess: {
                    sentence: "The gate swings open with a musical chime as Luna celebrates her victory!",
                    imagePrompt: "Excited girl walking through an open ornate gate",
                    imageUrl: "https://via.placeholder.com/400x400/A8E6CF/FFFFFF?text=Gate+Open!"
                }
            },
            {
                segmentNumber: 4,
                location: "The Pattern Bridge",
                beforeChallenge: {
                    sentence: "Luna discovers a bridge with missing pieces, showing only mysterious shape patterns.",
                    imagePrompt: "Girl looking puzzled at a bridge with geometric pattern gaps",
                    imageUrl: "https://via.placeholder.com/400x400/FFB6B9/FFFFFF?text=Pattern+Puzzle"
                },
                challenge: "Complete the shape patterns to repair the enchanted bridge",
                afterSuccess: {
                    sentence: "Luna dances across the now-complete bridge as colorful patterns glow beneath her!",
                    imagePrompt: "Happy girl dancing on a bridge with glowing geometric patterns",
                    imageUrl: "https://via.placeholder.com/400x400/A8E6CF/FFFFFF?text=Bridge+Complete!"
                }
            },
            {
                segmentNumber: 5,
                location: "Grandmother's Cottage",
                beforeChallenge: {
                    sentence: "Luna sees her grandmother's cottage but must arrange story pictures in the right order to open the final path.",
                    imagePrompt: "Girl looking determined at scattered story picture cards near a cottage",
                    imageUrl: "https://via.placeholder.com/400x400/FFB6B9/FFFFFF?text=Final+Challenge"
                },
                challenge: "Arrange the story events in the correct sequence to reveal the path",
                afterSuccess: {
                    sentence: "Luna runs into her grandmother's warm embrace as the cottage door opens wide with a rainbow appearing overhead!",
                    imagePrompt: "Girl hugging grandmother at cottage door with rainbow in sky",
                    imageUrl: "https://via.placeholder.com/400x400/A8E6CF/FFFFFF?text=Journey+Complete!"
                }
            }
        ]
    };
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (emotionInterval) {
        clearInterval(emotionInterval);
    }
});

console.log('Story Game Engine loaded');
console.log('API URL:', API_BASE_URL);
