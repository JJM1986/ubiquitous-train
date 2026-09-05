package com.example.geruestmeister.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.geruestmeister.data.model.ProjectEntity
import com.example.geruestmeister.theme.*
import com.example.geruestmeister.ui.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DashboardScreen(
    viewModel: MainViewModel,
    onNavigateToProjects: () -> Unit,
    onNavigateToCalculator: () -> Unit,
    onNavigateToAssignments: () -> Unit,
    onNavigateToFreigaben: () -> Unit,
    onNavigateToMaterials: () -> Unit,
    onSelectProject: (ProjectEntity) -> Unit
) {
    val projects by viewModel.projects.collectAsState()
    val freigaben by viewModel.freigaben.collectAsState()
    val materials by viewModel.materials.collectAsState()
    val assignments by viewModel.assignments.collectAsState()

    val activeProjects = projects.filter { it.status == "In Arbeit" || it.baustelleStatus == "läuft" }
    val lowStockCount = materials.count { it.stock <= it.minStock }
    val todayDateStr = SimpleDateFormat("yyyy-MM-dd", Locale.GERMANY).format(Date())
    val todayAssignments = assignments.filter { it.date == todayDateStr || it.status == "Geplant" }.take(3)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("dashboard_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header Banner
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateDark),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(OrangePrimary, RoundedCornerShape(10.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Filled.Construction,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(22.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "GerüstMeister",
                                    color = Color.White,
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Betriebsleitung & Baustellen-Zentrale",
                                color = Color(0xFF94A3B8),
                                fontSize = 13.sp
                            )
                        }
                        Surface(
                            color = Color(0xFF1E293B),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = SimpleDateFormat("dd.MM.yyyy", Locale.GERMANY).format(Date()),
                                color = OrangePrimary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Safety Warning Card
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF334155), RoundedCornerShape(12.dp))
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Filled.Warning,
                            contentDescription = "Sicherheit",
                            tint = Color(0xFFFBBF24),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Sicherheits-Check (TRBS 2121)",
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Windböen < 35 km/h heute: Alle Gerüstarbeiten freigegeben. PSAgA-Pflicht beachten!",
                                color = Color(0xFFCBD5E1),
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }
        }

        // Key Metric Grid
        item {
            Text(
                text = "Kennzahlen Übersicht",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard(
                    title = "Aktive Baustellen",
                    value = activeProjects.size.toString(),
                    icon = Icons.Filled.Apartment,
                    iconBg = StatusBlueBg,
                    iconTint = StatusBlue,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToProjects
                )
                MetricCard(
                    title = "Freigaben",
                    value = freigaben.size.toString(),
                    icon = Icons.Filled.VerifiedUser,
                    iconBg = StatusGreenBg,
                    iconTint = StatusGreen,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToFreigaben
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard(
                    title = "Lager Artikel",
                    value = materials.size.toString(),
                    subtitle = if (lowStockCount > 0) "$lowStockCount knapp" else "Bestand OK",
                    subtitleColor = if (lowStockCount > 0) StatusRed else StatusGreen,
                    icon = Icons.Filled.Inventory2,
                    iconBg = if (lowStockCount > 0) StatusRedBg else Color(0xFFF1F5F9),
                    iconTint = if (lowStockCount > 0) StatusRed else SlateDark,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToMaterials
                )
                MetricCard(
                    title = "Einsätze",
                    value = assignments.size.toString(),
                    subtitle = "Teams geplant",
                    icon = Icons.Filled.Engineering,
                    iconBg = OrangeLight,
                    iconTint = OrangePrimary,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToAssignments
                )
            }
        }

        // Quick Actions
        item {
            Text(
                text = "Schnellzugriff",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                QuickActionChip(
                    title = "Kalkulator",
                    icon = Icons.Filled.Calculate,
                    onClick = onNavigateToCalculator,
                    modifier = Modifier.weight(1f)
                )
                QuickActionChip(
                    title = "Prüfprotokoll",
                    icon = Icons.Filled.CheckCircle,
                    onClick = onNavigateToFreigaben,
                    modifier = Modifier.weight(1f)
                )
                QuickActionChip(
                    title = "Lager",
                    icon = Icons.Filled.Warehouse,
                    onClick = onNavigateToMaterials,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Active Projects
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Laufende Baustellen (${activeProjects.size})",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                TextButton(onClick = onNavigateToProjects) {
                    Text("Alle anzeigen", color = OrangePrimary)
                }
            }
        }

        if (activeProjects.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Box(modifier = Modifier.padding(24.dp).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Text("Aktuell keine aktiven Baustellen", color = SlateTextSecondary)
                    }
                }
            }
        } else {
            items(activeProjects.take(3)) { project ->
                ProjectCardItem(
                    project = project,
                    onClick = {
                        onSelectProject(project)
                    }
                )
            }
        }

        // Today's Crew Schedule
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Geplante Einsätze",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                TextButton(onClick = onNavigateToAssignments) {
                    Text("Zum Planer", color = OrangePrimary)
                }
            }
        }

        items(todayAssignments) { assignment ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(OrangeLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Filled.Person,
                            contentDescription = null,
                            tint = OrangePrimary,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = assignment.employeeName,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "${assignment.projectTitle} • ${assignment.taskDescription}",
                            color = SlateTextSecondary,
                            fontSize = 12.sp,
                            maxLines = 1
                        )
                    }
                    Surface(
                        color = if (assignment.status == "Erledigt") StatusGreenBg else Color(0xFFF1F5F9),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = assignment.status,
                            color = if (assignment.status == "Erledigt") StatusGreen else SlateTextPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    iconBg: Color,
    iconTint: Color,
    subtitle: String? = null,
    subtitleColor: Color = SlateTextSecondary,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .clickable(onClick = onClick)
            .testTag("metric_${title.lowercase().replace(" ", "_")}"),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Text(text = title, fontSize = 12.sp, color = SlateTextSecondary)
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(iconBg, RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(18.dp))
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            if (subtitle != null) {
                Text(text = subtitle, fontSize = 11.sp, color = subtitleColor, fontWeight = FontWeight.Medium)
            }
        }
    }
}

@Composable
fun QuickActionChip(
    title: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .clickable(onClick = onClick)
            .height(52.dp),
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        border = CardDefaults.outlinedCardBorder()
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(icon, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text(text = title, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun ProjectCardItem(
    project: ProjectEntity,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .testTag("project_item_${project.id}"),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = project.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f)
                )
                Surface(
                    color = if (project.status == "In Arbeit") OrangeLight else StatusGreenBg,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = project.status,
                        color = if (project.status == "In Arbeit") OrangeDark else StatusGreen,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.LocationOn, contentDescription = null, tint = SlateTextSecondary, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "${project.address}, ${project.city}",
                    color = SlateTextSecondary,
                    fontSize = 12.sp
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${project.scaffoldArea.toInt()} m² • ${project.scaffoldHeight}m Höhe • ${project.scaffoldType}",
                    fontSize = 12.sp,
                    color = OrangeDark,
                    fontWeight = FontWeight.Medium
                )
                Icon(
                    Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Details",
                    tint = SlateTextSecondary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
