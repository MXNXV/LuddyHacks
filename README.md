# 🚀 Service WOW – AI-Powered Innovation Management Platform

*Service WOW* is a full-stack web platform that enables teams to submit, evaluate, and analyze innovative ideas in real time. It integrates a responsive UI with an AI-enhanced backend that automatically scores and prioritizes submitted ideas using Google's Gemini model, providing leaders with actionable insights.

> **IUB Luddy Hackathon Fall 2024 Submission**

---

## 📋 Project Overview

Service WOW addresses the challenge of efficiently collecting, evaluating, and prioritizing innovation ideas within organizations. Our platform uses AI to automate the scoring process, allowing teams to focus on implementation rather than lengthy manual evaluation cycles.

### 🎯 Key Objectives

- Streamline the innovation collection process
- Provide objective, AI-driven evaluation of ideas
- Enable data-driven decision making through visual analytics
- Facilitate collaboration through voting and feedback mechanisms
- Reduce the time from idea submission to implementation decision

---

## 🧠 Core Features

•⁠  ⁠*Idea Submission & Discovery*: Easily browse, search, and submit ideas. Toggle between grid and list views with real-time vote counts and category filters.
•⁠  ⁠*AI-Driven Evaluation*: Each submitted idea is auto-scored for ROI, Effort, Strategic Alignment, and Risk using Google Gemini, including plain-language justifications and a composite score.
•⁠  ⁠*Data Dashboard*: Visual dashboards show:
  - ROI vs Effort with vote-based bubble sizes
  - Top ideas by score
  - Category-based analysis
  - Priority rankings and filters
•⁠  ⁠*Meeting Intelligence*: Upload ⁠ .mp3 ⁠, ⁠ .wav ⁠, or ⁠ .mp4 ⁠ files to extract:
  - Smart summaries
  - Action items with owners and deadlines
  - Full transcripts
  - Sentiment analysis by speaker
•⁠  ⁠*Dark Mode Support*: Seamless UI theme toggling between light and dark modes.
•⁠  ⁠*Interactive Features*: Real-time voting, editable metrics, and animated AI analysis visualization.

---

## 🔁 How the System Works (Interval Breakdown)

| Step | Component | Description |
|------|-----------|-------------|
| 1 | User submits a new idea via UI | Stored in Firestore ⁠ ideas_input ⁠ collection |
| 2 | Cloud Function triggers (⁠ evaluate_idea ⁠) | Sends data to Gemini via structured ReAct-style prompt |
| 3 | Gemini returns enriched idea with scores and reasoning |
| 4 | Result saved to Firestore ⁠ ideas_output ⁠ collection |
| 5 | Frontend reads ⁠ ideas_output ⁠ for visualization in list and dashboard |
| 6 | User uploads meetings (optional) for analysis and summary |

    ⁠Typical end-to-end turnaround for AI scoring: *< 10 seconds*

---

## 🛠️ Technology Stack

- **Frontend**: React 19, React Router 7, Tailwind CSS 4, shadcn/ui components
- **State Management**: React hooks with Firebase Firestore real-time listeners
- **Backend**: Firebase Cloud Functions with Gemini AI integration
- **Database**: Firestore with multi-collection structure
- **Styling**: TailwindCSS with dark/light mode support
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel for frontend, Firebase for backend services

---

## 📦 Folder Structure (Frontend)

```bash
src/
├── App.jsx               # Layout, theming, routing
├── main.jsx              # Entry point
├── components/
│   ├── dashboard/        # Dashboard visualization components
│   ├── ui/               # Reusable UI components 
│   ├── FileUpload.jsx    # Drag-and-drop input for meeting files
│   ├── IdeaList.jsx      # Grid/List UI to browse ideas
│   ├── NewIdeaForm.jsx   # Form for idea submission
│   ├── NewIdeaModal.jsx  # Modal wrapper for idea form
│   ├── ResultsDisplay.jsx # Summary, Transcript, Sentiment, Actions
├── lib/
│   ├── firebaseConfig.js # Firebase initialization
│   ├── utils.js          # Utility functions
├── pages/
│   ├── AboutPage.jsx     # Project information
│   ├── DashboardPage.jsx # Analytics and feature management
```

---

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/service-wow.git
   cd service-wow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore, Cloud Functions, and Storage
   - Add your Firebase configuration to `src/lib/firebaseConfig.js`

4. Deploy Cloud Functions:
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   ```

---

## 🏆 Our Luddy Hackathon Fall 2024 Team

- Aamir Hullur - Frontend Development & Project Management
- Atharva Gupta - Backend & Firebase Integration
- Manav Patel - AI Integration & Prompt Engineering

---

## 💡 Use Cases

- **Corporate Innovation Teams**: Collect and evaluate ideas from employees across departments
- **Startup Incubators**: Assess and prioritize potential startup concepts
- **Product Development**: Gather customer feedback and feature requests with AI analysis
- **Educational Institutions**: Evaluate student project proposals efficiently
- **Community Organizations**: Manage and prioritize community improvement initiatives

---

## 📝 Future Enhancements

- User authentication and role-based permissions
- Enhanced meeting intelligence with customizable analytics
- Integration with project management tools (Jira, Asana, etc.)
- Mobile application for on-the-go idea submission
- Advanced AI sentiment analysis for feedback comments
- Multi-language support for global teams
- Customizable evaluation criteria based on organization needs

---

## 🔍 Project Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| AI Hallucination | Structured ReAct prompting with verification steps |
| Idea Evaluation Criteria | Multi-dimensional scoring with transparency |
| UI Performance | Optimized Firestore queries and React memo patterns |
| Media Processing | Cloud Functions with efficient chunking and processing |
| Real-time Updates | Firestore listeners with optimistic UI updates |

---

## 🙏 Acknowledgments

- IUB Luddy School of Informatics, Computing, and Engineering
- Google Firebase and Gemini API teams
- Open source community for various dependencies
