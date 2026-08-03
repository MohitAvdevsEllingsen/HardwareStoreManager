import React, { useState, useEffect, useRef } from 'react'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Plus, 
  Calendar, 
  User, 
  Trash2, 
  Edit3,
  ArrowLeft, 
  Search,
  Wallet,
  RefreshCw,
  Database,
  CheckSquare,
  Square,
  CheckCircle,
  XCircle,
  ChevronRight,
  Clock,
  Settings
} from 'lucide-react'

const RENDER_DEFAULT_URL = 'https://hardwarestoremanager-1.onrender.com/api'

const getInitialApiBase = () => {
  const custom = localStorage.getItem('HARDWARE_STORE_SERVER_URL')
  if (custom && custom.trim()) {
    let clean = custom.trim().replace(/\/$/, '')
    if (!clean.endsWith('/api')) clean += '/api'
    if (clean === '/api') {
      return RENDER_DEFAULT_URL
    }
    return clean
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  return RENDER_DEFAULT_URL
}


const getTodayDate = () => {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount || 0)
}

// Custom Reusable Interactive Typing Suggestion Input Component
function AutoCompleteInput({ value, onChange, onSelect, suggestions, placeholder, type = "text" }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef(null)

  const filtered = (suggestions || []).filter(item => {
    const text = typeof item === 'string' ? item : item.name
    return text.toLowerCase().includes((value || '').toLowerCase()) && text.toLowerCase() !== (value || '').toLowerCase()
  })

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input 
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onFocus={() => setShowDropdown(true)}
        onChange={(e) => {
          onChange(e.target.value)
          setShowDropdown(true)
        }}
      />
      {showDropdown && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#1e293b',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          marginTop: '4px',
          maxHeight: '180px',
          overflowY: 'auto',
          zIndex: 100,
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
        }}>
          {filtered.map((item, idx) => {
            const isString = typeof item === 'string'
            const title = isString ? item : item.name
            const sub = isString ? null : item.phone

            return (
              <div 
                key={idx}
                onClick={() => {
                  if (onSelect) onSelect(item)
                  else onChange(title)
                  setShowDropdown(false)
                }}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #334155' : 'none',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span style={{ fontWeight: '600', color: '#f8fafc' }}>{title}</span>
                {sub && <span style={{ fontSize: '11px', color: '#94a3b8' }}>📞 {sub}</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ServerSettingsModal({ currentUrl, onSave, onClose, dbConnected }) {
  const [inputUrl, setInputUrl] = useState(currentUrl)

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '450px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Settings size={20} color="#f59e0b" /> Server Connection Settings
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        <div style={{
          padding: '12px',
          borderRadius: '8px',
          background: dbConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${dbConnected ? '#10b981' : '#ef4444'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Database size={16} color={dbConnected ? '#10b981' : '#ef4444'} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: dbConnected ? '#10b981' : '#ef4444' }}>
              {dbConnected ? 'Status: Connected to Server & MongoDB Atlas' : 'Status: Offline / Server Unreachable'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Active Endpoint: <code>{currentUrl}</code>
            </div>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
            Server API Base URL:
          </label>
          <input 
            type="text"
            className="input-field"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="e.g. /api or https://your-app.onrender.com/api"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
          />
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block', lineHeight: '1.4' }}>
            • Use <b>/api</b> when hosted on your Node.js server or Render.<br />
            • Enter full URL (e.g., <code>https://my-server.com/api</code>) if accessing remotely or from an Android app.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button 
            onClick={() => {
              setInputUrl(RENDER_DEFAULT_URL)
              onSave(RENDER_DEFAULT_URL)
            }}
            style={{ background: '#0284c7', border: 'none', color: '#fff', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            Use Render Cloud URL
          </button>
          <button 
            onClick={() => {
              setInputUrl('/api')
              onSave('/api')
            }}
            style={{ background: '#334155', border: 'none', color: '#f8fafc', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            Reset to /api
          </button>
          <button 
            onClick={() => onSave(inputUrl)}
            style={{ background: '#f59e0b', border: 'none', color: '#000', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {

  const [apiBaseUrl, setApiBaseUrl] = useState(getInitialApiBase())
  const [showServerModal, setShowServerModal] = useState(false)
  const [activeTab, setActiveTab] = useState('home') // home | sale | customers
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [filterType, setFilterType] = useState('ALL')
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({
    totalSales: 0,
    cashSales: 0,
    creditSales: 0,
    creditCollected: 0,
    netCashInHand: 0
  })
  const [customerList, setCustomerList] = useState([])
  const [suggestions, setSuggestions] = useState({ customers: [], items: [] })
  const [availableDates, setAvailableDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [dbConnected, setDbConnected] = useState(true)
  const [editingTx, setEditingTx] = useState(null)

  // Fetch Transactions, Summary, Customers, Suggestions & Available Dates from MongoDB
  const fetchData = async () => {
    setLoading(true)
    try {
      const [txRes, sumRes, custRes, sugRes, datesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/transactions?date=${selectedDate}&type=${filterType}`),
        fetch(`${apiBaseUrl}/summary?date=${selectedDate}`),
        fetch(`${apiBaseUrl}/customers?onlyCredit=true`), // Only Udhar/Credit Users
        fetch(`${apiBaseUrl}/suggestions`),
        fetch(`${apiBaseUrl}/dates`)
      ])

      if (txRes.ok && sumRes.ok && custRes.ok && sugRes.ok && datesRes.ok) {
        const txData = await txRes.json()
        const sumData = await sumRes.json()
        const custData = await custRes.json()
        const sugData = await sugRes.json()
        const datesData = await datesRes.json()

        setTransactions(txData)
        setSummary(sumData)
        setCustomerList(custData)
        setSuggestions(sugData)
        
        const today = getTodayDate()
        const combinedDates = Array.from(new Set([today, ...datesData])).sort((a, b) => b.localeCompare(a))
        setAvailableDates(combinedDates)

        setDbConnected(true)
      } else {
        if (apiBaseUrl !== RENDER_DEFAULT_URL) {
          localStorage.setItem('HARDWARE_STORE_SERVER_URL', RENDER_DEFAULT_URL)
          setApiBaseUrl(RENDER_DEFAULT_URL)
        } else {
          setDbConnected(false)
        }
      }
    } catch (err) {
      console.error('Failed to fetch from MongoDB server:', err)
      if (apiBaseUrl !== RENDER_DEFAULT_URL) {
        localStorage.setItem('HARDWARE_STORE_SERVER_URL', RENDER_DEFAULT_URL)
        setApiBaseUrl(RENDER_DEFAULT_URL)
      } else {
        setDbConnected(false)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      fetchData()
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedDate, filterType, apiBaseUrl])

  const totalOutstanding = customerList.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0)

  const handleSaveServerUrl = (newUrl) => {
    let clean = (newUrl || '').trim().replace(/\/$/, '')
    if (clean && !clean.endsWith('/api')) clean += '/api'
    if (!clean || clean === '/api') clean = RENDER_DEFAULT_URL
    localStorage.setItem('HARDWARE_STORE_SERVER_URL', clean)
    setApiBaseUrl(clean)
    setShowServerModal(false)
    setTimeout(() => {
      fetchData()
    }, 100)
  }

  // Handlers
  const handleAddTransaction = async (newTx) => {
    try {
      const res = await fetch(`${apiBaseUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      })

      if (res.ok) {
        fetchData()
        setActiveTab('home')
      } else {
        const errorData = await res.json().catch(() => ({}))
        alert('Failed to save transaction: ' + (errorData.error || res.statusText))
      }
    } catch (err) {
      if (apiBaseUrl !== RENDER_DEFAULT_URL) {
        try {
          const fallbackRes = await fetch(`${RENDER_DEFAULT_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTx)
          })
          if (fallbackRes.ok) {
            setApiBaseUrl(RENDER_DEFAULT_URL)
            localStorage.setItem('HARDWARE_STORE_SERVER_URL', RENDER_DEFAULT_URL)
            fetchData()
            setActiveTab('home')
            return
          }
        } catch (fErr) {}
      }
      alert('Error connecting to server: ' + err.message)
    }
  }

  const handleUpdateTransaction = async (id, updatedTx) => {
    try {
      const res = await fetch(`${apiBaseUrl}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTx)
      })

      if (res.ok) {
        setEditingTx(null)
        fetchData()
      } else {
        alert('Failed to update transaction.')
      }
    } catch (err) {
      alert('Error updating transaction.')
    }
  }

  const handleDeleteTx = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return
    try {
      const res = await fetch(`${apiBaseUrl}/transactions/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      alert('Error deleting transaction.')
    }
  }

  const handleBatchConvertToCash = async (txIds) => {
    try {
      const res = await fetch(`${apiBaseUrl}/transactions/convert-to-cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionIds: txIds })
      })
      if (res.ok) {
        fetchData()
      } else {
        alert('Failed to convert credit sales to cash.')
      }
    } catch (err) {
      alert('Error converting credit sales to cash.')
    }
  }


  return (
    <div className="app-container">
      {/* Header */}
      <header style={{
        background: '#0f172a',
        padding: '16px',
        borderBottom: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>Hardware Store Manager</h1>
            <button 
              onClick={() => setShowServerModal(true)}
              title="Click to configure Server Connection"
              style={{ 
                fontSize: '10px', 
                padding: '2px 8px', 
                borderRadius: '10px', 
                background: dbConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: dbConnected ? '#10b981' : '#ef4444',
                border: dbConnected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Database size={10} /> {dbConnected ? 'MongoDB Live' : 'Offline'} <Settings size={10} />
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, marginTop: '2px' }}>Daily Sales & Udhar Register</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#1e293b',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          <Calendar size={14} color="#f59e0b" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontFamily: 'inherit',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </header>

      {/* Main Views */}
      <main style={{ padding: '16px', paddingBottom: '90px' }}>
        {activeTab === 'home' && (
          <HomeView 
            summary={summary}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availableDates={availableDates}
            txs={transactions}
            filterType={filterType}
            setFilterType={setFilterType}
            onNewSale={() => setActiveTab('sale')}
            onEdit={(tx) => setEditingTx(tx)}
            onDelete={handleDeleteTx}
            onRefresh={fetchData}
            loading={loading}
          />
        )}

        {activeTab === 'sale' && (
          <NewSaleView 
            onSave={handleAddTransaction} 
            onCancel={() => setActiveTab('home')}
            defaultDate={selectedDate}
            suggestions={suggestions}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView 
            customers={customerList} 
            totalOutstanding={totalOutstanding}
            onRecordPayment={(tx) => handleAddTransaction(tx)}
            onConvertBatch={handleBatchConvertToCash}
            defaultDate={selectedDate}
          />
        )}
      </main>

      {/* Server Settings Modal */}
      {showServerModal && (
        <ServerSettingsModal 
          currentUrl={apiBaseUrl}
          dbConnected={dbConnected}
          onSave={handleSaveServerUrl}
          onClose={() => setShowServerModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingTx && (
        <EditTransactionModal 
          tx={editingTx} 
          onSave={(updated) => handleUpdateTransaction(editingTx._id || editingTx.id, updated)}
          onClose={() => setEditingTx(null)}
          suggestions={suggestions}
        />
      )}


      {/* Bottom Navigation */}
      <nav className="nav-bottom">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <LayoutDashboard size={20} />
          <span>Day End</span>
        </div>
        <div className={`nav-item ${activeTab === 'sale' ? 'active' : ''}`} onClick={() => setActiveTab('sale')}>
          <ShoppingBag size={20} />
          <span>New Sale</span>
        </div>
        <div className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
          <Users size={20} />
          <span>Udhar Register</span>
        </div>
      </nav>
    </div>
  )
}

// -------------------------------------------------------------
// Home / Day-End Summary Component with Date Selection Bar
// -------------------------------------------------------------
function HomeView({ summary, selectedDate, setSelectedDate, availableDates, txs, filterType, setFilterType, onNewSale, onEdit, onDelete, onRefresh, loading }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Clickable Date Selector Bar */}
      <div style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Click Date to View History:
          </span>
          <button 
            onClick={onRefresh}
            style={{ background: '#0f172a', border: 'none', color: '#94a3b8', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {availableDates.map((dateStr) => {
            const isToday = dateStr === getTodayDate()
            const isSelected = dateStr === selectedDate
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  background: isSelected ? '#f59e0b' : '#0f172a',
                  color: isSelected ? '#000' : '#f8fafc',
                  border: isSelected ? '1px solid #f59e0b' : '1px solid #334155',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {dateStr} {isToday ? '(Today)' : ''}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '15px', color: '#94a3b8' }}>Day-End Summary ({selectedDate})</h2>
      </div>

      {/* Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="card">
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Total Sales Today</div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#f59e0b' }}>{formatCurrency(summary.totalSales)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Cash Sales</div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#10b981' }}>{formatCurrency(summary.cashSales)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Credit (Udhar) Sales</div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(summary.creditSales)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Credit Collected</div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#06b6d4' }}>{formatCurrency(summary.creditCollected)}</div>
        </div>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Net Cash in Hand</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>{formatCurrency(summary.netCashInHand)}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '4px' }}>
        <button className="btn-primary" onClick={onNewSale}>
          <Plus size={18} /> Record New Daily Sale
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginTop: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>
          Transactions for {selectedDate}
        </h3>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {[
            ['ALL', 'All'],
            ['SALE', 'Sales'],
            ['CREDIT', 'Udhar'],
            ['PAYMENT', 'Repayments']
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              style={{
                background: filterType === key ? '#f59e0b' : '#1e293b',
                color: filterType === key ? '#000' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '14px' }}>
            Loading MongoDB transactions...
          </div>
        ) : txs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '14px' }}>
            No transactions found for {selectedDate}
          </div>
        ) : (
          txs.map(t => (
            <div key={t._id || t.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${
                  t.type === 'PAYMENT' ? 'badge-payment' :
                  t.paymentMethod === 'CREDIT' ? 'badge-credit' : 'badge-cash'
                }`}>
                  {t.type === 'PAYMENT' ? 'CREDIT REPAYMENT' :
                   t.paymentMethod === 'CREDIT' ? 'CREDIT SALE (UDHAR)' : 'CASH SALE'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '800', fontSize: '15px', color: '#f8fafc' }}>
                    {formatCurrency(t.totalAmount)}
                  </span>
                  <Edit3 size={16} color="#f59e0b" style={{ cursor: 'pointer' }} title="Edit Transaction" onClick={() => onEdit(t)} />
                  <Trash2 size={16} color="#64748b" style={{ cursor: 'pointer' }} title="Delete Transaction" onClick={() => onDelete(t._id || t.id)} />
                </div>
              </div>

              {t.customerName && (
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} color="#94a3b8" /> {t.customerName} {t.customerPhone ? `(${t.customerPhone})` : ''}
                </div>
              )}

              {t.items && t.items.length > 0 && (
                <div style={{ fontSize: '12px', color: '#94a3b8', background: '#0f172a', padding: '8px', borderRadius: '6px' }}>
                  {t.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• {item.name} ({item.qty} x ₹{item.unitPrice})</span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              )}

              {t.notes && (
                <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                  Note: {t.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// New Sale Component
// -------------------------------------------------------------
function NewSaleView({ onSave, onCancel, defaultDate, suggestions }) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isCredit, setIsCredit] = useState(false)
  const [date, setDate] = useState(defaultDate)
  const [items, setItems] = useState([{ name: '', qty: '1', price: '' }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSelectCustomerSuggestion = (custObj) => {
    setCustomerName(custObj.name)
    if (custObj.phone) setCustomerPhone(custObj.phone)
  }

  const grandTotal = items.reduce((sum, item) => {
    const q = parseFloat(item.qty) || 0
    const p = parseFloat(item.price) || 0
    return sum + (q * p)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isCredit && !customerName.trim()) {
      setError('Customer Name is required for Credit (Udhar) sales!')
      return
    }
    const validItems = items.filter(i => i.name.trim() && parseFloat(i.qty) > 0 && parseFloat(i.price) >= 0)
      .map(i => ({
        name: i.name,
        qty: parseFloat(i.qty),
        unitPrice: parseFloat(i.price),
        total: parseFloat(i.qty) * parseFloat(i.price)
      }))

    if (validItems.length === 0) {
      setError('Please add at least one valid item.')
      return
    }

    setSaving(true)
    await onSave({
      type: 'SALE',
      paymentMethod: isCredit ? 'CREDIT' : 'CASH',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      dateString: date,
      totalAmount: grandTotal,
      items: validItems
    })
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ArrowLeft size={20} style={{ cursor: 'pointer' }} onClick={onCancel} />
        <h2 style={{ fontSize: '16px', fontWeight: '800' }}>Record New Daily Sale</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="card">
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Payment Type</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className={!isCredit ? 'btn-cash' : 'btn-primary'}
              style={{ background: !isCredit ? '#10b981' : '#334155', color: !isCredit ? '#000' : '#fff' }}
              onClick={() => setIsCredit(false)}
            >
              CASH SALE
            </button>
            <button
              type="button"
              className={isCredit ? 'btn-danger' : 'btn-primary'}
              style={{ background: isCredit ? '#ef4444' : '#334155', color: '#fff' }}
              onClick={() => setIsCredit(true)}
            >
              CREDIT (UDHAR)
            </button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: isCredit ? '#ef4444' : '#f59e0b' }}>
            Customer Details {isCredit ? '(Required)' : '(Optional)'}
          </label>

          <AutoCompleteInput 
            value={customerName}
            onChange={(val) => setCustomerName(val)}
            onSelect={handleSelectCustomerSuggestion}
            suggestions={suggestions.customers}
            placeholder="Type customer name (typing suggestions available)"
          />

          <input 
            type="tel" 
            placeholder="Phone Number (Auto-fills on customer selection)" 
            className="input-field"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
          <input 
            type="date" 
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Items Sold</h3>
          <button 
            type="button" 
            onClick={() => setItems([...items, { name: '', qty: '1', price: '' }])}
            style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
          >
            + Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>Item #{index + 1}</span>
              {items.length > 1 && (
                <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => setItems(items.filter((_, i) => i !== index))} />
              )}
            </div>

            <AutoCompleteInput 
              value={item.name}
              onChange={(val) => {
                const newArr = [...items]
                newArr[index].name = val
                setItems(newArr)
              }}
              suggestions={suggestions.items}
              placeholder="Type item name (e.g. Cement, PVC Pipe)"
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                placeholder="Qty" 
                className="input-field"
                value={item.qty}
                onChange={(e) => {
                  const newArr = [...items]
                  newArr[index].qty = e.target.value
                  setItems(newArr)
                }}
              />
              <input 
                type="number" 
                placeholder="Price (₹)" 
                className="input-field"
                value={item.price}
                onChange={(e) => {
                  const newArr = [...items]
                  newArr[index].price = e.target.value
                  setItems(newArr)
                }}
              />
            </div>
          </div>
        ))}

        {error && <div style={{ color: '#ef4444', fontSize: '12px' }}>{error}</div>}

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Total Amount:</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>{formatCurrency(grandTotal)}</span>
        </div>

        <button type="submit" className="btn-primary" style={{ height: '46px' }} disabled={saving}>
          {saving ? 'SAVING TO MONGODB...' : 'SAVE SALE'}
        </button>
      </form>
    </div>
  )
}

// -------------------------------------------------------------
// Customers / Udhar Register (Only Credit Users)
// -------------------------------------------------------------
function CustomersView({ customers, totalOutstanding, onRecordPayment, onConvertBatch, defaultDate }) {
  const [search, setSearch] = useState('')
  const [selectedCustDetails, setSelectedCustDetails] = useState(null)
  const [paymentModalCust, setPaymentModalCust] = useState(null)
  const [paymentAmt, setPaymentAmt] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [selectedTxIds, setSelectedTxIds] = useState([])

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  )

  const handlePaySubmit = async (e) => {
    e.preventDefault()
    const amt = parseFloat(paymentAmt)
    if (!amt || amt <= 0) return

    await onRecordPayment({
      type: 'PAYMENT',
      paymentMethod: 'CASH',
      customerName: paymentModalCust.name,
      customerPhone: paymentModalCust.phone,
      dateString: defaultDate,
      totalAmount: amt,
      items: [],
      notes: paymentNotes || 'Cash Repayment'
    })

    setPaymentModalCust(null)
    setPaymentAmt('')
    setPaymentNotes('')
  }

  const toggleSelectTx = (id) => {
    if (selectedTxIds.includes(id)) {
      setSelectedTxIds(selectedTxIds.filter(i => i !== id))
    } else {
      setSelectedTxIds([...selectedTxIds, id])
    }
  }

  const handleConvertSelected = async () => {
    if (selectedTxIds.length === 0) return
    if (!window.confirm(`Convert ${selectedTxIds.length} selected credit sales to CASH?`)) return
    await onConvertBatch(selectedTxIds)
    setSelectedTxIds([])
    setSelectedCustDetails(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Market Udhar (Credit Users Only)</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(totalOutstanding)}</div>
        </div>
        <Wallet size={36} color="#ef4444" />
      </div>

      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search credit customer by name or phone..." 
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '36px' }}
        />
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
            No active credit users found
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setSelectedCustDetails(c)}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {c.name} <ChevronRight size={16} color="#f59e0b" />
                  </div>
                  {c.phone && <div style={{ fontSize: '12px', color: '#94a3b8' }}>📞 {c.phone}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Outstanding Udhar</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#ef4444' }}>
                    {formatCurrency(c.outstandingBalance)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #334155' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Total Udhar: {formatCurrency(c.creditGiven)} | Paid: {formatCurrency(c.paidBack)}
                </div>
                <button 
                  className="btn-cash" 
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setPaymentModalCust(c)}
                >
                  Collect Cash
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Purchase History Modal */}
      {selectedCustDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200,
          padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc' }}>{selectedCustDetails.name}'s Udhar Ledger</h3>
                {selectedCustDetails.phone && <span style={{ fontSize: '12px', color: '#94a3b8' }}>📞 {selectedCustDetails.phone}</span>}
              </div>
              <XCircle size={24} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSelectedCustDetails(null)} />
            </div>

            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Net Udhar Balance:</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(selectedCustDetails.outstandingBalance)}</span>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '700', marginTop: '6px' }}>Credit Purchase History:</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedCustDetails.transactions.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '14px' }}>No transactions recorded</div>
              ) : (
                selectedCustDetails.transactions.map(t => {
                  const isCreditSale = t.type === 'SALE' && t.paymentMethod === 'CREDIT'
                  const isSelected = selectedTxIds.includes(t._id || t.id)
                  return (
                    <div 
                      key={t._id || t.id} 
                      style={{ 
                        background: '#0f172a', 
                        border: isSelected ? '1px solid #10b981' : '1px solid #334155', 
                        padding: '10px', 
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isCreditSale && (
                            <div style={{ cursor: 'pointer' }} onClick={() => toggleSelectTx(t._id || t.id)}>
                              {isSelected ? <CheckSquare size={18} color="#10b981" /> : <Square size={18} color="#64748b" />}
                            </div>
                          )}
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> Date: {t.dateString}
                          </span>
                        </div>
                        <span className={`badge ${
                          t.type === 'PAYMENT' ? 'badge-payment' :
                          t.paymentMethod === 'CREDIT' ? 'badge-credit' : 'badge-cash'
                        }`}>
                          {t.type === 'PAYMENT' ? 'REPAYMENT' : t.paymentMethod === 'CREDIT' ? 'CREDIT (UDHAR)' : 'CASH'}
                        </span>
                      </div>

                      {t.items && t.items.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', paddingLeft: '26px' }}>
                          {t.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>• {item.name} ({item.qty} x ₹{item.unitPrice})</span>
                              <span>{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px dotted #334155' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.notes ? `Note: ${t.notes}` : ''}</span>
                        <span style={{ fontWeight: '800', fontSize: '14px', color: '#f8fafc' }}>
                          {formatCurrency(t.totalAmount)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {selectedTxIds.length > 0 && (
              <button 
                className="btn-cash" 
                onClick={handleConvertSelected}
                style={{ marginTop: '10px' }}
              >
                <CheckCircle size={18} /> Convert {selectedTxIds.length} Selected Credit Sales to CASH
              </button>
            )}

            <button 
              className="btn-primary" 
              style={{ background: '#334155', color: '#fff', marginTop: '6px' }}
              onClick={() => setSelectedCustDetails(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Collect Cash Payment Modal */}
      {paymentModalCust && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200,
          padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Collect Cash from {paymentModalCust.name}</h3>
            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>
              Current Udhar Balance: {formatCurrency(paymentModalCust.outstandingBalance)}
            </div>
            <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="number" 
                placeholder="Amount Paid (₹)" 
                className="input-field"
                value={paymentAmt}
                onChange={(e) => setPaymentAmt(e.target.value)}
                autoFocus
              />
              <input 
                type="text" 
                placeholder="Notes (e.g. Cash, GPay)" 
                className="input-field"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn-primary" style={{ background: '#334155', color: '#fff' }} onClick={() => setPaymentModalCust(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-cash">
                  RECORD PAYMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// Edit Transaction Modal Component
// -------------------------------------------------------------
function EditTransactionModal({ tx, onSave, onClose, suggestions }) {
  const [customerName, setCustomerName] = useState(tx.customerName || '')
  const [customerPhone, setCustomerPhone] = useState(tx.customerPhone || '')
  const [paymentMethod, setPaymentMethod] = useState(tx.paymentMethod || 'CASH')
  const [type, setType] = useState(tx.type || 'SALE')
  const [date, setDate] = useState(tx.dateString || getTodayDate())
  const [notes, setNotes] = useState(tx.notes || '')
  const [items, setItems] = useState(
    tx.items && tx.items.length > 0 
      ? tx.items.map(i => ({ name: i.name, qty: String(i.qty), price: String(i.unitPrice) }))
      : [{ name: '', qty: '1', price: '' }]
  )
  const [saving, setSaving] = useState(false)

  const handleSelectCustomerSuggestion = (custObj) => {
    setCustomerName(custObj.name)
    if (custObj.phone) setCustomerPhone(custObj.phone)
  }

  const grandTotal = items.reduce((sum, item) => {
    const q = parseFloat(item.qty) || 0
    const p = parseFloat(item.price) || 0
    return sum + (q * p)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validItems = items.filter(i => i.name.trim() && parseFloat(i.qty) > 0 && parseFloat(i.price) >= 0)
      .map(i => ({
        name: i.name,
        qty: parseFloat(i.qty),
        unitPrice: parseFloat(i.price),
        total: parseFloat(i.qty) * parseFloat(i.price)
      }))

    setSaving(true)
    await onSave({
      type,
      paymentMethod,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      dateString: date,
      totalAmount: grandTotal,
      items: validItems,
      notes
    })
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 200,
      padding: '16px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc' }}>Edit Transaction</h3>
          <XCircle size={22} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className={paymentMethod === 'CASH' ? 'btn-cash' : 'btn-primary'}
              style={{ background: paymentMethod === 'CASH' ? '#10b981' : '#334155', color: paymentMethod === 'CASH' ? '#000' : '#fff', fontSize: '12px' }}
              onClick={() => setPaymentMethod('CASH')}
            >
              CASH
            </button>
            <button
              type="button"
              className={paymentMethod === 'CREDIT' ? 'btn-danger' : 'btn-primary'}
              style={{ background: paymentMethod === 'CREDIT' ? '#ef4444' : '#334155', color: '#fff', fontSize: '12px' }}
              onClick={() => setPaymentMethod('CREDIT')}
            >
              CREDIT (UDHAR)
            </button>
          </div>

          <AutoCompleteInput 
            value={customerName}
            onChange={(val) => setCustomerName(val)}
            onSelect={handleSelectCustomerSuggestion}
            suggestions={suggestions.customers}
            placeholder="Customer Name"
          />

          <input 
            type="tel" 
            placeholder="Phone Number" 
            className="input-field"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
          <input 
            type="date" 
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700' }}>Items</h4>
            <button 
              type="button" 
              onClick={() => setItems([...items, { name: '', qty: '1', price: '' }])}
              style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
            >
              + Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#0f172a', padding: '8px', borderRadius: '6px' }}>
              <AutoCompleteInput 
                value={item.name}
                onChange={(val) => {
                  const newArr = [...items]
                  newArr[index].name = val
                  setItems(newArr)
                }}
                suggestions={suggestions.items}
                placeholder="Item Name"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  placeholder="Qty" 
                  className="input-field"
                  value={item.qty}
                  onChange={(e) => {
                    const newArr = [...items]
                    newArr[index].qty = e.target.value
                    setItems(newArr)
                  }}
                />
                <input 
                  type="number" 
                  placeholder="Price (₹)" 
                  className="input-field"
                  value={item.price}
                  onChange={(e) => {
                    const newArr = [...items]
                    newArr[index].price = e.target.value
                    setItems(newArr)
                  }}
                />
              </div>
            </div>
          ))}

          <input 
            type="text" 
            placeholder="Notes" 
            className="input-field"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Total:</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b' }}>{formatCurrency(grandTotal)}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button type="button" className="btn-primary" style={{ background: '#334155', color: '#fff' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'SAVING...' : 'UPDATE TRANSACTION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
