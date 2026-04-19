# 🌿 EcoChat — AI Sustainability Advisor

> Built for the DEV Weekend Challenge — Earth Day edition  
> Powered by Google Gemini

## What it does

EcoChat is an AI-powered chatbot that gives practical, actionable eco-friendly tips based on what you ask. Reduce plastic, cut your carbon footprint, eat more sustainably — just ask.

## Tech Stack

- **React + Vite** — fast, lightweight frontend
- **Google Gemini 2.0 Flash** — AI responses (prize category)
- Deployable to **Vercel / Netlify** in one click

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open http://localhost:5173

### 3. Get your Gemini API key

Go to https://aistudio.google.com/apikey — it's free.  
Paste it into the bar at the top of the app.

---

## Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to vercel.com for auto-deploy.

## Deploy to Netlify

```bash
npm run build
# drag the dist/ folder to netlify.com/drop
```

---

## Project Structure

```
ecochat/
├── index.html
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx              # Main app + chat logic
│   ├── Message.jsx          # Chat bubble component
│   ├── ApiKeyBar.jsx        # Gemini key input
│   ├── SuggestionChips.jsx  # Quick-tap follow-up prompts
│   ├── gemini.js            # Gemini API + mock fallback
│   └── index.css
```

---

## DEV Challenge Categories Targeted

- Overall winner — Earth Day theme, practical real-world tool
- Best use of Google Gemini — Gemini 2.0 Flash with custom system prompt + multi-turn history

## License

MIT
