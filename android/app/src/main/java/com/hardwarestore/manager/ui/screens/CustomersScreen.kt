package com.hardwarestore.manager.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hardwarestore.manager.data.model.Customer
import com.hardwarestore.manager.data.model.CustomerLedgerSummary
import com.hardwarestore.manager.ui.theme.*
import com.hardwarestore.manager.ui.viewmodel.HardwareViewModel
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomersScreen(
    viewModel: HardwareViewModel
) {
    val customerLedgers by viewModel.customerLedgers.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var selectedCustomerForPayment by remember { mutableStateOf<CustomerLedgerSummary?>(null) }

    val currencyFormat = remember {
        NumberFormat.getCurrencyInstance(Locale("en", "IN"))
    }

    val filteredCustomers = customerLedgers.filter {
        it.customer.name.contains(searchQuery, ignoreCase = true) ||
                it.customer.phone.contains(searchQuery)
    }

    val totalOutstandingCredit = customerLedgers.sumOf { it.outstandingBalance }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Customer Credit Ledger (Udhar)", color = TextPrimary, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        },
        containerColor = Slate900
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Total Outstanding Udhar Header Card
            Card(
                colors = CardDefaults.cardColors(containerColor = Slate800),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Total Market Udhar (Credit)", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                        Text(
                            text = currencyFormat.format(totalOutstandingCredit),
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Rose500
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.AccountBalanceWallet,
                        contentDescription = null,
                        tint = Rose500,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search customer by name or number...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Amber500,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )

            // Customer List
            if (filteredCustomers.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.PeopleOutline, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("No customers found", color = TextSecondary)
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredCustomers, key = { it.customer.id }) { ledger ->
                        CustomerLedgerCard(
                            ledger = ledger,
                            currencyFormat = currencyFormat,
                            onCollectPayment = { selectedCustomerForPayment = ledger }
                        )
                    }
                }
            }
        }
    }

    // Payment Collection Modal Dialog
    selectedCustomerForPayment?.let { ledger ->
        RecordPaymentDialog(
            customerName = ledger.customer.name,
            currentBalance = ledger.outstandingBalance,
            currencyFormat = currencyFormat,
            onDismiss = { selectedCustomerForPayment = null },
            onSavePayment = { amount, notes, date ->
                viewModel.recordCustomerPayment(
                    customer = ledger.customer,
                    amount = amount,
                    notes = notes,
                    dateString = date,
                    onSuccess = { selectedCustomerForPayment = null }
                )
            }
        )
    }
}

@Composable
fun CustomerLedgerCard(
    ledger: CustomerLedgerSummary,
    currencyFormat: NumberFormat,
    onCollectPayment: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Slate800),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = ledger.customer.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    if (ledger.customer.phone.isNotBlank()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Phone, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(ledger.customer.phone, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                        }
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text("Outstanding", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Text(
                        text = currencyFormat.format(ledger.outstandingBalance),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (ledger.outstandingBalance > 0) Rose500 else Emerald500
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Divider(color = Slate700)
            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column {
                        Text("Udhar Taken", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                        Text(currencyFormat.format(ledger.totalCreditGiven), style = MaterialTheme.typography.bodySmall, color = TextPrimary)
                    }
                    Column {
                        Text("Paid Back", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                        Text(currencyFormat.format(ledger.totalPaidBack), style = MaterialTheme.typography.bodySmall, color = Emerald500)
                    }
                }

                Button(
                    onClick = onCollectPayment,
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald500, contentColor = Color.Black),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Icon(Icons.Default.PriceCheck, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Collect Cash", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
fun RecordPaymentDialog(
    customerName: String,
    currentBalance: Double,
    currencyFormat: NumberFormat,
    onDismiss: () -> Unit,
    onSavePayment: (Double, String, String) -> Unit
) {
    var amountText by remember { mutableStateOf("") }
    var notesText by remember { mutableStateOf("") }
    var dateText by remember { mutableStateOf(HardwareViewModel.getCurrentDateString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Slate800,
        title = {
            Text("Record Payment from $customerName", color = TextPrimary, fontWeight = FontWeight.Bold)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Current Udhar Balance: ${currencyFormat.format(currentBalance)}",
                    color = Rose500,
                    fontWeight = FontWeight.SemiBold
                )

                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Amount Paid (₹)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Slate700,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )

                OutlinedTextField(
                    value = dateText,
                    onValueChange = { dateText = it },
                    label = { Text("Payment Date (YYYY-MM-DD)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Slate700,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )

                OutlinedTextField(
                    value = notesText,
                    onValueChange = { notesText = it },
                    label = { Text("Notes (e.g. GooglePay, Cash)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = Slate700,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amt = amountText.toDoubleOrNull() ?: 0.0
                    if (amt > 0) {
                        onSavePayment(amt, notesText, dateText)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = Emerald500, contentColor = Color.Black)
            ) {
                Text("RECORD PAYMENT", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        }
    )
}
