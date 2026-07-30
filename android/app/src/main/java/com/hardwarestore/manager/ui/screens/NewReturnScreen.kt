package com.hardwarestore.manager.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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
import com.hardwarestore.manager.ui.theme.*
import com.hardwarestore.manager.ui.viewmodel.HardwareViewModel
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewReturnScreen(
    viewModel: HardwareViewModel,
    onNavigateBack: () -> Unit
) {
    var customerName by remember { mutableStateOf("") }
    var customerPhone by remember { mutableStateOf("") }
    var isCreditReduction by remember { mutableStateOf(true) } // Credit Balance Reduction vs Cash Refund
    var returnDate by remember { mutableStateOf(viewModel.selectedDate.value) }
    var returnReason by remember { mutableStateOf("") }

    val items = remember { mutableStateListOf(SaleItemInput()) }
    var errorMessage by remember { mutableStateOf("") }

    val currencyFormat = remember {
        NumberFormat.getCurrencyInstance(Locale("en", "IN"))
    }

    val grandTotal = items.sumOf { item ->
        val q = item.qty.toDoubleOrNull() ?: 0.0
        val p = item.price.toDoubleOrNull() ?: 0.0
        q * p
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Customer Return (Motiry)", color = TextPrimary, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Slate900)
            )
        },
        containerColor = Slate900
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Refund / Adjustment Type Toggle
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Slate800),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Refund / Adjustment Mode", style = MaterialTheme.typography.titleSmall, color = TextSecondary)
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Button(
                                    onClick = { isCreditReduction = true },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (isCreditReduction) Rose500 else Slate700,
                                        contentColor = if (isCreditReduction) Color.White else TextPrimary
                                    )
                                ) {
                                    Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("REDUCE UDHAR", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }

                                Button(
                                    onClick = { isCreditReduction = false },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (!isCreditReduction) Emerald500 else Slate700,
                                        contentColor = if (!isCreditReduction) Color.Black else TextPrimary
                                    )
                                ) {
                                    Icon(Icons.Default.Payments, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("CASH REFUND", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }

                // Customer Details Section
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Slate800),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text("Customer Info", style = MaterialTheme.typography.titleSmall, color = Amber500, fontWeight = FontWeight.Bold)

                            OutlinedTextField(
                                value = customerName,
                                onValueChange = { customerName = it },
                                label = { Text("Customer Name") },
                                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Amber500) },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Amber500,
                                    unfocusedBorderColor = Slate700,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                )
                            )

                            OutlinedTextField(
                                value = customerPhone,
                                onValueChange = { customerPhone = it },
                                label = { Text("Customer Phone Number") },
                                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = Amber500) },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Amber500,
                                    unfocusedBorderColor = Slate700,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                )
                            )

                            OutlinedTextField(
                                value = returnDate,
                                onValueChange = { returnDate = it },
                                label = { Text("Return Date (YYYY-MM-DD)") },
                                leadingIcon = { Icon(Icons.Default.CalendarToday, contentDescription = null, tint = Amber500) },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Amber500,
                                    unfocusedBorderColor = Slate700,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                )
                            )

                            OutlinedTextField(
                                value = returnReason,
                                onValueChange = { returnReason = it },
                                label = { Text("Reason for Return (e.g. Defective, Unused Extra)") },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Amber500,
                                    unfocusedBorderColor = Slate700,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                )
                            )
                        }
                    }
                }

                // Returned Goods Line Items
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Returned Hardware Items", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
                        TextButton(onClick = { items.add(SaleItemInput()) }) {
                            Icon(Icons.Default.Add, contentDescription = null, tint = Rose500)
                            Text("Add Item", color = Rose500, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                itemsIndexed(items) { index, item ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Slate800),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Returned Item #${index + 1}", style = MaterialTheme.typography.titleSmall, color = Rose500)
                                if (items.size > 1) {
                                    IconButton(onClick = { items.removeAt(index) }, modifier = Modifier.size(24.dp)) {
                                        Icon(Icons.Default.Delete, contentDescription = "Remove", tint = Rose500)
                                    }
                                }
                            }

                            OutlinedTextField(
                                value = item.name,
                                onValueChange = { items[index] = item.copy(name = it) },
                                label = { Text("Item Name") },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Amber500,
                                    unfocusedBorderColor = Slate700,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                )
                            )

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedTextField(
                                    value = item.qty,
                                    onValueChange = { items[index] = item.copy(qty = it) },
                                    label = { Text("Qty Returned") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = Amber500,
                                        unfocusedBorderColor = Slate700,
                                        focusedTextColor = TextPrimary,
                                        unfocusedTextColor = TextPrimary
                                    )
                                )

                                OutlinedTextField(
                                    value = item.price,
                                    onValueChange = { items[index] = item.copy(price = it) },
                                    label = { Text("Unit Value (₹)") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = Amber500,
                                        unfocusedBorderColor = Slate700,
                                        focusedTextColor = TextPrimary,
                                        unfocusedTextColor = TextPrimary
                                    )
                                )
                            }
                        }
                    }
                }

                if (errorMessage.isNotBlank()) {
                    item {
                        Text(errorMessage, color = Rose500, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            // Bottom Footer
            Surface(
                color = Slate800,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Total Return Value:", style = MaterialTheme.typography.titleMedium, color = TextSecondary)
                        Text(
                            text = currencyFormat.format(grandTotal),
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Rose500
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = {
                            val validItems = items.mapNotNull {
                                val q = it.qty.toDoubleOrNull() ?: 0.0
                                val p = it.price.toDoubleOrNull() ?: 0.0
                                if (it.name.isNotBlank() && q > 0 && p >= 0) {
                                    it.name to (q to p)
                                } else null
                            }
                            if (validItems.isEmpty()) {
                                errorMessage = "Please enter at least one valid returned item."
                                return@Button
                            }

                            viewModel.saveReturn(
                                customerName = customerName.trim(),
                                customerPhone = customerPhone.trim(),
                                isCreditReduction = isCreditReduction,
                                items = validItems,
                                reason = returnReason,
                                dateString = returnDate.ifBlank { viewModel.selectedDate.value },
                                onSuccess = onNavigateBack
                            )
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Rose500, contentColor = Color.White),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("SAVE CUSTOMER RETURN", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}
