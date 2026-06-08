import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

class DataService:
    def __init__(self, data_dir="backend/data"):
        self.data_dir = data_dir
        self.sentiment_file = os.path.join(data_dir, "sentiment.csv")
        self.trader_file = os.path.join(data_dir, "trader_data.csv")
        self.merged_df = None

    def generate_mock_data(self):
        """Generates mock data if files are missing."""
        dates = [datetime.now() - timedelta(days=x) for x in range(30)]
        dates.reverse()

        # Mock Sentiment
        sentiment_data = {
            "Date": [d.strftime("%Y-%m-%d") for d in dates],
            "Classification": np.random.choice(["Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"], 30),
            "Value": np.random.randint(0, 100, 30)
        }
        sentiment_df = pd.DataFrame(sentiment_data)

        # Mock Trader Data
        trader_rows = []
        for d in dates:
            for _ in range(np.random.randint(5, 15)):
                trader_rows.append({
                    "account": f"0x{np.random.randint(1000, 9999)}",
                    "symbol": "BTC",
                    "execution_price": 60000 + np.random.randint(-5000, 5000),
                    "size": np.random.uniform(0.1, 2.0),
                    "side": np.random.choice(["B", "S"]),
                    "time": d.timestamp(),
                    "closedPnL": np.random.uniform(-500, 1000)
                })
        trader_df = pd.DataFrame(trader_rows)
        
        return sentiment_df, trader_df

    def load_data(self):
        try:
            # Check for various possible filenames
            potential_sentiment = [self.sentiment_file, os.path.join(self.data_dir, "fear_greed_index.csv")]
            potential_trader = [self.trader_file, os.path.join(self.data_dir, "historical_data.csv")]
            
            s_file = next((f for f in potential_sentiment if os.path.exists(f)), None)
            t_file = next((f for f in potential_trader if os.path.exists(f)), None)

            if s_file and t_file:
                sentiment_df = pd.read_csv(s_file)
                trader_df = pd.read_csv(t_file)
            else:
                print("Using mock data as files were not found.")
                sentiment_df, trader_df = self.generate_mock_data()

            # Mapping for Sentiment
            s_map = {
                'date': 'Date', 'classification': 'Classification', 'value': 'Value',
                'Date': 'Date', 'Classification': 'Classification', 'Value': 'Value'
            }
            sentiment_df = sentiment_df.rename(columns=s_map)

            # Mapping for Trader Data
            t_map = {
                'Account': 'account', 'Coin': 'symbol', 'Execution Price': 'execution_price',
                'Size Tokens': 'size', 'Side': 'side', 'Timestamp': 'time', 'Closed PnL': 'closedPnL'
            }
            trader_df = trader_df.rename(columns=t_map)

            # Ensure minimal required columns exist
            sentiment_df['Date'] = pd.to_datetime(sentiment_df['Date']).dt.date
            
            # Normalize trader time
            if 'time' in trader_df.columns:
                if trader_df['time'].max() > 1e11: # likely ms
                    trader_df['Date'] = pd.to_datetime(trader_df['time'], unit='ms').dt.date
                else:
                    trader_df['Date'] = pd.to_datetime(trader_df['time'], unit='s').dt.date
            elif 'Timestamp' in trader_df.columns: # fallback if rename failed
                trader_df['Date'] = pd.to_datetime(trader_df['Timestamp'], unit='s').dt.date

            # Merge
            self.merged_df = pd.merge(trader_df, sentiment_df, on='Date', how='left')
            
            # Fill missing sentiment if any
            self.merged_df['Classification'] = self.merged_df['Classification'].fillna('Neutral')
            
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            import traceback
            traceback.print_exc()
            return False

    def get_performance_by_sentiment(self, account=None):
        if self.merged_df is None:
            self.load_data()
        
        df = self.merged_df
        if account and account != 'All':
            df = df[df['account'].astype(str).str.contains(account, case=False, na=False)]

        # Safely determine columns for aggregation
        agg_cols = {}
        if 'closedPnL' in df.columns:
            agg_cols['closedPnL'] = ['mean', 'sum', 'count']
        
        acc_col = next((c for c in df.columns if c.lower() == 'account'), None)
        if acc_col:
            agg_cols[acc_col] = 'nunique'
        
        if not agg_cols:
            return []

        stats = df.groupby('Classification').agg(agg_cols).reset_index()
        new_cols = ['sentiment']
        if 'closedPnL' in agg_cols:
            new_cols += ['avg_pnl', 'total_pnl', 'trade_count']
        if acc_col:
            new_cols += ['unique_traders']
            
        stats.columns = new_cols
        return stats.to_dict(orient='records')

    def get_time_series_data(self, account=None):
        if self.merged_df is None:
            self.load_data()
            
        df = self.merged_df
        if account and account != 'All':
            df = df[df['account'].astype(str).str.contains(account, case=False, na=False)]

        daily = df.groupby('Date').agg({
            'closedPnL': 'sum',
            'Value': 'first'
        }).reset_index()
        
        daily['Date'] = daily['Date'].astype(str)
        return daily.to_dict(orient='records')

    def get_risk_metrics(self, account=None):
        if self.merged_df is None:
            self.load_data()
        
        df = self.merged_df
        if account and account != 'All':
            df = df[df['account'].astype(str).str.contains(account, case=False, na=False)]

        if df.empty or 'closedPnL' not in df.columns:
            return {"drawdown": 0, "sharpe": 0}

        # Drawdown calculation
        cumulative_pnl = df['closedPnL'].cumsum()
        running_max = cumulative_pnl.cummax()
        drawdown = (cumulative_pnl - running_max).min()
        
        # Sharpe Ratio (Simplified: Mean / Std)
        returns = df['closedPnL']
        sharpe = (returns.mean() / returns.std() * np.sqrt(252)) if returns.std() != 0 else 0

        return {
            "drawdown": round(float(drawdown), 2),
            "sharpe": round(float(sharpe), 2)
        }

    def get_all_accounts(self):
        if self.merged_df is None:
            self.load_data()
        
        if 'account' in self.merged_df.columns:
            accs = self.merged_df['account'].dropna().unique().tolist()
            return ['All'] + [str(a)[:10] for a in accs[:10]] # Limit for UI
        return ['All']
