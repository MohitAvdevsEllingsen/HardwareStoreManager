package com.hardwarestore.manager.data.repository

import com.hardwarestore.manager.data.db.CustomerDao
import com.hardwarestore.manager.data.db.TransactionDao
import com.hardwarestore.manager.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map

class HardwareRepository(
    private val customerDao: CustomerDao,
    private val transactionDao: TransactionDao
) {
    val allCustomers: Flow<List<Customer>> = customerDao.getAllCustomers()

    val allTransactions: Flow<List<TransactionWithDetails>> = transactionDao.getAllTransactionsWithDetails()

    fun getTransactionsByDate(dateString: String): Flow<List<TransactionWithDetails>> {
        return transactionDao.getTransactionsByDate(dateString)
    }

    fun getDailySummary(dateString: String): Flow<DailySummary> {
        return transactionDao.getTransactionsByDate(dateString).map { list ->
            var sales = 0.0
            var cashSales = 0.0
            var creditSales = 0.0
            var returns = 0.0
            var creditCollected = 0.0
            var cashRefunds = 0.0

            for (txDetail in list) {
                val tx = txDetail.transaction
                when (tx.type) {
                    TransactionType.SALE -> {
                        sales += tx.totalAmount
                        if (tx.paymentMethod == PaymentMethod.CASH) {
                            cashSales += tx.totalAmount
                        } else {
                            creditSales += tx.totalAmount
                        }
                    }
                    TransactionType.RETURN -> {
                        returns += tx.totalAmount
                        if (tx.paymentMethod == PaymentMethod.CASH) {
                            cashRefunds += tx.totalAmount
                        }
                    }
                    TransactionType.PAYMENT -> {
                        creditCollected += tx.totalAmount
                    }
                }
            }

            val netCashInHand = cashSales + creditCollected - cashRefunds

            DailySummary(
                dateString = dateString,
                totalSales = sales,
                totalCashSales = cashSales,
                totalCreditSales = creditSales,
                totalReturns = returns,
                totalCreditCollected = creditCollected,
                netCashInHand = netCashInHand
            )
        }
    }

    fun getCustomerLedgerSummaries(): Flow<List<CustomerLedgerSummary>> {
        return combine(customerDao.getAllCustomers(), transactionDao.getAllTransactionsWithDetails()) { customers, txs ->
            customers.map { customer ->
                val customerTxs = txs.filter { it.transaction.customerId == customer.id || (customer.phone.isNotBlank() && it.transaction.customerPhone == customer.phone) }
                var creditGiven = 0.0
                var creditReturned = 0.0
                var paidBack = 0.0

                for (txDetail in customerTxs) {
                    val tx = txDetail.transaction
                    if (tx.type == TransactionType.SALE && tx.paymentMethod == PaymentMethod.CREDIT) {
                        creditGiven += tx.totalAmount
                    } else if (tx.type == TransactionType.RETURN && tx.paymentMethod == PaymentMethod.CREDIT) {
                        creditReturned += tx.totalAmount
                    } else if (tx.type == TransactionType.PAYMENT) {
                        paidBack += tx.totalAmount
                    }
                }

                val balance = creditGiven - creditReturned - paidBack

                CustomerLedgerSummary(
                    customer = customer,
                    totalCreditGiven = creditGiven,
                    totalCreditReturned = creditReturned,
                    totalPaidBack = paidBack,
                    outstandingBalance = if (balance > 0) balance else 0.0
                )
            }
        }
    }

    suspend fun saveSale(
        customerName: String,
        customerPhone: String,
        paymentMethod: PaymentMethod,
        items: List<Pair<String, Pair<Double, Double>>>, // name -> (qty, price)
        notes: String,
        dateString: String
    ): Long {
        var customerId: Long? = null
        if (customerName.isNotBlank()) {
            val existing = if (customerPhone.isNotBlank()) customerDao.getCustomerByPhone(customerPhone) else null
            if (existing != null) {
                customerId = existing.id
            } else {
                customerId = customerDao.insertCustomer(Customer(name = customerName, phone = customerPhone))
            }
        }

        val total = items.sumOf { it.second.first * it.second.second }

        val tx = Transaction(
            customerId = customerId,
            customerName = customerName,
            customerPhone = customerPhone,
            type = TransactionType.SALE,
            paymentMethod = paymentMethod,
            totalAmount = total,
            notes = notes,
            dateString = dateString
        )

        val txId = transactionDao.insertTransaction(tx)

        val txItems = items.map { (name, pair) ->
            TransactionItem(
                transactionId = txId,
                itemName = name,
                quantity = pair.first,
                unitPrice = pair.second,
                totalPrice = pair.first * pair.second
            )
        }

        transactionDao.insertTransactionItems(txItems)
        return txId
    }

    suspend fun saveReturn(
        customerName: String,
        customerPhone: String,
        refundMethod: PaymentMethod,
        items: List<Pair<String, Pair<Double, Double>>>,
        reason: String,
        dateString: String
    ): Long {
        var customerId: Long? = null
        if (customerName.isNotBlank()) {
            val existing = if (customerPhone.isNotBlank()) customerDao.getCustomerByPhone(customerPhone) else null
            if (existing != null) {
                customerId = existing.id
            } else {
                customerId = customerDao.insertCustomer(Customer(name = customerName, phone = customerPhone))
            }
        }

        val total = items.sumOf { it.second.first * it.second.second }

        val tx = Transaction(
            customerId = customerId,
            customerName = customerName,
            customerPhone = customerPhone,
            type = TransactionType.RETURN,
            paymentMethod = refundMethod,
            totalAmount = total,
            notes = reason,
            dateString = dateString
        )

        val txId = transactionDao.insertTransaction(tx)

        val txItems = items.map { (name, pair) ->
            TransactionItem(
                transactionId = txId,
                itemName = name,
                quantity = pair.first,
                unitPrice = pair.second,
                totalPrice = pair.first * pair.second
            )
        }

        transactionDao.insertTransactionItems(txItems)
        return txId
    }

    suspend fun recordCustomerPayment(
        customer: Customer,
        amount: Double,
        notes: String,
        dateString: String
    ): Long {
        val tx = Transaction(
            customerId = customer.id,
            customerName = customer.name,
            customerPhone = customer.phone,
            type = TransactionType.PAYMENT,
            paymentMethod = PaymentMethod.CASH,
            totalAmount = amount,
            notes = notes,
            dateString = dateString
        )

        return transactionDao.insertTransaction(tx)
    }

    suspend fun deleteTransaction(id: Long) {
        transactionDao.deleteTransaction(id)
    }
}
