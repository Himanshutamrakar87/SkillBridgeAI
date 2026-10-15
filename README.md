# 🚀 SkillBridge AI

### Learn Smarter. Build Skills. Shape Your Future.

SkillBridge AI is an AI-powered student learning and skill development platform built as part of the **AICTE–IBM Project**. It uses Google's Gemini API to help students learn concepts, prepare quizzes, plan their studies, and explore career opportunities through an intuitive, modern interface.

## ✨ Features

- 🤖 **AI Learning Assistant** — Get AI-powered explanations and educational support.
- 📚 **Concept Explainer** — Understand complex topics with simple explanations and examples.
- 📝 **Quiz Generator** — Generate practice quizzes and evaluate answers.
- 📅 **Smart Study Planner** — Create personalized study schedules.
- 🎯 **Career & Skill Guidance** — Explore skills, learning roadmaps, and project ideas.
- 🎨 **Modern UI** — Clean, responsive light-mode interface with elegant gradients.
- ⚡ **Simple Architecture** — No mandatory login, database, or Supabase.

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Google Gemini API
- Node.js / Express (if required by the implementation)
- CSS / Tailwind CSS (depending on the configured project)

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd skillbridge-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the Gemini API key

Obtain an API key from [Google AI Studio](https://aistudio.google.com/).

Configure `GEMINI_API_KEY` in the server-side environment or supported secret settings.

**Important:** Never expose your API key in frontend code or commit secret files to GitHub.

### 4. Start the application

Use the start command configured in your project's `package.json`. For a typical Vite frontend:

```bash
npm run dev
```

If the project uses a separate backend, start it using its configured script as well.

## 🔐 Security

- Keep API credentials private.
- Validate user inputs before sending requests to the API.
- Handle API errors and usage limits appropriately.
- Avoid storing sensitive information in browser storage.

## 🎯 Project Objective

The goal of SkillBridge AI is to make AI-assisted learning more accessible by combining educational support, study planning, quiz practice, and skill guidance in one platform.

## 👨‍💻 Project Information

**Project:** SkillBridge AI  
**
