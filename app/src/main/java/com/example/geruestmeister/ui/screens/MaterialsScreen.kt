package com.example.geruestmeister.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import com.example.geruestmeister.data.model.MaterialEntity
import com.example.geruestmeister.theme.*
import com.example.geruestmeister.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaterialsScreen(
    viewModel: MainViewModel
) {
    val materials by viewModel.materials.collectAsState()
    var selectedCategory by remember { mutableStateOf("Alle") }
    var searchQuery by remember { mutableStateOf("") }

    val categories = listOf("Alle", "Gerüstrahmen", "Beläge", "Verbände", "Gerüstschutz", "Fundament", "Treppen", "Kupplungen")

    val filteredMaterials = materials.filter { item ->
        val matchesCategory = if (selectedCategory == "Alle") true else item.category == selectedCategory
        val matchesSearch = searchQuery.isBlank() ||
                item.name.contains(searchQuery, ignoreCase = true) ||
                item.articleNumber.contains(searchQuery, ignoreCase = true)
        matchesCategory && matchesSearch
    }

    val lowStockTotal = materials.count { it.stock <= it.minStock }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .testTag("materials_screen")
    ) {
        // Search & Category Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Materiallager & Bestand",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                if (lowStockTotal > 0) {
                    Surface(
                        color = StatusRedBg,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "$lowStockTotal knapp",
                            color = StatusRed,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Material, Art.-Nr. suchen...") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null, tint = SlateTextSecondary) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(10.dp))

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(categories) { cat ->
                    FilterChip(
                        selected = selectedCategory == cat,
                        onClick = { selectedCategory = cat },
                        label = { Text(cat, fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = OrangePrimary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }

        // Material List
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredMaterials) { material ->
                MaterialRowItem(
                    material = material,
                    onIncrease = { viewModel.adjustMaterialStock(material.id, 10) },
                    onDecrease = { viewModel.adjustMaterialStock(material.id, -10) }
                )
            }
        }
    }
}

@Composable
fun MaterialRowItem(
    material: MaterialEntity,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit
) {
    val isLow = material.stock <= material.minStock

    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("material_item_${material.id}")
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = material.name,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Art.-Nr.: ${material.articleNumber} • ${material.weightKg} kg/Stk • Min: ${material.minStock}",
                    color = SlateTextSecondary,
                    fontSize = 11.sp
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                Surface(
                    color = if (isLow) StatusRedBg else Color(0xFFF1F5F9),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "${material.stock} ${material.unit}",
                        color = if (isLow) StatusRed else SlateTextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    FilledTonalIconButton(
                        onClick = onDecrease,
                        modifier = Modifier.size(30.dp),
                        shape = CircleShape
                    ) {
                        Icon(Icons.Filled.Remove, contentDescription = "-10", modifier = Modifier.size(16.dp))
                    }
                    FilledTonalIconButton(
                        onClick = onIncrease,
                        modifier = Modifier.size(30.dp),
                        shape = CircleShape
                    ) {
                        Icon(Icons.Filled.Add, contentDescription = "+10", modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}
