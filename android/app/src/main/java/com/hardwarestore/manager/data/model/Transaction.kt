package com.hardwarestore.manager.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class TransactionType {
    SALE,       // Daily Sale
    RETURN,     // Customer Goods Return (Motiry Return)
    PAYMENT     // Customer Udhar / Credit Repayment
}

enum class PaymentMethod {
    CASH,
    CREDIT      // Borrow / Udhar
}

@Entity(tableName = "transactions")
data class Transaction(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val customerId: Long? = null,
    val customerName: String = "",
    val customerPhone: String = "",
    val type: TransactionType,
    val paymentMethod: PaymentMethod,
    val totalAmount: Double,
    val notes: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val dateString: String // YYYY-MM-DD for date-based daily indexing
)
