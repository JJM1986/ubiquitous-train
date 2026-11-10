package com.example.geruestmeister.ui.screens

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.geruestmeister.calculator.ScaffoldType
import com.example.geruestmeister.calculator.ScaffoldingSystems
import com.example.geruestmeister.theme.*
import com.example.geruestmeister.ui.MainViewModel

@Composable
fun CalculatorScreen(
    viewModel: MainViewModel
) {
    val currentType by viewModel.scaffoldType.collectAsState()
    val currentSystem by viewModel.systemId.collectAsState()
    val length by viewModel.calcLength.collectAsState()
    val height by viewModel.calcHeight.collectAsState()
    val platforms by viewModel.calcPlatforms.collectAsState()
    val area by viewModel.calcArea.collectAsState()
    val runs by viewModel.calcRuns.collectAsState()

    val result by viewModel.calculationResult.collectAsState()
    val savedCalculations by viewModel.calculations.collectAsState()

    var showSavedHistory by remember { mutableStateOf(false) }
    var saveSuccessMessage by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("calculator_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Gerüstrechner",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = "Fassaden- & Raumgerüst Materialkalkulation",
                        fontSize = 13.sp,
                        color = SlateTextSecondary
                    )
                }
                IconButton(
                    onClick = { showSavedHistory = !showSavedHistory },
                    modifier = Modifier.testTag("toggle_history_button")
                ) {
                    Icon(
                        if (showSavedHistory) Icons.Filled.Close else Icons.Filled.History,
                        contentDescription = "Berechnungshistorie",
                        tint = OrangePrimary
                    )
                }
            }
        }

        // Saved History Toggle
        if (showSavedHistory) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = SlateDark),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Gespeicherte Berechnungen (${savedCalculations.size})",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        if (savedCalculations.isEmpty()) {
                            Text("Noch keine Berechnungen gespeichert.", color = Color(0xFF94A3B8), fontSize = 12.sp)
                        } else {
                            savedCalculations.take(4).forEach { calc ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 6.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(text = calc.title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                        Text(text = "${calc.totalItems} Teile • ${"%.1f".format(calc.totalWeightKg)} kg • ${calc.createdDate}", color = OrangePrimary, fontSize = 11.sp)
                                    }
                                }
                                HorizontalDivider(color = Color(0xFF334155), thickness = 0.5.dp)
                            }
                        }
                    }
                }
            }
        }

        // Scaffold Type Selector
        item {
            Text(text = "Gerüstart wählen", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(ScaffoldType.values()) { type ->
                    val isSelected = currentType == type
                    Surface(
                        modifier = Modifier
                            .clickable { viewModel.scaffoldType.value = type }
                            .testTag("type_${type.id}"),
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) OrangePrimary else MaterialTheme.colorScheme.surface,
                        border = if (isSelected) null else CardDefaults.outlinedCardBorder()
                    ) {
                        Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                            Text(
                                text = type.label,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                            Text(
                                text = type.desc,
                                color = if (isSelected) Color(0xFFFFEDD5) else SlateTextSecondary,
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }
        }

        // Manufacturer System Selector
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Herstellersystem", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(ScaffoldingSystems.SYSTEMS) { sys ->
                            val isSel = currentSystem == sys.id
                            FilterChip(
                                selected = isSel,
                                onClick = { viewModel.systemId.value = sys.id },
                                label = { Text(sys.label, fontSize = 12.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = SlateDark,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }
                }
            }
        }

        // Dynamic Parameter Inputs Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text(text = "Maße & Parameter eingeben", style = MaterialTheme.typography.titleMedium)

                    when (currentType) {
                        ScaffoldType.FASSADENGERUEST -> {
                            SliderInput(
                                label = "Fassadenlänge (L)",
                                value = length,
                                unit = "m",
                                valueRange = 3.0..100.0,
                                step = 1.0,
                                onValueChange = { viewModel.calcLength.value = it }
                            )
                            SliderInput(
                                label = "Gerüsthöhe (H)",
                                value = height,
                                unit = "m",
                                valueRange = 2.0..60.0,
                                step = 1.0,
                                onValueChange = { viewModel.calcHeight.value = it }
                            )
                            SliderInput(
                                label = "Belagebenen (Plattformen)",
                                value = platforms.toDouble(),
                                unit = "Lagen",
                                valueRange = 1.0..15.0,
                                step = 1.0,
                                onValueChange = { viewModel.calcPlatforms.value = it.toInt() }
                            )
                        }
                        ScaffoldType.GERUESTTREPPE -> {
                            SliderInput(
                                label = "Gerüsthöhe",
                                value = height,
                                unit = "m",
                                valueRange = 2.0..30.0,
                                step = 1.0,
                                onValueChange = { viewModel.calcHeight.value = it }
                            )
                            SliderInput(
                                label = "Treppenläufe",
                                value = runs.toDouble(),
                                unit = "Stk",
                                valueRange = 1.0..10.0,
                                step = 1.0,
                                onValueChange = { viewModel.calcRuns.value = it.toInt() }
                            )
                        }
                        ScaffoldType.BAUTREPPENTURM, ScaffoldType.ALUTREPPENTURM -> {
                            SliderInput(
                                label = "Turmhöhe",
                                value = height,
                                unit = "m",
                                valueRange = 2.0..30.0,
                                step = 1.0,
                                onValueChange = { viewModel.calcHeight.value = it }
                            )
                        }
                        ScaffoldType.GERUESTSCHUTZ -> {
                            SliderInput(
                                label = "Schutznetz-Länge",
                                value = length,
                                unit = "m",
                                valueRange = 5.0..100.0,
                                step = 1.0,
                                onValueChange = { viewModel.calcLength.value = it }
                            )
                            SliderInput(
                                label = "Schutznetz-Höhe",
                                value = height,
                                unit = "m",
                                valueRange = 2.0..50.0,
                                step = 1.0,
                                onValueChange = { viewModel.calcHeight.value = it }
                            )
                        }
                        ScaffoldType.SUPER_RS -> {
                            SliderInput(
                                label = "Gerüstfläche",
                                value = area,
                                unit = "m²",
                                valueRange = 20.0..1000.0,
                                step = 10.0,
                                onValueChange = { viewModel.calcArea.value = it }
                            )
                            SliderInput(
                                label = "Gerüsthöhe",
                                value = height,
                                unit = "m",
                                valueRange = 2.0..40.0,
                                step = 1.0,
                                onValueChange = { viewModel.calcHeight.value = it }
                            )
                        }
                    }
                }
            }
        }

        // Summary Hero Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateDark),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Berechnungsergebnis",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("Fläche", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text("${"%.0f".format(result.areaM2)} m²", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                        Column {
                            Text("Gesamtteile", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text("${result.totalPieces} Stk", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                        Column {
                            Text("Gesamtgewicht", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text(
                                if (result.totalWeightKg >= 1000) "${"%.2f".format(result.totalWeightKg / 1000.0)} t"
                                else "${"%.0f".format(result.totalWeightKg)} kg",
                                color = OrangePrimary,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            viewModel.saveCurrentCalculation()
                            saveSuccessMessage = "Berechnung erfolgreich gespeichert!"
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("save_calculation_button"),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Filled.Save, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Berechnung speichern", fontWeight = FontWeight.Bold)
                    }

                    if (saveSuccessMessage != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = saveSuccessMessage ?: "",
                            color = StatusGreen,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }

        // Material Parts List
        item {
            Text(
                text = "Material-Stückliste (${result.parts.size} Bauteil-Positionen)",
                style = MaterialTheme.typography.titleMedium
            )
        }

        items(result.parts) { part ->
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = part.name,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "Maß: ${part.dimension} • ${"%.1f".format(part.singleWeightKg)} kg / ${part.unit}",
                            color = SlateTextSecondary,
                            fontSize = 12.sp
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Surface(
                            color = OrangeLight,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "${part.quantity} ${part.unit}",
                                color = OrangeDark,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "${"%.1f".format(part.totalWeightKg)} kg",
                            fontSize = 11.sp,
                            color = SlateTextSecondary
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SliderInput(
    label: String,
    value: Double,
    unit: String,
    valueRange: ClosedFloatingPointRange<Double>,
    step: Double,
    onValueChange: (Double) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = label, fontSize = 13.sp, color = SlateTextPrimary)
            Text(
                text = "${"%.1f".format(value).removeSuffix(".0")} $unit",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = OrangePrimary
            )
        }
        Slider(
            value = value.toFloat(),
            onValueChange = { onValueChange(it.toDouble()) },
            valueRange = valueRange.start.toFloat()..valueRange.endInclusive.toFloat(),
            colors = SliderDefaults.colors(
                thumbColor = OrangePrimary,
                activeTrackColor = OrangePrimary,
                inactiveTrackColor = SlateLightBorder
            )
        )
    }
}
