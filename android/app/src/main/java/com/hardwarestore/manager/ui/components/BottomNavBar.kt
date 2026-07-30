package com.hardwarestore.manager.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import com.hardwarestore.manager.ui.theme.*

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Day Summary", Icons.Default.Dashboard)
    object NewSale : Screen("new_sale", "New Sale", Icons.Default.AddShoppingCart)
    object NewReturn : Screen("new_return", "Return", Icons.Default.AssignmentReturn)
    object Customers : Screen("customers", "Udhar Ledger", Icons.Default.People)
}

@Composable
fun BottomNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    val items = listOf(
        Screen.Home,
        Screen.NewSale,
        Screen.NewReturn,
        Screen.Customers
    )

    NavigationBar(
        containerColor = Slate900,
        contentColor = TextPrimary
    ) {
        items.forEach { screen ->
            val selected = currentRoute == screen.route
            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(screen.route) },
                icon = {
                    Icon(
                        imageVector = screen.icon,
                        contentDescription = screen.title,
                        tint = if (selected) Amber500 else TextSecondary
                    )
                },
                label = {
                    Text(
                        text = screen.title,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                        color = if (selected) Amber500 else TextSecondary
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = Slate800
                )
            )
        }
    }
}
