package com.example.geruestmeister.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val customerName: String,
    val address: String,
    val city: String,
    val status: String, // "Anfrage", "Angebot", "Beauftragt", "In Arbeit", "Abgeschlossen", "Storniert"
    val baustelleStatus: String, // "geplant", "läuft", "fertig"
    val startDate: String,
    val endDate: String,
    val assemblyDate: String,
    val disassemblyDate: String,
    val scaffoldType: String,
    val scaffoldArea: Double,
    val scaffoldHeight: Double,
    val description: String,
    val notes: String,
    val kolonneName: String = "Kolonne 1 (Nord)"
)

@Entity(tableName = "geruestfreigaben")
data class GeruestfreigabeEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val projectName: String,
    val siteAddress: String,
    val customerName: String,
    val scaffoldType: String,
    val scaffoldHeight: Double,
    val scaffoldArea: Double,
    val scaffoldClass: String, // "Lastklasse 1" ... "Lastklasse 6"
    val inspectionType: String, // "Erstprüfung", "Wiederholungsprüfung", "Außerordentliche Prüfung"
    val inspectorName: String,
    val inspectionDate: String,
    val result: String, // "Freigegeben", "Freigegeben mit Auflagen", "Nicht freigegeben"
    val status: String, // "Entwurf", "Freigegeben", "Abgelehnt"
    val conditions: String = "",
    val notes: String = "",
    val checkpointsJson: String = "" // Serialized list of checkpoints
)

data class Checkpoint(
    val item: String,
    var passed: Boolean,
    var notes: String = ""
)

@Entity(tableName = "materials")
data class MaterialEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val category: String, // "Gerüstrahmen", "Verbände", "Beläge", "Treppen", "Gerüstschutz", "Fundament"
    val articleNumber: String,
    val unit: String, // "Stk", "m²", "m"
    val stock: Int,
    val minStock: Int,
    val weightKg: Double,
    val manufacturerSystem: String = "Layher Blitz"
)

@Entity(tableName = "calculation_results")
data class CalculationResultEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val scaffoldType: String,
    val title: String,
    val parametersSummary: String,
    val materialsJson: String,
    val totalItems: Int,
    val totalWeightKg: Double,
    val createdDate: String
)

@Entity(tableName = "employees")
data class EmployeeEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val role: String, // "Bauleiter", "Kolonnenführer", "Gerüstmonteur", "Gerüstbauhelfer", "LKW-Fahrer"
    val phone: String,
    val status: String = "aktiv" // "aktiv", "urlaub", "krank"
)

@Entity(tableName = "assignments")
data class AssignmentEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val projectTitle: String,
    val employeeName: String,
    val date: String,
    val taskDescription: String,
    val status: String = "Geplant" // "Geplant", "In Durchführung", "Erledigt"
)
