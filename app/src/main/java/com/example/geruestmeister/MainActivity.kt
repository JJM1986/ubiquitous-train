package com.example.geruestmeister

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.geruestmeister.theme.GeruestMeisterTheme
import com.example.geruestmeister.theme.OrangePrimary
import com.example.geruestmeister.theme.SlateTextSecondary
import com.example.geruestmeister.ui.MainViewModel
import com.example.geruestmeister.ui.navigation.Screen
import com.example.geruestmeister.ui.screens.*

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            GeruestMeisterTheme {
                GeruestMeisterApp(viewModel)
            }
        }
    }
}

@Composable
fun GeruestMeisterApp(viewModel: MainViewModel) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val selectedProject by viewModel.selectedProject.collectAsState()

    val showBottomBar = currentRoute in listOf(
        Screen.Dashboard.route,
        Screen.Projects.route,
        Screen.Calculator.route,
        Screen.Assignments.route
    )

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 6.dp,
                    modifier = Modifier.testTag("bottom_navigation_bar")
                ) {
                    Screen.bottomNavItems.forEach { screen ->
                        val isSelected = currentRoute == screen.route
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                Icon(
                                    if (isSelected) screen.selectedIcon else screen.unselectedIcon,
                                    contentDescription = screen.title
                                )
                            },
                            label = {
                                Text(
                                    text = screen.title,
                                    fontSize = 11.sp
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = OrangePrimary,
                                selectedTextColor = OrangePrimary,
                                indicatorColor = Color(0xFFFFEDD5),
                                unselectedIconColor = SlateTextSecondary,
                                unselectedTextColor = SlateTextSecondary
                            ),
                            modifier = Modifier.testTag("nav_${screen.route}")
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    viewModel = viewModel,
                    onNavigateToProjects = { navController.navigate(Screen.Projects.route) },
                    onNavigateToCalculator = { navController.navigate(Screen.Calculator.route) },
                    onNavigateToAssignments = { navController.navigate(Screen.Assignments.route) },
                    onNavigateToFreigaben = { navController.navigate(Screen.Freigaben.route) },
                    onNavigateToMaterials = { navController.navigate(Screen.Materials.route) },
                    onSelectProject = { project ->
                        viewModel.selectProject(project)
                        navController.navigate("project_detail")
                    }
                )
            }

            composable(Screen.Projects.route) {
                ProjectsScreen(
                    viewModel = viewModel,
                    onSelectProject = { project ->
                        viewModel.selectProject(project)
                        navController.navigate("project_detail")
                    }
                )
            }

            composable("project_detail") {
                selectedProject?.let { project ->
                    ProjectDetailScreen(
                        project = project,
                        viewModel = viewModel,
                        onBack = { navController.popBackStack() },
                        onNavigateToFreigaben = { navController.navigate(Screen.Freigaben.route) }
                    )
                } ?: run {
                    navController.popBackStack()
                }
            }

            composable(Screen.Calculator.route) {
                CalculatorScreen(viewModel = viewModel)
            }

            composable(Screen.Assignments.route) {
                AssignmentsScreen(viewModel = viewModel)
            }

            composable(Screen.Freigaben.route) {
                FreigabenScreen(viewModel = viewModel)
            }

            composable(Screen.Materials.route) {
                MaterialsScreen(viewModel = viewModel)
            }
        }
    }
}
