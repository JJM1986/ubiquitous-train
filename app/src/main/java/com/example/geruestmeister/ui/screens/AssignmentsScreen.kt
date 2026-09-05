package com.example.geruestmeister.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.geruestmeister.data.model.AssignmentEntity
import com.example.geruestmeister.theme.*
import com.example.geruestmeister.ui.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AssignmentsScreen(
    viewModel: MainViewModel
) {
    val assignments by viewModel.assignments.collectAsState()
    val employees by viewModel.employees.collectAsState()
    val projects by viewModel.projects.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = OrangePrimary,
                contentColor = Color.White,
                modifier = Modifier.testTag("add_assignment_fab")
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Neuer Einsatz")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .testTag("assignments_screen")
        ) {
            // Header
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateDark),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .background(OrangeLight, RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Filled.Engineering,
                            contentDescription = null,
                            tint = OrangePrimary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "Kolonnen- & Einsatzplaner",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        Text(
                            text = "${employees.size} Monteure im Team • ${assignments.count { it.status == "Geplant" }} Einsätze anstehend",
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Assignment List
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(assignments) { assignment ->
                    AssignmentCardItem(
                        assignment = assignment,
                        onToggleStatus = {
                            val nextStatus = when (assignment.status) {
                                "Geplant" -> "In Durchführung"
                                "In Durchführung" -> "Erledigt"
                                else -> "Geplant"
                            }
                            viewModel.updateAssignmentStatus(assignment, nextStatus)
                        }
                    )
                }
            }
        }
    }

    if (showAddDialog) {
        AddAssignmentDialog(
            projects = projects.map { it.title },
            employees = employees.map { it.name },
            onDismiss = { showAddDialog = false },
            onConfirm = { proj, emp, date, task ->
                viewModel.addAssignment(proj, emp, date, task)
                showAddDialog = false
            }
        )
    }
}

@Composable
fun AssignmentCardItem(
    assignment: AssignmentEntity,
    onToggleStatus: () -> Unit
) {
    val statusColor = when (assignment.status) {
        "Erledigt" -> StatusGreen
        "In Durchführung" -> OrangeDark
        else -> SlateTextPrimary
    }
    val statusBg = when (assignment.status) {
        "Erledigt" -> StatusGreenBg
        "In Durchführung" -> OrangeLight
        else -> Color(0xFFF1F5F9)
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("assignment_item_${assignment.id}")
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(OrangeLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Filled.Person, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(20.dp))
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(text = assignment.employeeName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(text = assignment.projectTitle, color = SlateTextSecondary, fontSize = 12.sp)
                    }
                }

                Surface(
                    color = statusBg,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.clickable(onClick = onToggleStatus)
                ) {
                    Text(
                        text = assignment.status,
                        color = statusColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = assignment.taskDescription,
                fontSize = 13.sp,
                color = SlateTextPrimary
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Event, contentDescription = null, tint = SlateTextSecondary, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(text = "Datum: ${assignment.date}", fontSize = 11.sp, color = SlateTextSecondary)
            }
        }
    }
}

@Composable
fun AddAssignmentDialog(
    projects: List<String>,
    employees: List<String>,
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, String) -> Unit
) {
    var selectedProject by remember { mutableStateOf(projects.firstOrNull() ?: "Sanierung Rathausfassade") }
    var selectedEmployee by remember { mutableStateOf(employees.firstOrNull() ?: "Stefan Holzer") }
    var taskDescription by remember { mutableStateOf("") }
    val today = SimpleDateFormat("yyyy-MM-dd", Locale.GERMANY).format(Date())

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Neuen Einsatz planen", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = selectedProject,
                    onValueChange = { selectedProject = it },
                    label = { Text("Baustelle") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                OutlinedTextField(
                    value = selectedEmployee,
                    onValueChange = { selectedEmployee = it },
                    label = { Text("Mitarbeiter / Kolonne") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                OutlinedTextField(
                    value = taskDescription,
                    onValueChange = { taskDescription = it },
                    label = { Text("Aufgabe / Tätigkeit *") },
                    placeholder = { Text("z.B. Gerüstmontage Lagen 1-3") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (taskDescription.isNotBlank()) {
                        onConfirm(selectedProject, selectedEmployee, today, taskDescription)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                enabled = taskDescription.isNotBlank()
            ) {
                Text("Einsatz anlegen")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Abbrechen") }
        }
    )
}
