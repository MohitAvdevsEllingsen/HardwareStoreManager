package com.hardwarestore.manager.data.model

data class DailySummary(
    val dateString: String,
    val totalSales: Double = 0.0,
    val totalCashSales: Double = 0.0,
    val totalCreditSales: Double = 0.0,
    val totalReturns: Double = 0.0,
    val totalCreditCollected: Double = 0.0,
    val netCashInHand: Double = 0.0
)

data class CustomerLedgerSummary(
    val customer: Customer,
    val totalCreditGiven: Double = 0.0,
    val totalCreditReturned: Double = 0.0,
    val totalPaidBack: Double = 0.0,
    val outstandingBalance: Double = 0.0
)
