package com.hardwarestore.manager.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.hardwarestore.manager.data.model.*
import com.hardwarestore.manager.data.repository.HardwareRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class HardwareViewModel(
    private val repository: HardwareRepository
) : ViewModel() {

    private val _selectedDate = MutableStateFlow(getCurrentDateString())
    val selectedDate: StateFlow<String> = _selectedDate.asStateFlow()

    private val _filterType = MutableStateFlow("ALL")
    val filterType: StateFlow<String> = _filterType.asStateFlow()

    @OptIn(ExperimentalCoroutinesApi::class)
    val dailyTransactions: StateFlow<List<TransactionWithDetails>> = combine(
        _selectedDate,
        _filterType,
        repository.allTransactions
    ) { date, filter, allTxs ->
        allTxs.filter { txDetail ->
            val matchDate = txDetail.transaction.dateString == date
            if (!matchDate) return@filter false
            when (filter) {
                "SALE" -> txDetail.transaction.type == TransactionType.SALE
                "RETURN" -> txDetail.transaction.type == TransactionType.RETURN
                "PAYMENT" -> txDetail.transaction.type == TransactionType.PAYMENT
                "CREDIT" -> txDetail.transaction.paymentMethod == PaymentMethod.CREDIT
                else -> true
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    @OptIn(ExperimentalCoroutinesApi::class)
    val dailySummary: StateFlow<DailySummary> = _selectedDate.flatMapLatest { date ->
        repository.getDailySummary(date)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DailySummary(getCurrentDateString()))

    val customerLedgers: StateFlow<List<CustomerLedgerSummary>> = repository.getCustomerLedgerSummaries()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setSelectedDate(dateString: String) {
        _selectedDate.value = dateString
    }

    fun setFilterType(filter: String) {
        _filterType.value = filter
    }

    fun saveSale(
        customerName: String,
        customerPhone: String,
        isCredit: Boolean,
        items: List<Pair<String, Pair<Double, Double>>>,
        notes: String,
        dateString: String,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            repository.saveSale(
                customerName = customerName,
                customerPhone = customerPhone,
                paymentMethod = if (isCredit) PaymentMethod.CREDIT else PaymentMethod.CASH,
                items = items,
                notes = notes,
                dateString = dateString
            )
            onSuccess()
        }
    }

    fun saveReturn(
        customerName: String,
        customerPhone: String,
        isCreditReduction: Boolean,
        items: List<Pair<String, Pair<Double, Double>>>,
        reason: String,
        dateString: String,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            repository.saveReturn(
                customerName = customerName,
                customerPhone = customerPhone,
                refundMethod = if (isCreditReduction) PaymentMethod.CREDIT else PaymentMethod.CASH,
                items = items,
                reason = reason,
                dateString = dateString
            )
            onSuccess()
        }
    }

    fun recordCustomerPayment(
        customer: Customer,
        amount: Double,
        notes: String,
        dateString: String,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            repository.recordCustomerPayment(
                customer = customer,
                amount = amount,
                notes = notes,
                dateString = dateString
            )
            onSuccess()
        }
    }

    fun deleteTransaction(id: Long) {
        viewModelScope.launch {
            repository.deleteTransaction(id)
        }
    }

    companion object {
        fun getCurrentDateString(): String {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            return sdf.format(Date())
        }
    }
}

class HardwareViewModelFactory(private val repository: HardwareRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(HardwareViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return HardwareViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
