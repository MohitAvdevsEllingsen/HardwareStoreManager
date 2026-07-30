import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  RotateCcw, 
  Users, 
  Plus, 
  Calendar, 
  Phone, 
  User, 
  Trash2, 
  ArrowLeft, 
  Search,
  Wallet,
  RefreshCw,
  Database
} from 'lucide-react'

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api'

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

export default function App() {
  const [activeTab, setActiveTab] = useState('home') // home | sale | return | customers
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [filterType, setFilterType] = useState('ALL')
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({
    totalSales: 0,
    cashSales: 0,
    creditSales: 0,
    returns: 0,
    creditCollected: 0,
    netCashInHand: 0
  })
  const [customerList, setCustomerList] = useState([])
  const [loading, setLoading] = useState(true)
  const [dbConnected, setDbConnected] = useState(true)

  // Fetch Transactions and Summary for Selected Date from MongoDB
  const fetchData = async () => {
    setLoading(true)
    try {
      const [txRes, sumRes, custRes] = await Promise.all([
        fetch(`${API_BASE}/transactions?date=${selectedDate}&type=${filterType}`),
        fetch(`${API_BASE}/summary?date=${selectedDate}`),
        fetch(`${API_BASE}/customers`)
      ])

      if (txRes.ok && sumRes.ok && custRes.ok) {
        const txData = await txRes.json()
        const sumData = await sumRes.json()
        const custData = await custRes.json()

        setTransactions(txData)
        setSummary(sumData)
        setCustomerList(custData)
        setDbConnected(true)
      } else {
        setDbConnected(false)
      }
    } catch (err) {
      console.error('Failed to fetch from MongoDB server:', err)
      setDbConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedDate, filterType])

  const totalOutstanding = customerList.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0)

  // Handlers
  const handleAddTransaction = async (newTx) => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      })

      if (res.ok) {
        fetchData()
        setActiveTab('home')
      } else {
        alert('Failed to save to MongoDB database.')
      }
    } catch (err) {
      alert('Error connecting to backend server.')
    }
  }

  const handleDeleteTx = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      alert('Error deleting transaction.')
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
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>Hardware Store Manager</h1>
            <span style={{ 
              fontSize: '10px', 
              padding: '2px 6px', 
              borderRadius: '10px', 
              background: dbConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: dbConnected ? '#10b981' : '#ef4444',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Database size={10} /> {dbConnected ? 'MongoDB Live' : 'Offline'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Daily Sales, Motiry Return & Udhar</p>
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
            txs={transactions}
            filterType={filterType}
            setFilterType={setFilterType}
            onNewSale={() => setActiveTab('sale')}
            onNewReturn={() => setActiveTab('return')}
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
          />
        )}

        {activeTab === 'return' && (
          <NewReturnView 
            onSave={handleAddTransaction} 
            onCancel={() => setActiveTab('home')}
            defaultDate={selectedDate}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView 
            customers={customerList} 
            totalOutstanding={totalOutstanding}
            onRecordPayment={(tx) => handleAddTransaction(tx)}
            defaultDate={selectedDate}
          />
        )}
      </main>

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
        <div className={`nav-item ${activeTab === 'return' ? 'active' : ''}`} onClick={() => setActiveTab('return')}>
          <RotateCcw size={20} />
          <span>Motiry Return</span>
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
// Home / Day-End Summary Component
// -------------------------------------------------------------
function HomeView({ summary, selectedDate, txs, filterType, setFilterType, onNewSale, onNewReturn, onDelete, onRefresh, loading }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '15px', color: '#94a3b8' }}>Day-End Summary ({selectedDate})</h2>
        <button 
          onClick={onRefresh}
          style={{ background: '#1e293b', border: 'none', color: '#f59e0b', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
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
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Returns Today (Motiry)</div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(summary.returns)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Credit Collected</div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#06b6d4' }}>{formatCurrency(summary.creditCollected)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Net Cash in Hand</div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#10b981' }}>{formatCurrency(summary.netCashInHand)}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button className="btn-primary" onClick={onNewSale}>
          <Plus size={18} /> New Daily Sale
        </button>
        <button className="btn-danger" onClick={onNewReturn} style={{ background: '#334155', color: '#f8fafc' }}>
          <RotateCcw size={18} color="#ef4444" /> Return Item
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginTop: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>Today's Transaction List</h3>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {[
            ['ALL', 'All'],
            ['SALE', 'Sales'],
            ['CREDIT', 'Udhar'],
            ['RETURN', 'Returns'],
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

      {/* Transactions */}
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
                  t.type === 'RETURN' ? 'badge-return' :
                  t.type === 'PAYMENT' ? 'badge-payment' :
                  t.paymentMethod === 'CREDIT' ? 'badge-credit' : 'badge-cash'
                }`}>
                  {t.type === 'RETURN' ? 'RETURN (MOTIRY)' :
                   t.type === 'PAYMENT' ? 'CREDIT REPAYMENT' :
                   t.paymentMethod === 'CREDIT' ? 'CREDIT SALE (UDHAR)' : 'CASH SALE'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: '800', fontSize: '15px', color: t.type === 'RETURN' ? '#ef4444' : '#f8fafc' }}>
                    {formatCurrency(t.totalAmount)}
                  </span>
                  <Trash2 size={16} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => onDelete(t._id || t.id)} />
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
function NewSaleView({ onSave, onCancel, defaultDate }) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isCredit, setIsCredit] = useState(false)
  const [date, setDate] = useState(defaultDate)
  const [items, setItems] = useState([{ name: '', qty: '1', price: '' }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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
          <input 
            type="text" 
            placeholder="Customer Name" 
            className="input-field"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
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
            <input 
              type="text" 
              placeholder="Item Name (e.g. Cement, PVC Pipe)" 
              className="input-field"
              value={item.name}
              onChange={(e) => {
                const newArr = [...items]
                newArr[index].name = e.target.value
                setItems(newArr)
              }}
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
// New Return Component (Customer Motiry Return)
// -------------------------------------------------------------
function NewReturnView({ onSave, onCancel, defaultDate }) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isCreditReduction, setIsCreditReduction] = useState(true)
  const [date, setDate] = useState(defaultDate)
  const [reason, setReason] = useState('')
  const [items, setItems] = useState([{ name: '', qty: '1', price: '' }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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

    if (validItems.length === 0) {
      setError('Please add at least one valid returned item.')
      return
    }

    setSaving(true)
    await onSave({
      type: 'RETURN',
      paymentMethod: isCreditReduction ? 'CREDIT' : 'CASH',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      dateString: date,
      totalAmount: grandTotal,
      items: validItems,
      notes: reason
    })
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ArrowLeft size={20} style={{ cursor: 'pointer' }} onClick={onCancel} />
        <h2 style={{ fontSize: '16px', fontWeight: '800' }}>Customer Return (Motiry)</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="card">
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Adjustment Mode</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-danger"
              style={{ background: isCreditReduction ? '#ef4444' : '#334155', fontSize: '12px' }}
              onClick={() => setIsCreditReduction(true)}
            >
              REDUCE UDHAR BALANCE
            </button>
            <button
              type="button"
              className="btn-cash"
              style={{ background: !isCreditReduction ? '#10b981' : '#334155', color: !isCreditReduction ? '#000' : '#fff', fontSize: '12px' }}
              onClick={() => setIsCreditReduction(false)}
            >
              CASH REFUND
            </button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>Customer Details</label>
          <input 
            type="text" 
            placeholder="Customer Name" 
            className="input-field"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
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
          <input 
            type="text" 
            placeholder="Return Reason (e.g. Extra Unused Goods)" 
            className="input-field"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Returned Items</h3>
          <button 
            type="button" 
            onClick={() => setItems([...items, { name: '', qty: '1', price: '' }])}
            style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
          >
            + Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>Returned Item #{index + 1}</span>
              {items.length > 1 && (
                <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => setItems(items.filter((_, i) => i !== index))} />
              )}
            </div>
            <input 
              type="text" 
              placeholder="Item Name" 
              className="input-field"
              value={item.name}
              onChange={(e) => {
                const newArr = [...items]
                newArr[index].name = e.target.value
                setItems(newArr)
              }}
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
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Total Return Value:</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(grandTotal)}</span>
        </div>

        <button type="submit" className="btn-danger" style={{ height: '46px' }} disabled={saving}>
          {saving ? 'SAVING TO MONGODB...' : 'SAVE CUSTOMER RETURN'}
        </button>
      </form>
    </div>
  )
}

// -------------------------------------------------------------
// Customers / Udhar Register Component
// -------------------------------------------------------------
function CustomersView({ customers, totalOutstanding, onRecordPayment, defaultDate }) {
  const [search, setSearch] = useState('')
  const [selectedCust, setSelectedCust] = useState(null)
  const [paymentAmt, setPaymentAmt] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')

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
      customerName: selectedCust.name,
      customerPhone: selectedCust.phone,
      dateString: defaultDate,
      totalAmount: amt,
      items: [],
      notes: paymentNotes || 'Cash Repayment'
    })

    setSelectedCust(null)
    setPaymentAmt('')
    setPaymentNotes('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Market Udhar (Credit)</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(totalOutstanding)}</div>
        </div>
        <Wallet size={36} color="#ef4444" />
      </div>

      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search customer by name or phone..." 
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '36px' }}
        />
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No customers recorded in MongoDB</div>
        ) : (
          filtered.map((c) => (
            <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{c.name}</div>
                  {c.phone && <div style={{ fontSize: '12px', color: '#94a3b8' }}>📞 {c.phone}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Outstanding</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: c.outstandingBalance > 0 ? '#ef4444' : '#10b981' }}>
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
                  onClick={() => setSelectedCust(c)}
                >
                  Collect Cash
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Modal */}
      {selectedCust && (
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
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Collect Cash from {selectedCust.name}</h3>
            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>
              Current Udhar Balance: {formatCurrency(selectedCust.outstandingBalance)}
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
                <button type="button" className="btn-primary" style={{ background: '#334155', color: '#fff' }} onClick={() => setSelectedCust(null)}>
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
