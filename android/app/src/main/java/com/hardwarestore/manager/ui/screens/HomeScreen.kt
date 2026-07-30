package com.hardwarestore.manager.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hardwarestore.manager.data.model.*
import com.hardwarestore.manager.ui.theme.*
import com.hardwarestore.manager.ui.viewmodel.HardwareViewModel
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HardwareViewModel,
    onNavigateToNewSale: () -> Unit,
    onNavigateToNewReturn: () -> Unit
) {
    val selectedDate by viewModel.selectedDate.collectAsState()
    val dailySummary by viewModel.dailySummary.collectAsState()
    val dailyTransactions by viewModel.dailyTransactions.collectAsState()
    val filterType by viewModel.filterType.collectAsState()

    var showDatePicker by remember { mutableStateOf(false) }

    val currencyFormat = remember {
        NumberFormat.getCurrencyInstance(Locale("en", "IN")).apply {
            maximumFractionDigits = 2
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Hardware Store Manager",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Daily Sales & Udhar Register",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                },
                actions = {
                    Surface(
                        modifier = Modifier
                            .padding(end = 12.dp)
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { showDatePicker = true },
                        color = Slate800
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.CalendarToday,
                                contentDescription = "Date",
                                tint = Amber500,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = selectedDate,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Slate900
                )
            )
        },
        floatingActionButton = {
            Column(horizontalAlignment = Alignment.End) {
                SmallFloatingActionButton(
                    onClick = onNavigateToNewReturn,
                    containerColor = Rose500,
                    contentColor = Color.White,
                    modifier = Modifier.padding(bottom = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.AssignmentReturn, contentDescription = "Return")
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Return", fontWeight = FontWeight.Bold)
                    }
                }
                FloatingActionButton(
                    onClick = onNavigateToNewSale,
                    containerColor = Amber500,
                    contentColor = Color.Black
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.AddShoppingCart, contentDescription = "New Sale")
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("New Sale", fontWeight = FontWeight.Bold)
                    }
                }
            }
        },
        containerColor = Slate900
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Summary Dashboard Section
            item {
                Text(
                    text = "Day-End Summary ($selectedDate)",
                    style = MaterialTheme.typography.titleSmall,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        SummaryMetricCard(
                            title = "Total Sales Today",
                            value = currencyFormat.format(dailySummary.totalSales),
                            icon = Icons.Default.ShoppingCart,
                            iconColor = Amber500,
                            modifier = Modifier.weight(1f)
                        )
                        SummaryMetricCard(
                            title = "Cash Sales",
                            value = currencyFormat.format(dailySummary.totalCashSales),
                            icon = Icons.Default.Payments,
                            iconColor = Emerald500,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        SummaryMetricCard(
                            title = "Credit (Borrow) Sales",
                            value = currencyFormat.format(dailySummary.totalCreditSales),
                            icon = Icons.Default.AccountBalanceWallet,
                            iconColor = Rose500,
                            modifier = Modifier.weight(1f)
                        )
                        SummaryMetricCard(
                            title = "Returns Today",
                            value = currencyFormat.format(dailySummary.totalReturns),
                            icon = Icons.Default.AssignmentReturn,
                            iconColor = Rose500,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        SummaryMetricCard(
                            title = "Credit Collected",
                            value = currencyFormat.format(dailySummary.totalCreditCollected),
                            icon = Icons.Default.PriceCheck,
                            iconColor = Sky500,
                            modifier = Modifier.weight(1f)
                        )
                        SummaryMetricCard(
                            title = "Net Cash In Hand",
                            value = currencyFormat.format(dailySummary.netCashInHand),
                            icon = Icons.Default.PointOfSale,
                            iconColor = Emerald500,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // Filter Tabs for Transactions List
            item {
                Column(modifier = Modifier.padding(top = 8.dp)) {
                    Text(
                        text = "Today's Transactions",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        val filters = listOf(
                            "ALL" to "All",
                            "SALE" to "Sales",
                            "CREDIT" to "Credit (Udhar)",
                            "RETURN" to "Returns",
                            "PAYMENT" to "Repayments"
                        )
                        items(filters) { (key, label) ->
                            val selected = filterType == key
                            FilterChip(
                                selected = selected,
                                onClick = { viewModel.setFilterType(key) },
                                label = { Text(label) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Amber500,
                                    selectedLabelColor = Color.Black,
                                    containerColor = Slate800,
                                    labelColor = TextSecondary
                                )
                            )
                        }
                    }
                }
            }

            // Transactions List
            if (dailyTransactions.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.ReceiptLong,
                                contentDescription = "No transactions",
                                tint = TextSecondary,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "No transactions recorded for $selectedDate",
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                        }
                    }
                }
            } else {
                items(dailyTransactions, key = { it.transaction.id }) { txDetail ->
                    TransactionCardItem(
                        txDetail = txDetail,
                        currencyFormat = currencyFormat,
                        onDelete = { viewModel.deleteTransaction(txDetail.transaction.id) }
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}

@Composable
fun SummaryMetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Slate800),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    fontSize = 11.sp
                )
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = iconColor,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }
    }
}

@Composable
fun TransactionCardItem(
    txDetail: TransactionWithDetails,
    currencyFormat: NumberFormat,
    onDelete: () -> Unit
) {
    val tx = txDetail.transaction
    val badgeColor = when (tx.type) {
        TransactionType.SALE -> if (tx.paymentMethod == PaymentMethod.CASH) Emerald500 else Rose500
        TransactionType.RETURN -> Rose500
        TransactionType.PAYMENT -> Sky500
    }
    val badgeText = when (tx.type) {
        TransactionType.SALE -> if (tx.paymentMethod == PaymentMethod.CASH) "CASH SALE" else "CREDIT SALE (UDHAR)"
        TransactionType.RETURN -> "RETURN (MOTIRY)"
        TransactionType.PAYMENT -> "CREDIT REPAYMENT"
    }

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
                Surface(
                    color = badgeColor.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = badgeText,
                        color = badgeColor,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                Text(
                    text = currencyFormat.format(tx.totalAmount),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (tx.type == TransactionType.RETURN) Rose500 else TextPrimary
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (tx.customerName.isNotBlank()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Customer",
                        tint = TextSecondary,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = tx.customerName + if (tx.customerPhone.isNotBlank()) " (${tx.customerPhone})" else "",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
            }

            if (txDetail.items.isNotEmpty()) {
                Column(modifier = Modifier.padding(vertical = 4.dp)) {
                    txDetail.items.forEach { item ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "• ${item.itemName} (${item.quantity} x ₹${item.unitPrice})",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary
                            )
                            Text(
                                text = currencyFormat.format(item.totalPrice),
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary
                            )
                        }
                    }
                }
            }

            if (tx.notes.isNotBlank()) {
                Text(
                    text = "Note: ${tx.notes}",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
    }
}
