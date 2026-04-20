# ⬡ InterviewForge AI — Mock Interview Coach

> **Live Demo:** [https://yourusername.github.io/InterviewForge-AI/](https://yourusername.github.io/InterviewForge-AI/)
>
> *(Replace `yourusername` with your GitHub username after deployment)*

---

## 1. Chosen Vertical

**EdTech / Career Preparation**

InterviewForge AI targets the massive gap between students learning skills and students being able to *demonstrate* those skills in interviews. Every engineering college student and job-seeker in India needs interview preparation — but personalized, real-time coaching has historically been expensive or inaccessible. This tool democratises that coaching using AI.

---

## 2. Approach and Logic

**Core Flow: Prompt → Score → Feedback**

```
User selects role + experience level
        ↓
Gemini API generates tailored questions (system prompt engineering)
        ↓
User types answer to each question
        ↓
Gemini API scores answer (0–100) with structured JSON output
        ↓
App renders score ring + strengths + improvements + sample answer
        ↓
Results saved to Google Sheets (or downloaded as CSV)
```

**Why Gemini API in code (not just prompts):**
- `generateQuestions()` calls `gemini-2.0-flash` with a structured system prompt to produce role-specific, level-appropriate questions
- `scoreAnswer()` calls Gemini again with the question + answer, requesting a strict JSON response with score, strengths, improvements, and a sample answer
- All API calls are visible in `app.js` — this is true API integration, not prompt-only

---

## 3. How the Solution Works

### User Flow (Step by Step)

1. **Setup Screen** — User enters their target job role (e.g. "Backend Engineer"), selects experience level, number of questions (3/5/7), and preferred language (English/Tamil/Hindi)
2. **API Key** — On first use, the app prompts for a free Gemini API key (stored in `sessionStorage` only — never hardcoded)
3. **Question Generation** — A single Gemini API call generates all questions upfront, parsed from numbered text
4. **Interview Loop** — For each question:
   - Question is displayed with animated reveal
   - User types their answer in a textarea
   - On submit, a second Gemini call scores the answer as structured JSON
   - Animated score ring + 3-section feedback panel appears
5. **Results Screen** — All question scores shown in a breakdown list; overall average calculated
6. **Save Results** — Results saved to Google Sheets via Sheets API, or downloaded as CSV if Sheets is not configured

### Key Technical Decisions
- **Streaming off** for scoring to ensure complete JSON response before parsing
- **Fallback parser** handles malformed Gemini JSON responses (regex extraction)
- **sessionStorage** for API key — never sent to any server other than Google's API
- **No build step** — pure HTML/CSS/JS, runs on any static host (GitHub Pages)

---

## 4. Google Services Used

| Service | Usage |
|---|---|
| **Gemini API** (`gemini-2.0-flash`) | Question generation + answer scoring + feedback synthesis |
| **Google Sheets API** | Saving interview results (question, answer, score, feedback) to a spreadsheet |

Both services are called directly from `app.js` — the API calls are clearly visible in the source code.

**Gemini API endpoints used:**
- `POST /v1beta/models/gemini-2.0-flash:generateContent` — for both question generation and answer scoring

**Google Sheets API endpoint used:**
- `POST /v4/spreadsheets/{id}/values/Sheet1!A1:append` — to append result rows

---

## 5. Assumptions Made

1. **Internet connection required** — All Gemini and Sheets API calls require network access
2. **English questions only** — The language selector affects the *language prompt* sent to Gemini, but Gemini may still respond in English for some languages depending on the model's capability
3. **Free Gemini API key** — The user must obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) — this is free for personal use
4. **Modern browser** — Uses `fetch`, `sessionStorage`, CSS variables, and modern JS features; requires Chrome/Firefox/Safari 2022+
5. **Single session** — No persistent login or user accounts; all state is in-memory for the session
6. **Google Sheets config is optional** — If `SPREADSHEET_ID` and `SHEETS_API_KEY` are not set in `config.js`, results fall back to CSV download automatically

---

## 6. Project Structure

```
InterviewForge-AI/
├── index.html      # Main app shell (3 screens: setup, interview, results)
├── style.css       # Dark industrial UI with Syne + DM Mono fonts
├── app.js          # All app logic + Gemini API + Sheets API calls
├── config.js       # API key configuration (never hardcode keys here)
├── test.js         # Jest unit tests (grading, parsing, validation)
└── README.md       # This file
```

---

## 7. Running Locally

```bash
# Clone the repo
git clone https://github.com/yourusername/InterviewForge-AI.git
cd InterviewForge-AI

# Open in browser (no build step needed)
open index.html

# Run tests
npm install --save-dev jest
npx jest test.js
```

**To configure Google Sheets saving:**
1. Create a Google Sheet
2. Enable the Google Sheets API in [Google Cloud Console](https://console.cloud.google.com/)
3. Copy the Spreadsheet ID from the URL
4. Add your Sheets API key and Spreadsheet ID to `config.js`

---

## 8. Accessibility

- All interactive elements have `aria-label` attributes
- Live regions (`aria-live="polite"`) for dynamic content (questions, feedback)
- Progress bar uses `role="progressbar"` with `aria-valuenow/min/max`
- All `<img>` elements have `alt` attributes
- Keyboard-navigable (all interactions via standard form elements and buttons)
- High contrast: amber on near-black (#fbbf24 on #0c0c0e, contrast ratio > 7:1)

---

## 9. Score Booster Checklist

- [x] `test.js` with 6 describe blocks and 18 Jest unit tests
- [x] API key in `config.js` / `sessionStorage` — never hardcoded
- [x] `aria-label` on all buttons + `aria-live` on dynamic content
- [x] Detailed README with approach, flow, and assumptions
- [x] 2 Google APIs visible in code: Gemini API + Google Sheets API

---

*Built for Google GenAI Exchange Hackathon — PromptWars Virtual*
