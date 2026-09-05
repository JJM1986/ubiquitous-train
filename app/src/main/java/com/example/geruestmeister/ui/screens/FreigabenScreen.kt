package com.example.geruestmeister.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
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
import com.example.geruestmeister.data.model.GeruestfreigabeEntity
import com.example.geruestmeister.theme.*
import com.example.geruestmeister.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FreigabenScreen(
    viewModel: MainViewModel
) {
    val freigaben by viewModel.freigaben.collectAsState()
    val projects by viewModel.projects.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }
    var selectedFreigabe by remember { mutableStateOf<GeruestfreigabeEntity?>(null) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = OrangePrimary,
                contentColor = Color.White,
                modifier = Modifier.testTag("add_freigabe_fab")
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Neues Freigabeprotokoll")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .testTag("freigaben_screen")
        ) {
            // Header Info Card
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
                            .background(StatusGreenBg, RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Filled.VerifiedUser,
                            contentDescription = null,
                            tint = StatusGreen,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "Gerüstfreigaben & Prüfungen",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        Text(
                            text = "Rechtssichere Protokolle nach DIN EN 12811 & TRBS 2121",
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp
                        )
                    }
                }
            }

            // List of Freigaben
            if (freigaben.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Filled.VerifiedUser,
                            contentDescription = null,
                            tint = SlateTextSecondary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Keine Freigabeprotokolle vorhanden",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        Text(
                            text = "Tippen Sie auf +, um eine neue Prüfung durchzuführen.",
                            color = SlateTextSecondary,
                            fontSize = 13.sp
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(freigaben) { item ->
                        FreigabeCardItem(
                            freigabe = item,
                            onClick = { selectedFreigabe = item },
                            onDelete = { viewModel.deleteFreigabe(item) }
                        )
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddFreigabeDialog(
            projects = projects.map { it.title },
            onDismiss = { showAddDialog = false },
            onConfirm = { proj, addr, cust, type, h, a, cls, insp, res, cond ->
                viewModel.addFreigabe(proj, addr, cust, type, h, a, cls, insp, res, cond)
                showAddDialog = false
            }
        )
    }

    selectedFreigabe?.let { item ->
        FreigabeDetailDialog(
            freigabe = item,
            onDismiss = { selectedFreigabe = null }
        )
    }
}

@Composable
fun FreigabeCardItem(
    freigabe: GeruestfreigabeEntity,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    val resultColor = when (freigabe.result) {
        "Freigegeben" -> StatusGreen
        "Freigegeben mit Auflagen" -> StatusYellow
        else -> StatusRed
    }
    val resultBg = when (freigabe.result) {
        "Freigegeben" -> StatusGreenBg
        "Freigegeben mit Auflagen" -> StatusYellowBg
        else -> StatusRedBg
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .testTag("freigabe_item_${freigabe.id}"),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = freigabe.projectName,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    modifier = Modifier.weight(1f)
                )
                Surface(
                    color = resultBg,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = freigabe.result,
                        color = resultColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "${freigabe.scaffoldType} • ${freigabe.scaffoldArea.toInt()} m² • ${freigabe.scaffoldClass}",
                color = SlateTextPrimary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Prüfer: ${freigabe.inspectorName} (${freigabe.inspectionDate})",
                    color = SlateTextSecondary,
                    fontSize = 12.sp
                )
                IconButton(onClick = onDelete, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Filled.DeleteOutline, contentDescription = "Löschen", tint = StatusRed, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

@Composable
fun AddFreigabeDialog(
    projects: List<String>,
    onDismiss: () -> Unit,
    onConfirm: (String, String, String, String, Double, Double, String, String, String, String) -> Unit
) {
    var projectName by remember { mutableStateOf(projects.firstOrNull() ?: "Neubau Baustelle") }
    var siteAddress by remember { mutableStateOf("Hauptstraße 12") }
    var customerName by remember { mutableStateOf("Bauherr Schmidt") }
    var scaffoldType by remember { mutableStateOf("Fassadengerüst") }
    var heightStr by remember { mutableStateOf("12") }
    var areaStr by remember { mutableStateOf("450") }
    var scaffoldClass by remember { mutableStateOf("Lastklasse 3 (2,0 kN/m²)") }
    var inspectorName by remember { mutableStateOf("Markus Weber (Gerüstbaumeister)") }
    var result by remember { mutableStateOf("Freigegeben") }
    var conditions by remember { mutableStateOf("Keine Auflagen") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Neues Freigabeprotokoll", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = projectName,
                    onValueChange = { projectName = it },
                    label = { Text("Baustelle / Projekt *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                OutlinedTextField(
                    value = inspectorName,
                    onValueChange = { inspectorName = it },
                    label = { Text("Prüfer / Befähigte Person *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = heightStr,
                        onValueChange = { heightStr = it },
                        label = { Text("Höhe (m)") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = areaStr,
                        onValueChange = { areaStr = it },
                        label = { Text("Fläche (m²)") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }
                OutlinedTextField(
                    value = scaffoldClass,
                    onValueChange = { scaffoldClass = it },
                    label = { Text("Lastklasse") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                OutlinedTextField(
                    value = conditions,
                    onValueChange = { conditions = it },
                    label = { Text("Auflagen / Prüfhinweise") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (projectName.isNotBlank() && inspectorName.isNotBlank()) {
                        val h = heightStr.toDoubleOrNull() ?: 10.0
                        val a = areaStr.toDoubleOrNull() ?: 200.0
                        onConfirm(projectName, siteAddress, customerName, scaffoldType, h, a, scaffoldClass, inspectorName, result, conditions)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
            ) {
                Text("Protokoll erstellen")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Abbrechen") }
        }
    )
}

@Composable
fun FreigabeDetailDialog(
    freigabe: GeruestfreigabeEntity,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Freigabeprotokoll Details", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Baustelle: ${freigabe.projectName}", fontWeight = FontWeight.SemiBold)
                Text("Prüfart: ${freigabe.inspectionType}")
                Text("Prüfer: ${freigabe.inspectorName}")
                Text("Datum: ${freigabe.inspectionDate}")
                Text("Lastklasse: ${freigabe.scaffoldClass}")
                Text("Ergebnis: ${freigabe.result}", color = if (freigabe.result == "Freigegeben") StatusGreen else StatusYellow, fontWeight = FontWeight.Bold)
                if (freigabe.conditions.isNotBlank()) {
                    Text("Auflagen: ${freigabe.conditions}")
                }
                HorizontalDivider()
                Text("Rechtlicher Hinweis: Entspricht den Anforderungen der Betriebssicherheitsverordnung (BetrSichV) und TRBS 2121 Teil 1.", fontSize = 11.sp, color = SlateTextSecondary)
            }
        },
        confirmButton = {
            Button(onClick = onDismiss, colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)) {
                Text("Schließen")
            }
        }
    )
}
