# Bitcoin Sentiment Analysis Dashboard (Premium Edition) 🚀

This is a professional-grade, full-stack trading analytics dashboard that correlates **Bitcoin Fear & Greed Index** with high-execution trader data from **Hyperliquid**.

## ✨ Key Features
- **Advanced Risk Analytics**: Real-time calculation of **Max Drawdown** and **Sharpe Ratio** based on execution data.
- **Sentiment Alpha Correlation**: Visualizes the performance of professional traders across different macro sentiment cycles.
- **Premium Light Theme**: A high-performance "Glassmorphism" UI with optimized contrast for clinical analysis.
- **One-Click Export**: Download a comprehensive CSV "Recruiter Report" containing all filtered data.
- **Robust Data Engine**: Automatic column mapping for custom CSV datasets (`historical_data.csv` and `fear_greed_index.csv`).

---

## 🛠️ Phase-Based Features (New)
- [x] **Risk Scoring**: Integrated statistical model for trading quality.
- [x] **Live Export**: Browser-side CSV generator for external reporting.
- [x] **Universal Data Support**: Case-insensitive CSV column mapping.

---

## 🚀 Deployment Guide (Step-by-Step)

### Option 1: Render (Recommended for Full-Stack)
Render is perfect for deploying both the FastAPI backend and the React frontend.

1.  **Push to GitHub** (See GitHub section below).
2.  **Deploy Backend**:
    - Connect your GitHub repo to Render as a **Web Service**.
    - **Build Command**: `pip install -r backend/requirements.txt`
    - **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.app.main:app`
3.  **Deploy Frontend**:
    - Connect the same repo as a **Static Site**.
    - **Build Command**: `cd frontend && npm install && npm run build`
    - **Publish Directory**: `frontend/dist`
    - **Environment Variable**: Set `VITE_API_BASE` to your backend URL.

### Option 2: Vercel (Frontend) + Render (Backend)
1.  Deploy the frontend by dragging the `frontend` folder to Vercel.
2.  Deploy the backend to Render as shown above.

---

## 📤 GitHub Instructions

Follow these commands to push your project to a new GitHub repository:

```bash
# 1. Initialize Git
git init

# 2. Add files
git add .

# 3. Create initial commit
git commit -m "Initial commit: Bitcoin Sentiment Dashboard with Risk Analytics"

# 4. Connect to your GitHub Repo (Replace <URL> with your repo link)
git remote add origin <URL>

# 5. Push to Main
git push -u origin main
```

---

## 💡 Future Roadmap (Additional Features)
Want to impress more? Here are 3 ideas to add next:
1.  **AI Sentiment Predictor**: Use a lightweight ML model (scikit-learn) to predict tomorrow's Fear & Greed index.
2.  **News Integration**: Add a sidebar using the CryptoPanic API to show real-time news headlines alongside the charts.
3.  **Trade Replay**: A feature to "replay" specific trading days to see exactly how sentiment shifted during high-volatility events.

---

## 🏗️ Quick Start (Local)

1.  **Backend**: 
    ```bash
    cd backend && pip install -r requirements.txt
    export PYTHONPATH=$PYTHONPATH:.
    uvicorn app.main:app --reload
    ```
2.  **Frontend**:
    ```bash
    cd frontend && npm install && npm run dev
    ```
