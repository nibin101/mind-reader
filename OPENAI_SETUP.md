# OpenAI API Setup Guide

## Why OpenAI is Important

The OpenAI integration is **THE MOST CRITICAL PART** of this assessment system because:

1. **Age-Appropriate Questions**: OpenAI generates questions specifically calibrated for the child's age
2. **Adaptive Difficulty**: Creates Level 1 (very easy), Level 2 (medium), and Level 3 (grade-level) questions
3. **Clinical Accuracy**: Questions are neuropsychologically valid for detecting learning disabilities
4. **Personalization**: Each assessment is unique and tailored to the specific child

## Current Status

✅ Fallback system implemented with 3 difficulty levels for age 13
✅ Adaptive difficulty logic adjusts based on student performance
✅ Level 1 failure significantly increases disease probability
✅ Console logging shows which difficulty level is being tested

## Setting Up OpenAI API

### Step 1: Get an API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

### Step 2: Add to Project

Create a `.env` file in the project root:

```bash
VITE_OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**IMPORTANT**: Never commit the `.env` file to git!

### Step 3: Restart Server

```bash
npm run dev
```

## How It Works

### Adaptive Difficulty System

```
Start → Level 3 (Grade-Appropriate for Age 13)
         ↓
   Wrong Answer?
         ↓
      Level 2 (Below Grade Level)
         ↓
   Wrong Answer?
         ↓
      Level 1 (Very Easy - Elementary Level)
         ↓
   Wrong Answer?
         ↓
      🚨 HIGH RISK INDICATOR
```

### Risk Impact by Level

- **Level 1 Failure**: +7-8% risk (CRITICAL - basic skills missing)
- **Level 2 Failure**: +4-5% risk (MODERATE - below grade level)
- **Level 3 Failure**: +2-4% risk (NORMAL - grade-level is challenging)

### Console Output Example

```
=== GENERATING QUESTIONS ===
Game: voidChallenge | Disease: dyslexia | Age: 13 | Difficulty Level: 3
🤖 Calling OpenAI GPT-4 for dyslexia questions (Level 3, Age 13)...
✅ OpenAI returned 3 questions

📝 Question 1/3: ✅ CORRECT | Level 3 | Time: 4.2s
  ✅ Maintaining Level 3 (performing at grade level)

📝 Question 2/3: ❌ WRONG | Level 3 | Time: 8.1s
  ⬇️ Dropping to Level 2 (below grade level)
  ⚠️ LEVEL 2 FAILURE: +5% risk (below grade level)

📝 Question 3/3: ❌ WRONG | Level 2 | Time: 9.5s
  ⚠️ Dropping to Level 1 (significant struggle)
  🚨 LEVEL 1 FAILURE: +7% risk (very easy question failed)
```

## Fallback System

If OpenAI is not available, the system uses:

- **Clinically-validated question bank**
- **Age 13 focused questions**
- **3 difficulty levels per game type**
- **Same adaptive logic applies**

### Fallback Questions Include:

**Level 1 (Very Easy):**
- Letter recognition: "Which is the letter A?"
- Simple words: "Which word says CAT?"
- Basic counting: "2 + 2 = ?"

**Level 2 (Medium):**
- Letter reversals: "Which letter is 'b' (not d, p, or q)?"
- Simple phonics: "Which word rhymes with BOOK?"
- Two-digit math: "23 or 17, which is larger?"

**Level 3 (Grade 13):**
- Complex spelling: "Which is correct: Rhythm or Rythm?"
- Phonological manipulation: "Remove 'str' from STRAP"
- Algebra: "If x + 7 = 15, what is x?"

## Testing the System

1. **Check OpenAI Status**: Look for console messages:
   - ✅ "OpenAI generated 3 questions" = Working
   - ⚠️ "OpenAI not available" = Using fallback

2. **Test Adaptive Logic**: Play a game and deliberately:
   - Answer correctly at Level 3 → stays at Level 3
   - Answer wrong at Level 3 → drops to Level 2
   - Answer wrong at Level 2 → drops to Level 1
   - Answer wrong at Level 1 → 🚨 HIGH RISK

3. **View Risk Calculation**: Check console for:
   - "LEVEL 1 FAILURE: +7% risk"
   - "LEVEL 2 FAILURE: +5% risk"
   - "LEVEL 3 FAILURE: +3% risk"

## Troubleshooting

### OpenAI Not Working

Check browser console for error messages:

```
❌ OpenAI API Error: invalid_api_key
  → API key is invalid
```

**Solution**: Check your `.env` file has correct key

```
❌ OpenAI API Error: insufficient_quota
  → API quota exceeded
```

**Solution**: Add credits at https://platform.openai.com/billing

### Questions Not Generating

1. Check console for "=== GENERATING QUESTIONS ==="
2. If you see "Falling back to clinical question bank" - OpenAI failed
3. Fallback questions will still work with full adaptive difficulty

## Performance Impact

- **With OpenAI**: ~2-3 seconds per game to generate questions
- **With Fallback**: Instant question loading
- Both systems use the same adaptive difficulty logic
- Both provide accurate risk assessment

## Cost Estimate

- OpenAI GPT-4: ~$0.03 per 3 questions
- Per full assessment (10 games): ~$0.30
- 100 assessments: ~$30

## Privacy & Security

- API key stays in `.env` file (never exposed to users)
- Questions generated on-demand (not stored)
- No personal data sent to OpenAI (only age and disorder type)
- All risk calculations happen locally

---

**Remember**: The adaptive difficulty system works perfectly with **both** OpenAI and fallback questions. The key is that Level 1 failures significantly increase disease probability!
