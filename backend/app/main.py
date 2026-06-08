from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .data_service import DataService

app = FastAPI(title="Bitcoin Sentiment Analysis API")

# Enable CORS for React frontend
origins = [
    "*",
    "http://localhost:5173",
    "https://primetrade-1-412n.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data_service = DataService()

@app.get("/")
def root():
    return {"message": "Bitcoin Sentiment API is Running", "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}

@app.get("/api/performance")
def get_performance(account: str = None):
    return data_service.get_performance_by_sentiment(account)

@app.get("/api/time-series")
def get_time_series(account: str = None):
    return data_service.get_time_series_data(account)

@app.get("/api/summary")
def get_summary(account: str = None):
    data_service.load_data()
    # Simple summary logic
    df = data_service.merged_df
    if account and account != 'All':
        df = df[df['account'].astype(str).str.contains(account, case=False, na=False)]
    
    if df.empty:
        return {
            "total_trades": 0,
            "total_pnl": 0,
            "best_performing_sentiment": "N/A",
            "trader_count": 0
        }

    total_trades = len(df)
    total_pnl = df['closedPnL'].sum()
    
    # Safely get best sentiment
    try:
        best_sentiment = df.groupby('Classification')['closedPnL'].mean().idxmax()
    except:
        best_sentiment = "Neutral"
    
    acc_col = next((c for c in df.columns if c.lower() == 'account'), 'account')
    
    return {
        "total_trades": total_trades,
        "total_pnl": round(float(total_pnl), 2),
        "best_performing_sentiment": best_sentiment,
        "trader_count": df[acc_col].nunique() if acc_col in df.columns else 0
    }

@app.get("/api/risk")
def get_risk(account: str = None):
    return data_service.get_risk_metrics(account)

@app.get("/api/accounts")
def get_accounts():
    return data_service.get_all_accounts()
