# Learning Disability Detection System

## Overview
This system uses emotion tracking and performance analysis to detect potential learning disabilities in students during gameplay.

## Diseases Detected

### 1. Dyslexia (Reading Difficulties)
**Indicators:**
- High failure rate on reading tasks (>60% = high risk)
- Frequent negative emotion transitions during reading
- Pattern: happy → sad → fearful/confused
- Multiple confusion states (fearful, disgusted emotions)
- Rapid emotion changes indicating frustration

**Risk Levels:**
- 70-100%: HIGH - Recommend professional assessment
- 40-69%: MODERATE - Monitor closely
- 20-39%: LOW - Some indicators present
- 0-19%: MINIMAL - No significant concerns

### 2. Dyscalculia (Math Difficulties)
**Indicators:**
- High failure rate on number tasks (>60% = high risk)
- Anxiety/fear specifically during math questions
- Pattern: neutral → fearful → sad
- Negative emotional transitions
- Confusion and avoidance behaviors

**Risk Levels:** Same as dyslexia

### 3. Dysgraphia (Writing/Motor Difficulties)
**Indicators:**
- High failure rate across multiple task types
- Persistent confusion across different activities
- Extremely high emotional volatility (>5 rapid changes)
- General frustration patterns

**Risk Levels:** Same as dyslexia

## Algorithm Features

### 1. Emotion Tracking
- Records emotions every 2 seconds via webcam
- Tracks emotion history (last 20 emotions)
- Detects rapid changes (<3 seconds between changes)
- Identifies negative transitions (happy/neutral → sad/fearful)
- Counts confusion states

### 2. Performance Analysis
- Tracks success/failure by task type
- Calculates failure rates
- Correlates emotions with failures
- Adjusts risk scores based on patterns

### 3. Adaptive Difficulty
- **Auto-decrease**: After 3 attempts with <40% success rate
- **Auto-increase**: After 5 attempts with >80% success rate
- Three levels: Easy, Medium, Hard
- Prevents student frustration

### 4. Question Skipping
**Triggers:**
- 2 consecutive failures + negative emotion (sad/fearful/disgusted/angry)
- Automatically presents easier question
- Reduces anxiety and maintains engagement

### 5. Real-time Assessment
Updates continuously during gameplay:
- Live risk scores displayed
- Color coding: Green (safe), Orange (moderate), Red (high risk)
- Prevents over-testing struggling students

## How It Works

### Step 1: Emotion Capture
```javascript
// Runs every 2 seconds in background
detectEmotion() → recordEmotion(emotion)
```

### Step 2: Question Response
```javascript
// On answer submission
recordAttempt(taskType, isCorrect, timeSpent)
- Updates performance stats
- Calculates risk scores
- Adjusts difficulty
```

### Step 3: Pattern Detection
```javascript
// Checks for specific patterns
hasEmotionPattern(['happy', 'sad', 'fearful'])
- Dyslexia indicator: +20 risk points
```

### Step 4: Risk Calculation
```javascript
calculateRiskScores()
- Combines: failure rate + emotion patterns + transitions
- Max score: 100
```

### Step 5: Report Generation
```javascript
getAssessmentReport()
- Performance summary
- Emotional patterns
- Disease risk scores with indicators
- Professional recommendations
```

## Privacy & Ethics

### Local Processing
✅ All emotion detection runs in browser (TensorFlow.js)
✅ No data sent to cloud
✅ Webcam feed processed locally in real-time
✅ No storage of facial images

### Ethical Use
⚠️ **This is a screening tool, NOT a diagnosis**
- Results suggest potential concerns only
- Professional assessment always required
- Should be used by trained educators/professionals
- Parental consent required for minors

### Data Protection
- No identifiable information stored
- Results downloadable as JSON only
- Student controls when assessment runs
- Can be used offline

## Technical Implementation

### Files
- `detector.js` - Main detection algorithm
- `game.js` - Game integration and UI
- `index.html` - Web interface

### Dependencies
- TensorFlow.js (for local emotion detection)
- Modern browser with webcam support

### Browser Requirements
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Webcam permission required

## Usage Instructions

### For Educators
1. Explain assessment purpose to student
2. Ensure good lighting for webcam
3. Allow student to play naturally (10+ questions)
4. Review report together with student
5. Consult professionals for high-risk results

### For Developers
```javascript
// Initialize detector
const detector = new LearningDisabilityDetector();

// Record emotions
detector.recordEmotion('happy');

// Record attempts
detector.recordAttempt('reading', false, 5000);

// Get report
const report = detector.getAssessmentReport();
```

## Validation & Accuracy

### Current Status
⚠️ **Research/Screening Tool** - Not clinically validated

### To Improve Accuracy
1. Collect more training data
2. Validate against professional diagnoses
3. Add writing tasks for dysgraphia
4. Increase question variety
5. Longer assessment duration

### Limitations
- Cannot diagnose, only screen
- False positives possible
- Affected by: lighting, mood, fatigue
- Requires multiple sessions for reliability

## References & Research

This algorithm is based on patterns from:
- Learning disability research literature
- Emotional response studies
- Cognitive assessment frameworks

**Note:** Always consult qualified professionals (educational psychologists, learning specialists) for formal diagnosis.

## Support & Contribution

This tool aims to help identify students who may benefit from additional support. Early detection improves outcomes when followed by proper intervention.
