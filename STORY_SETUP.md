# Story Mode Setup Guide

## 🎮 What This Does

Creates an interactive story-driven game where:
1. **OpenAI generates** a custom story based on your 5 game descriptions
2. **DALL-E creates images** - sad image (before challenge) + happy image (after success)
3. **Story flows**: Sad Image + Sentence → Wait 2s → **Your Game Here** → Happy Image + Sentence
4. **Emotion tracking** runs in background throughout
5. **5 game slots** ready for your team to insert actual games

## 📁 Files Created

- `story-server.js` - Backend API (OpenAI integration)
- `public/story.html` - Beautiful story UI
- `public/story-game.js` - Story engine with emotion tracking
- `.env.example` - API key template

## 🔑 Setup API Keys

### Step 1: Create `.env` file
```bash
cp .env.example .env
```

### Step 2: Add your OpenAI API key
Edit `.env` and add:
```
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

Get your key from: https://platform.openai.com/api-keys

## 🚀 Run the System

### Install dependencies:
```bash
npm install
```

### Start both servers:
```bash
# Terminal 1: Start story API server
npm run story-server

# Terminal 2: Start web server
cd public
python3 -m http.server 8000
```

### Access the game:
Open browser: **http://localhost:8000/story.html**

## 🎯 How It Works

### 1. Click "Begin Adventure"
- System calls OpenAI API to generate story
- Creates 5 story segments based on game descriptions
- Generates 10 images (2 per segment)

### 2. Story Plays Out:
```
Segment 1:
  → Show sad image + "Luna is stuck at the riverbank..."
  → Wait 2 seconds
  → Show game slot: "Game 1 will be inserted here"
  → (Your team adds actual game)
  → Show happy image + "Luna crosses successfully!"
  → Wait 2 seconds
  
Segment 2:
  → (repeat pattern)
  ...
```

### 3. Emotion Tracking:
- Webcam tracks emotions every 2 seconds
- Runs in background throughout story
- Data can be used for assessment

## 🎨 Customizing Games

Edit `story-server.js` line 11-45 to change game descriptions:

```javascript
const GAME_DESCRIPTIONS = [
    {
        id: 1,
        name: "Your Game Name",
        description: "What the game does and tests",
        difficulty: "easy",
        skills: ["reading", "phonological awareness"]
    },
    // ... add your 5 games
];
```

OpenAI will generate story based on these descriptions!

## 🔌 Integrating Your Games

In `public/story-game.js`, find line 235:

```javascript
async function simulateGameCompletion(segment, gameNumber) {
    // REPLACE THIS with your actual game integration
    await wait(3000);
    
    // Example: Load your game component
    // const game = new YourGame(gameNumber);
    // await game.waitForCompletion();
    
    // Get results and track
    // detector.recordAttempt(taskType, isCorrect, timeSpent);
}
```

## 📊 Story Flow Example

**Generated Story:**
```json
{
  "storyTitle": "Luna's Magical River Crossing",
  "segments": [
    {
      "beforeChallenge": {
        "sentence": "Luna stands sadly at the broken bridge.",
        "imageUrl": "https://generated-image-url..."
      },
      "challenge": "Help Luna build the bridge with rhyming words",
      "afterSuccess": {
        "sentence": "Luna smiles as the bridge appears!",
        "imageUrl": "https://generated-image-url..."
      }
    }
  ]
}
```

## 🎨 UI Features

- ✅ Beautiful gradient backgrounds
- ✅ Smooth animations and transitions
- ✅ Image loading with shimmer effect
- ✅ Progress bar showing completion
- ✅ Emotion indicator (bottom right)
- ✅ Responsive design
- ✅ Auto-scrolling to current segment

## 🔄 Fallback System

If OpenAI API fails or no key provided:
- Uses pre-built fallback story
- Shows placeholder images
- Everything still works!

## 🧪 Testing Without API Key

Just run the servers without `.env`:
- System will use fallback story
- Placeholder images will show
- You can see full flow and UI

## 💰 Cost Estimate

Per story generation:
- GPT-4 API call: ~$0.03
- 10 DALL-E images: ~$0.40
- **Total: ~$0.43 per playthrough**

Consider caching stories for repeated use!

## 🎯 Next Steps

1. ✅ Setup complete - system ready
2. 📝 Add your OpenAI API key to `.env`
3. 🎮 Your team integrates actual games into the 5 slots
4. 🧠 Connect to learning disability detector
5. 📊 Generate assessment reports after story completion

## 🐛 Troubleshooting

**"Failed to generate story"**
- Check `.env` file exists
- Verify OpenAI API key is valid
- Check you have API credits

**Images not loading**
- OpenAI API requires credits
- Fallback images will show instead

**Port already in use**
- Change port in `story-server.js` (line 158)
- Or kill process: `lsof -ti:3001 | xargs kill`
