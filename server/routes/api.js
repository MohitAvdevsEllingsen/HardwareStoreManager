import express from 'express'
import Customer from '../models/Customer.js'
import Transaction from '../models/Transaction.js'

const router = express.Router()

// Helper: Get or Create Customer
async function findOrCreateCustomer(name, phone) {
  if (!name || !name.trim()) return null
  const cleanName = name.trim()
  const cleanPhone = phone ? phone.trim() : ''

  let customer = null
  if (cleanPhone) {
    customer = await Customer.findOne({ phone: cleanPhone })
  }
  if (!customer) {
    customer = await Customer.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } })
  }
  if (!customer) {
    customer = await Customer.create({ name: cleanName, phone: cleanPhone })
  }
  return customer
}

// GET Transactions (Filter by date & type)
router.get('/transactions', async (req, res) => {
  try {
    const { date, type } = req.query
    const query = {}
    if (date) query.dateString = date
    if (type && type !== 'ALL') {
      if (type === 'CREDIT') {
        query.paymentMethod = 'CREDIT'
      } else {
        query.type = type
      }
    }

    const txs = await Transaction.find(query).sort({ createdAt: -1 })
    res.json(txs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST Create Transaction (Sale / Return / Repayment)
router.get('/transactions', async (req, res) => {
  try {
    const { date, type } = req.query
    const query = {}
    if (date) query.dateString = date
    if (type && type !== 'ALL') {
      if (type === 'CREDIT') {
        query.paymentMethod = 'CREDIT'
      } else {
        query.type = type
      }
    }

    const txs = await Transaction.find(query).sort({ createdAt: -1 })
    res.json(txs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/transactions', async (req, res) => {
  try {
    const { type, paymentMethod, customerName, customerPhone, dateString, totalAmount, items, notes } = req.body

    const customer = await findOrCreateCustomer(customerName, customerPhone)

    const tx = await Transaction.create({
      type,
      paymentMethod,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      customerId: customer ? customer._id : null,
      dateString,
      totalAmount: Number(totalAmount) || 0,
      items: items || [],
      notes: notes || ''
    })

    res.status(201).json(tx)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE Transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Transaction deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET Daily Summary for Date
router.get('/summary', async (req, res) => {
  try {
    const { date } = req.query
    if (!date) return res.status(400).json({ error: 'date query parameter is required' })

    const txs = await Transaction.find({ dateString: date })

    let totalSales = 0
    let cashSales = 0
    let creditSales = 0
    let returns = 0
    let cashRefunds = 0
    let creditCollected = 0

    txs.forEach(t => {
      if (t.type === 'SALE') {
        totalSales += t.totalAmount
        if (t.paymentMethod === 'CASH') cashSales += t.totalAmount
        else creditSales += t.totalAmount
      } else if (t.type === 'RETURN') {
        returns += t.totalAmount
        if (t.paymentMethod === 'CASH') cashRefunds += t.totalAmount
      } else if (t.type === 'PAYMENT') {
        creditCollected += t.totalAmount
      }
    })

    const netCashInHand = cashSales + creditCollected - cashRefunds

    res.json({
      dateString: date,
      totalSales,
      cashSales,
      creditSales,
      returns,
      creditCollected,
      netCashInHand
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET Customer Ledgers & Outstanding Udhar Balances
router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 })
    const allTxs = await Transaction.find()

    const customerLedgers = customers.map(c => {
      const customerTxs = allTxs.filter(t => 
        (t.customerId && t.customerId.toString() === c._id.toString()) ||
        (c.phone && t.customerPhone === c.phone) ||
        (t.customerName.toLowerCase() === c.name.toLowerCase())
      )

      let creditGiven = 0
      let creditReturned = 0
      let paidBack = 0

      customerTxs.forEach(t => {
        if (t.type === 'SALE' && t.paymentMethod === 'CREDIT') {
          creditGiven += t.totalAmount
        } else if (t.type === 'RETURN' && t.paymentMethod === 'CREDIT') {
          creditReturned += t.totalAmount
        } else if (t.type === 'PAYMENT') {
          paidBack += t.totalAmount
        }
      })

      const outstandingBalance = Math.max(0, creditGiven - creditReturned - paidBack)

      return {
        _id: c._id,
        name: c.name,
        phone: c.phone,
        creditGiven,
        creditReturned,
        paidBack,
        outstandingBalance
      }
    })

    res.json(customerLedgers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
