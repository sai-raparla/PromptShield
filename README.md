# PromptShield (UConn AI Agent) 🛡️
A ChatGPT-style chatbot UI that prevents students from accidentally sharing private information with LLMs. PromptShield detects sensitive data in pasted drafts (like emails to IT Services), warns the user with a popup, and offers a safer prompt before sending.

> **Goal:** Help students use AI safely in education by reducing credential leaks and privacy violations.

---

## Features
- **ChatGPT-like UI** (sidebar + chat bubbles + typing indicator)
- **Paste an email draft directly into chat**
- **Safety popup** when sensitive info is detected
  - Explains what was found
  - Provides a **better prompt** / safe alternative
  - User can choose **Use better prompt & send** or **Send anyway**
- **Hardcoded demo flow** for a specific unsafe IT email example (great for presenting)

---

## Demo Flow (What to try)
1. Run the app.
2. Paste the demo IT email (the one containing NetID, student ID, email/phone/address, password, Duo code, and reset token).
3. Click **Send**.
4. A modal appears: **“Prompt is not safe to send”** and shows a safer prompt.
5. Click **Use better prompt & send** to see the assistant generate a sanitized IT email response.
6. Click **Send anyway** to see the assistant return a safe-to-send IT email as well (hardcoded).

---

## Tech Stack
- **React + TypeScript**
- **Vite**
- No backend required for the MVP demo

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm

### Install & Run
```bash
npm install
npm run dev
