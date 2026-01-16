const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Game descriptions (dummy for now - will be replaced by actual games)
const GAME_DESCRIPTIONS = [
    {
        id: 1,
        name: "Word Bridge Builder",
        description: "Player must identify rhyming words to build bridge planks. Tests reading and phonological awareness.",
        difficulty: "easy",
        skills: ["reading", "phonological awareness"]
    },
    {
        id: 2,
        name: "Number Path Finder",
        description: "Player solves simple addition problems to find the correct path across stepping stones.",
        difficulty: "easy",
        skills: ["math", "counting"]
    },
    {
        id: 3,
        name: "Letter Matching Quest",
        description: "Player matches uppercase and lowercase letters to unlock the gate.",
        difficulty: "medium",
        skills: ["reading", "letter recognition"]
    },
    {
        id: 4,
        name: "Shape Pattern Challenge",
        description: "Player completes visual patterns with shapes to repair the broken bridge.",
        difficulty: "medium",
        skills: ["math", "pattern recognition"]
    },
    {
        id: 5,
        name: "Story Sequence Adventure",
        description: "Player arranges story events in correct order to reveal the final path.",
        difficulty: "hard",
        skills: ["reading", "sequencing", "comprehension"]
    }
];

// Generate story based on game descriptions
async function generateStory(gameDescriptions) {
    const prompt = `Create a children's adventure story about a brave girl named Luna trying to cross a magical river to reach her grandmother's cottage on the other side. 

The story must have exactly 5 segments, one for each challenge she faces. Each segment should follow this structure:

For each of these challenges:
${gameDescriptions.map((game, i) => `${i + 1}. ${game.name}: ${game.description}`).join('\n')}

Generate a JSON response with this exact structure:
{
  "storyTitle": "Title of the adventure",
  "protagonist": "Luna",
  "segments": [
    {
      "segmentNumber": 1,
      "location": "Starting riverbank",
      "beforeChallenge": {
        "sentence": "A single sentence describing Luna's problem/obstacle (sad situation)",
        "imagePrompt": "Detailed image prompt for DALL-E showing Luna looking sad/worried at the obstacle, include environment details"
      },
      "challenge": "Brief description of what Luna must do",
      "afterSuccess": {
        "sentence": "A single sentence describing Luna's success and arrival at new location (happy situation)",
        "imagePrompt": "Detailed image prompt for DALL-E showing Luna happy/celebrating at the new location"
      }
    }
    ... (repeat for all 5 segments)
  ]
}

Make it engaging for 6-8 year olds. Keep sentences simple and encouraging.`;

    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: "You are a creative children's story writer. Generate JSON only, no additional text."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8
    });

    return JSON.parse(response.choices[0].message.content);
}

// No image generation - text-based story only
async function generateImage(prompt) {
    // Skip image generation for text-based mode
    return null;
}

// API Endpoint: Generate complete story with images
app.post('/api/generate-story', async (req, res) => {
    try {
        console.log('Generating story...');
        
        // Generate story text
        const story = await generateStory(GAME_DESCRIPTIONS);
        
        console.log('Story generated, creating images...');
        
        // Text-based mode - no images needed
        console.log('Story ready (text-based mode)');
        
        res.json({
            success: true,
            story,
            gameDescriptions: GAME_DESCRIPTIONS
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API Endpoint: Get game descriptions
app.get('/api/game-descriptions', (req, res) => {
    res.json({
        success: true,
        games: GAME_DESCRIPTIONS
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        openaiConfigured: !!process.env.OPENAI_API_KEY
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Story API server running on port ${PORT}`);
    console.log(`OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
});
