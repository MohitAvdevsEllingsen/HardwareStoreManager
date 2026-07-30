import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 }
}, { _id: false })

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['SALE', 'RETURN', 'PAYMENT'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CREDIT'],
    required: true
  },
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  dateString: { type: String, required: true }, // YYYY-MM-DD
  totalAmount: { type: Number, required: true, default: 0 },
  items: [itemSchema],
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Transaction', transactionSchema)
