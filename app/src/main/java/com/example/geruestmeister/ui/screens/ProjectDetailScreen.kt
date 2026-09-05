package com.example.geruestmeister.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.geruestmeister.data.model.ProjectEntity
import com.example.geruestmeister.theme.*
import com.example.geruestmeister.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectDetailScreen(
    project: ProjectEntity,
    viewModel: MainViewModel,
    onBack: () -> Unit,
    onNavigateToFreigaben: () -> Unit
) {
    var showDeleteConfirm by remember { mutableStateOf(false) }
    var currentStatus by remember { mutableStateOf(project.status) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Baustellendetails", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
                navigationIcon = {
                    IconButton(onClick = onBack, modifier = Modifier.testTag("detail_back_button")) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Zurück")
                    }
                },
                actions = {
                    IconButton(onClick = { showDeleteConfirm = true }) {
                        Icon(Icons.Filled.Delete, contentDescription = "Löschen", tint = StatusRed)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SlateDark),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = project.title,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.weight(1f)
                        )
                        Surface(
                            color = if (currentStatus == "In Arbeit") OrangePrimary else StatusGreen,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = currentStatus,
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.Business, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Kunde: ${project.customerName}", color = Color(0xFFE2E8F0), fontSize = 13.sp)
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.LocationOn, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "${project.address}, ${project.city}", color = Color(0xFFE2E8F0), fontSize = 13.sp)
                    }
                }
            }

            // Specs Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Gerüst-Spezifikation", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(modifier = Modifier.fillMaxWidth()) {
                        SpecItem("Gerüstfläche", "${project.scaffoldArea.toInt()} m²", modifier = Modifier.weight(1f))
                        SpecItem("Gerüsthöhe", "${project.scaffoldHeight} m", modifier = Modifier.weight(1f))
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(modifier = Modifier.fillMaxWidth()) {
                        SpecItem("System", project.scaffoldType, modifier = Modifier.weight(1f))
                        SpecItem("Zuständige Kolonne", project.kolonneName, modifier = Modifier.weight(1f))
                    }
                }
            }

            // Status Actions Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Baustellen-Status anpassen", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                currentStatus = "In Arbeit"
                                viewModel.updateProjectStatus(project, "In Arbeit", "läuft")
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (currentStatus == "In Arbeit") OrangeLight else Color.Transparent
                            )
                        ) {
                            Text("In Arbeit", fontSize = 12.sp, color = if (currentStatus == "In Arbeit") OrangeDark else SlateTextPrimary)
                        }

                        Button(
                            onClick = {
                                currentStatus = "Abgeschlossen"
                                viewModel.updateProjectStatus(project, "Abgeschlossen", "fertig")
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (currentStatus == "Abgeschlossen") StatusGreen else Color(0xFFE2E8F0)
                            )
                        ) {
                            Text("Abschließen", fontSize = 12.sp, color = if (currentStatus == "Abgeschlossen") Color.White else SlateTextPrimary)
                        }
                    }
                }
            }

            // Description & Notes
            if (project.description.isNotBlank() || project.notes.isNotBlank()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "Hinweise & Auflagen", style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.height(8.dp))
                        if (project.description.isNotBlank()) {
                            Text(text = project.description, fontSize = 13.sp, color = SlateTextPrimary)
                            Spacer(modifier = Modifier.height(6.dp))
                        }
                        if (project.notes.isNotBlank()) {
                            Text(text = "Notiz: ${project.notes}", fontSize = 12.sp, color = SlateTextSecondary)
                        }
                    }
                }
            }

            // Action: Freigabeprotokoll
            Button(
                onClick = onNavigateToFreigaben,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("open_freigabe_from_project_button"),
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Filled.VerifiedUser, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Gerüst-Freigabeprotokoll (TRBS 2121)", fontWeight = FontWeight.Bold)
            }
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Baustelle löschen?") },
            text = { Text("Möchten Sie '${project.title}' wirklich aus dem System entfernen?") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteProject(project)
                        showDeleteConfirm = false
                        onBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StatusRed)
                ) {
                    Text("Löschen")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("Abbrechen")
                }
            }
        )
    }
}

@Composable
fun SpecItem(label: String, value: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Text(text = label, fontSize = 11.sp, color = SlateTextSecondary)
        Spacer(modifier = Modifier.height(2.dp))
        Text(text = value, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
    }
}
