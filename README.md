# Bitcoin Sentiment Analysis Dashboard

This is a professional-grade, full-stack trading analytics dashboard that correlates **Bitcoin Fear & Greed Index** with high-execution trader data from **Hyperliquid**.

## 🌐 Live Demo
- **Frontend**: [https://primetrade-1-412n.onrender.com/](https://primetrade-1-412n.onrender.com/)
- **Backend API**: [https://primetrade-el6m.onrender.com/api/health](https://primetrade-el6m.onrender.com/api/health)

## Key Features
- **Advanced Risk Analytics**: Real-time calculation of **Max Drawdown** and **Sharpe Ratio** based on execution data.
- **Sentiment Alpha Correlation**: Visualizes the performance of professional traders across different macro sentiment cycles.
- **Premium Light Theme**: A high-performance "Glassmorphism" UI with optimized contrast for clinical analysis.
- **One-Click Export**: Download a comprehensive CSV "Recruiter Report" containing all filtered data.
- **Robust Data Engine**: Automatic column mapping for custom CSV datasets (`historical_data.csv` and `fear_greed_index.csv`).

---

## Phase-Based Features (New)
- [x] **Risk Scoring**: Integrated statistical model for trading quality.
- [x] **Live Export**: Browser-side CSV generator for external reporting.
- [x] **Universal Data Support**: Case-insensitive CSV column mapping.

---

## Quick Start (Local)

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
