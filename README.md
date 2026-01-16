# Bridge Builder Game - Learning Disability Detection System

## 🎮 Game Overview
A web-based educational game that helps identify potential learning disabilities through emotion tracking and performance analysis. Players help a cartoon character cross a river by building a bridge while answering reading and number tasks.

## 🧠 Detection Capabilities

### Diseases Monitored:
1. **Dyslexia** - Reading difficulties
2. **Dyscalculia** - Math/number difficulties  
3. **Dysgraphia** - Writing/motor difficulties

### How It Works:
- Tracks emotions in real-time via webcam (runs locally)
- Monitors rapid emotion changes (happy → sad → confused)
- Detects failure patterns on specific task types
- Adapts difficulty automatically
- Skips questions when student shows frustration + failure
- Generates comprehensive assessment report

## 🔒 Privacy & Local Processing
**ALL processing happens locally in your browser. No data is sent to the cloud.**

- Emotion detection runs using TensorFlow.js in the browser
- Camera feed is processed locally in real-time
- No images or data are uploaded anywhere
- Complete privacy protection
- No cloud services used

## 🎯 Game Features
- **Character**: Cartoon child emoji (🧒)
- **Storyline**: Cross the river by building a bridge
- **Tasks**:
  1. Reading tasks (word recognition, rhyming, opposites) - 3 difficulty levels
  2. Number tasks (basic arithmetic, counting) - 3 difficulty levels
- **Adaptive difficulty**: Questions get easier/harder based on performance
- **Auto-skip**: Skips questions causing frustration
- **Real-time assessment**: Live risk scores displayed during gameplay

## 🚀 Quick Start

### Run Directly (Simplest Method)
```bash
cd public
python3 -m http.server 8000
# Visit: http://localhost:8000
```

### With Node.js (Optional)
```bash
npm install
npm start
```

## 📁 Files
- `public/index.html` - Main game page with UI
- `public/game.js` - Game logic and integration
- `public/detector.js` - **Disease detection algorithm**
- `train_model.py` - Train emotion recognition model
- `ALGORITHM_DOCS.md` - **Detailed algorithm documentation**
- `README_PRIVACY.md` - Privacy documentation

## 🎲 How to Play
1. Click "Start Assessment"
2. Allow webcam access (processes locally)
3. Answer reading and number questions
4. Each correct answer adds a bridge plank
5. Questions adapt based on your performance
6. Complete 10 questions to see full assessment report

## 🧠 Emotion Detection (Background)
The game continuously monitors emotions:
- Runs entirely in browser using TensorFlow.js
- Detects: angry, disgusted, fearful, happy, neutral, sad, surprised
- Tracks patterns: rapid changes, negative transitions
- No cloud upload - 100% local processing
- Can be disabled if camera unavailable

## 📊 Assessment Report Includes
- Performance by task type (reading vs. numbers)
- Emotion pattern analysis
- Risk scores for each learning disability (0-100%)
- Specific indicators detected
- Professional recommendations
- Downloadable JSON report

## ⚙️ Algorithm Details

### Risk Calculation
**Dyslexia (Reading):**
- High reading failure rate (>60%): +30 points
- Negative emotion transitions: +20 points
- Confusion states: +15 points
- Rapid emotion changes: +15 points
- Pattern (happy→sad→fearful): +20 points

**Dyscalculia (Math):**
- High math failure rate (>60%): +30 points
- Anxiety during numbers: +20 points
- Negative transitions: +20 points
- Rapid changes: +15 points
- Fear pattern: +15 points

**Dysgraphia (Writing):**
- High overall failure rate: +25 points
- Extreme volatility (>5 changes): +20 points
- Persistent confusion: +20 points

### Adaptive Difficulty
- **Decreases** after 3 attempts with <40% success
- **Increases** after 5 attempts with >80% success
- Prevents frustration and maintains engagement

### Question Skipping
Automatically skips when:
- 2 consecutive failures + negative emotion detected
- Presents easier alternative question
- Reduces anxiety

## 🔬 Training the Model (Optional)
```bash
pip install -r requirements.txt
python train_model.py
```
This trains the emotion detection model on your train/test data and converts it to TensorFlow.js format.

## ⚠️ Important Notes

### This is a Screening Tool, NOT a Diagnosis
- Suggests potential concerns only
- Professional assessment always required
- Use by trained educators/professionals recommended
- Parental consent required for minors

### Accuracy Factors
- Lighting conditions affect emotion detection
- Student mood and fatigue matter
- Multiple sessions improve reliability
- False positives are possible

### Ethical Use
- Explain purpose to student beforehand
- Use results to provide support, not label
- Always follow up with qualified professionals
- Results are confidential

## 📝 Scope
✅ One character (child emoji)
✅ One storyline (bridge building)
✅ Two task types (reading + numbers)
✅ Three difficulty levels per task type
✅ Local processing only
✅ Real-time disease detection
✅ Adaptive difficulty system
✅ Comprehensive assessment reporting

## 🤝 Target Users
- Educational psychologists
- Special education teachers
- School counselors
- Learning specialists
- Parents (with guidance)

## 📚 Documentation
See [ALGORITHM_DOCS.md](ALGORITHM_DOCS.md) for detailed technical documentation of the detection algorithm.

See [README_PRIVACY.md](README_PRIVACY.md) for privacy and data protection details.
