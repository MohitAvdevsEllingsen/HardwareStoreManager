package com.hardwarestore.manager

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.hardwarestore.manager.ui.components.BottomNavBar
import com.hardwarestore.manager.ui.components.Screen
import com.hardwarestore.manager.ui.screens.*
import com.hardwarestore.manager.ui.theme.HardwareStoreManagerTheme
import com.hardwarestore.manager.ui.viewmodel.HardwareViewModel
import com.hardwarestore.manager.ui.viewmodel.HardwareViewModelFactory

class MainActivity : ComponentActivity() {

    private val viewModel: HardwareViewModel by viewModels {
        HardwareViewModelFactory((application as HardwareApp).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HardwareStoreManagerTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Home.route

                Scaffold(
                    bottomBar = {
                        BottomNavBar(
                            currentRoute = currentRoute,
                            onNavigate = { route ->
                                navController.navigate(route) {
                                    popUpTo(Screen.Home.route) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Home.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(Screen.Home.route) {
                            HomeScreen(
                                viewModel = viewModel,
                                onNavigateToNewSale = { navController.navigate(Screen.NewSale.route) },
                                onNavigateToNewReturn = { navController.navigate(Screen.NewReturnScreen.route) }
                            )
                        }
                        composable(Screen.NewSale.route) {
                            NewSaleScreen(
                                viewModel = viewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(Screen.NewReturn.route) {
                            NewReturnScreen(
                                viewModel = viewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(Screen.Customers.route) {
                            CustomersScreen(
                                viewModel = viewModel
                            )
                        }
                    }
                }
            }
        }
    }
}
