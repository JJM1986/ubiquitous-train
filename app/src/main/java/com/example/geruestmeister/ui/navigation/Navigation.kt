package com.example.geruestmeister.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    object Dashboard : Screen(
        route = "dashboard",
        title = "Übersicht",
        selectedIcon = Icons.Filled.Dashboard,
        unselectedIcon = Icons.Outlined.Dashboard
    )
    object Projects : Screen(
        route = "projects",
        title = "Baustellen",
        selectedIcon = Icons.Filled.Construction,
        unselectedIcon = Icons.Outlined.Construction
    )
    object Calculator : Screen(
        route = "calculator",
        title = "Rechner",
        selectedIcon = Icons.Filled.Calculate,
        unselectedIcon = Icons.Outlined.Calculate
    )
    object Assignments : Screen(
        route = "assignments",
        title = "Einsatzplan",
        selectedIcon = Icons.Filled.CalendarMonth,
        unselectedIcon = Icons.Outlined.CalendarMonth
    )
    object Freigaben : Screen(
        route = "freigaben",
        title = "Freigaben",
        selectedIcon = Icons.Filled.VerifiedUser,
        unselectedIcon = Icons.Outlined.VerifiedUser
    )
    object Materials : Screen(
        route = "materials",
        title = "Lager",
        selectedIcon = Icons.Filled.Inventory2,
        unselectedIcon = Icons.Outlined.Inventory2
    )

    companion object {
        val bottomNavItems = listOf(Dashboard, Projects, Calculator, Assignments)
    }
}
