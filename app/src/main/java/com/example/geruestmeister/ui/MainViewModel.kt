package com.example.geruestmeister.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.geruestmeister.calculator.*
import com.example.geruestmeister.data.local.GeruestMeisterDatabase
import com.example.geruestmeister.data.model.*
import com.example.geruestmeister.data.repository.GeruestRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: GeruestRepository

    val projects: StateFlow<List<ProjectEntity>>
    val freigaben: StateFlow<List<GeruestfreigabeEntity>>
    val materials: StateFlow<List<MaterialEntity>>
    val calculations: StateFlow<List<CalculationResultEntity>>
    val assignments: StateFlow<List<AssignmentEntity>>
    val employees: StateFlow<List<EmployeeEntity>>

    val selectedProject = MutableStateFlow<ProjectEntity?>(null)

    // Calculator state
    val scaffoldType = MutableStateFlow(ScaffoldType.FASSADENGERUEST)
    val systemId = MutableStateFlow("layher_blitz")
    val calcLength = MutableStateFlow(15.0)
    val calcHeight = MutableStateFlow(8.0)
    val calcPlatforms = MutableStateFlow(2)
    val calcBayLength = MutableStateFlow(3.0)
    val calcRuns = MutableStateFlow(2)
    val calcArea = MutableStateFlow(120.0)

    val calculationResult: StateFlow<CalculationResult>

    init {
        val db = GeruestMeisterDatabase.getDatabase(application, viewModelScope)
        repository = GeruestRepository(db)

        projects = repository.allProjects.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
        freigaben = repository.allFreigaben.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
        materials = repository.allMaterials.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
        calculations = repository.allCalculations.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
        assignments = repository.allAssignments.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
        employees = repository.allEmployees.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )

        calculationResult = combine(
            scaffoldType,
            systemId,
            calcLength,
            calcHeight,
            calcPlatforms,
            calcBayLength,
            calcRuns,
            calcArea
        ) { type, sys, len, h, plat, bay, runs, area ->
            when (type) {
                ScaffoldType.FASSADENGERUEST ->
                    ScaffoldCalculator.calculateFassadengeruest(len, h, plat, bay, sys)
                ScaffoldType.GERUESTTREPPE ->
                    ScaffoldCalculator.calculateGeruesttreppe(h, runs, bay, sys)
                ScaffoldType.BAUTREPPENTURM ->
                    ScaffoldCalculator.calculateTreppenturm(h, isAlu = false, sys)
                ScaffoldType.ALUTREPPENTURM ->
                    ScaffoldCalculator.calculateTreppenturm(h, isAlu = true, sys)
                ScaffoldType.GERUESTSCHUTZ ->
                    ScaffoldCalculator.calculateGeruestschutz(len, h, sys)
                ScaffoldType.SUPER_RS ->
                    ScaffoldCalculator.calculateSuperRS(area, h, sys)
            }
        }.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            ScaffoldCalculator.calculateFassadengeruest(15.0, 8.0, 2, 3.0, "layher_blitz")
        )
    }

    fun selectProject(project: ProjectEntity?) {
        selectedProject.value = project
    }

    fun addProject(
        title: String,
        customerName: String,
        address: String,
        city: String,
        scaffoldType: String,
        area: Double,
        height: Double,
        description: String
    ) {
        viewModelScope.launch {
            val dateStr = SimpleDateFormat("yyyy-MM-dd", Locale.GERMANY).format(Date())
            val newProject = ProjectEntity(
                title = title,
                customerName = customerName,
                address = address,
                city = city,
                status = "In Arbeit",
                baustelleStatus = "läuft",
                startDate = dateStr,
                endDate = "2026-12-31",
                assemblyDate = dateStr,
                disassemblyDate = "2026-12-20",
                scaffoldType = scaffoldType,
                scaffoldArea = area,
                scaffoldHeight = height,
                description = description,
                notes = "Neu angelegt über GerüstMeister App"
            )
            repository.insertProject(newProject)
        }
    }

    fun updateProjectStatus(project: ProjectEntity, newStatus: String, newBaustelleStatus: String) {
        viewModelScope.launch {
            repository.updateProject(project.copy(status = newStatus, baustelleStatus = newBaustelleStatus))
            if (selectedProject.value?.id == project.id) {
                selectedProject.value = project.copy(status = newStatus, baustelleStatus = newBaustelleStatus)
            }
        }
    }

    fun deleteProject(project: ProjectEntity) {
        viewModelScope.launch {
            repository.deleteProject(project)
            if (selectedProject.value?.id == project.id) {
                selectedProject.value = null
            }
        }
    }

    fun addFreigabe(
        projectName: String,
        siteAddress: String,
        customerName: String,
        scaffoldType: String,
        height: Double,
        area: Double,
        scaffoldClass: String,
        inspectorName: String,
        result: String,
        conditions: String
    ) {
        viewModelScope.launch {
            val today = SimpleDateFormat("yyyy-MM-dd", Locale.GERMANY).format(Date())
            val entity = GeruestfreigabeEntity(
                projectName = projectName,
                siteAddress = siteAddress,
                customerName = customerName,
                scaffoldType = scaffoldType,
                scaffoldHeight = height,
                scaffoldArea = area,
                scaffoldClass = scaffoldClass,
                inspectionType = "Erstprüfung nach Aufbau (TRBS 2121)",
                inspectorName = inspectorName,
                inspectionDate = today,
                result = result,
                status = if (result == "Nicht freigegeben") "Abgelehnt" else "Freigegeben",
                conditions = conditions,
                notes = "Freigabe gemäß DIN EN 12811 & TRBS 2121 vor Ort geprüft."
            )
            repository.insertFreigabe(entity)
        }
    }

    fun deleteFreigabe(freigabe: GeruestfreigabeEntity) {
        viewModelScope.launch {
            repository.deleteFreigabe(freigabe)
        }
    }

    fun adjustMaterialStock(materialId: Long, delta: Int) {
        viewModelScope.launch {
            repository.updateStock(materialId, delta)
        }
    }

    fun saveCurrentCalculation(customTitle: String? = null) {
        viewModelScope.launch {
            val result = calculationResult.value
            val today = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.GERMANY).format(Date())
            val title = if (!customTitle.isNullOrBlank()) customTitle else "${result.scaffoldType.label} - ${result.summaryParams}"
            val materialsSummary = result.parts.joinToString("; ") { "${it.quantity}x ${it.name} (${it.unit})" }

            val entity = CalculationResultEntity(
                scaffoldType = result.scaffoldType.label,
                title = title,
                parametersSummary = result.summaryParams,
                materialsJson = materialsSummary,
                totalItems = result.totalPieces,
                totalWeightKg = result.totalWeightKg,
                createdDate = today
            )
            repository.saveCalculation(entity)
        }
    }

    fun addAssignment(
        projectTitle: String,
        employeeName: String,
        date: String,
        taskDescription: String
    ) {
        viewModelScope.launch {
            val assignment = AssignmentEntity(
                projectTitle = projectTitle,
                employeeName = employeeName,
                date = date,
                taskDescription = taskDescription,
                status = "Geplant"
            )
            repository.insertAssignment(assignment)
        }
    }

    fun updateAssignmentStatus(assignment: AssignmentEntity, newStatus: String) {
        viewModelScope.launch {
            repository.updateAssignment(assignment.copy(status = newStatus))
        }
    }
}
