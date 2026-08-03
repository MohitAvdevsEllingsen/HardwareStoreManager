import express from 'express'
import Customer from '../models/Customer.js'
import Transaction from '../models/Transaction.js'

const router = express.Router()

// GET API Root Status Check
router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Hardware Store Manager API is running live!' })
})

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
  } else if (cleanPhone && !customer.phone) {
    customer.phone = cleanPhone
    await customer.save()
  }
  return customer
}

// GET All Unique Transaction Dates from MongoDB
router.get('/dates', async (req, res) => {
  try {
    const dates = await Transaction.distinct('dateString')
    dates.sort((a, b) => b.localeCompare(a)) // Sort descending
    res.json(dates)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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

// POST Create Transaction (Sale / Payment)
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

// PUT Update Transaction (Edit Transaction)
router.put('/transactions/:id', async (req, res) => {
  try {
    const { type, paymentMethod, customerName, customerPhone, dateString, totalAmount, items, notes } = req.body

    const customer = await findOrCreateCustomer(customerName, customerPhone)

    const updatedTx = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        type,
        paymentMethod,
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        customerId: customer ? customer._id : null,
        dateString,
        totalAmount: Number(totalAmount) || 0,
        items: items || [],
        notes: notes || ''
      },
      { new: true }
    )

    if (!updatedTx) return res.status(404).json({ error: 'Transaction not found' })
    res.json(updatedTx)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST Batch Convert Credit Transactions to Cash (Multi-select)
router.post('/transactions/convert-to-cash', async (req, res) => {
  try {
    const { transactionIds } = req.body
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ error: 'transactionIds array is required' })
    }

    await Transaction.updateMany(
      { _id: { $in: transactionIds } },
      { $set: { paymentMethod: 'CASH' } }
    )

    res.json({ success: true, message: `Converted ${transactionIds.length} credit sales to cash` })
  } catch (err) {
    res.status(500).json({ error: err.message })
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
    let creditCollected = 0

    txs.forEach(t => {
      if (t.type === 'SALE') {
        totalSales += t.totalAmount
        if (t.paymentMethod === 'CASH') cashSales += t.totalAmount
        else creditSales += t.totalAmount
      } else if (t.type === 'PAYMENT') {
        creditCollected += t.totalAmount
      }
    })

    const netCashInHand = cashSales + creditCollected

    res.json({
      dateString: date,
      totalSales,
      cashSales,
      creditSales,
      creditCollected,
      netCashInHand
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET Customer Ledgers & Outstanding Udhar Balances (Filter onlyCredit)
router.get('/customers', async (req, res) => {
  try {
    const { onlyCredit } = req.query
    const customers = await Customer.find().sort({ name: 1 })
    const allTxs = await Transaction.find().sort({ dateString: -1, createdAt: -1 })

    let customerLedgers = customers.map(c => {
      const customerTxs = allTxs.filter(t => 
        (t.customerId && t.customerId.toString() === c._id.toString()) ||
        (c.phone && t.customerPhone === c.phone) ||
        (t.customerName.toLowerCase() === c.name.toLowerCase())
      )

      let creditGiven = 0
      let paidBack = 0

      customerTxs.forEach(t => {
        if (t.type === 'SALE' && t.paymentMethod === 'CREDIT') {
          creditGiven += t.totalAmount
        } else if (t.type === 'PAYMENT') {
          paidBack += t.totalAmount
        }
      })

      const outstandingBalance = Math.max(0, creditGiven - paidBack)

      return {
        _id: c._id,
        name: c.name,
        phone: c.phone,
        creditGiven,
        paidBack,
        outstandingBalance,
        transactions: customerTxs
      }
    })

    if (onlyCredit === 'true') {
      customerLedgers = customerLedgers.filter(c => c.outstandingBalance > 0)
    }

    res.json(customerLedgers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET Auto-complete Suggestions (Customers & Items)
router.get('/suggestions', async (req, res) => {
  try {
    const customers = await Customer.find({}, 'name phone').sort({ name: 1 })
    const allTxs = await Transaction.find({}, 'items')

    const itemNamesSet = new Set()
    allTxs.forEach(t => {
      if (t.items) {
        t.items.forEach(i => {
          if (i.name && i.name.trim()) itemNamesSet.add(i.name.trim())
        })
      }
    })

    res.json({
      customers: customers.map(c => ({ name: c.name, phone: c.phone || '' })),
      items: Array.from(itemNamesSet)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
