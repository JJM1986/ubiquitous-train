package com.example.geruestmeister.data.repository

import com.example.geruestmeister.data.local.*
import com.example.geruestmeister.data.model.*
import kotlinx.coroutines.flow.Flow

class GeruestRepository(private val database: GeruestMeisterDatabase) {
    val allProjects: Flow<List<ProjectEntity>> = database.projectDao().getAllProjects()
    val allFreigaben: Flow<List<GeruestfreigabeEntity>> = database.geruestfreigabeDao().getAllFreigaben()
    val allMaterials: Flow<List<MaterialEntity>> = database.materialDao().getAllMaterials()
    val allCalculations: Flow<List<CalculationResultEntity>> = database.calculationResultDao().getAllCalculations()
    val allAssignments: Flow<List<AssignmentEntity>> = database.assignmentDao().getAllAssignments()
    val allEmployees: Flow<List<EmployeeEntity>> = database.employeeDao().getAllEmployees()

    suspend fun getProjectById(id: Long): ProjectEntity? = database.projectDao().getProjectById(id)

    suspend fun insertProject(project: ProjectEntity): Long = database.projectDao().insertProject(project)
    suspend fun updateProject(project: ProjectEntity) = database.projectDao().updateProject(project)
    suspend fun deleteProject(project: ProjectEntity) = database.projectDao().deleteProject(project)

    suspend fun insertFreigabe(freigabe: GeruestfreigabeEntity): Long = database.geruestfreigabeDao().insertFreigabe(freigabe)
    suspend fun updateFreigabe(freigabe: GeruestfreigabeEntity) = database.geruestfreigabeDao().updateFreigabe(freigabe)
    suspend fun deleteFreigabe(freigabe: GeruestfreigabeEntity) = database.geruestfreigabeDao().deleteFreigabe(freigabe)

    suspend fun insertMaterial(material: MaterialEntity): Long = database.materialDao().insertMaterial(material)
    suspend fun updateStock(id: Long, delta: Int) = database.materialDao().updateStock(id, delta)

    suspend fun saveCalculation(calc: CalculationResultEntity): Long = database.calculationResultDao().insertCalculation(calc)
    suspend fun deleteCalculation(calc: CalculationResultEntity) = database.calculationResultDao().deleteCalculation(calc)

    suspend fun insertAssignment(assignment: AssignmentEntity): Long = database.assignmentDao().insertAssignment(assignment)
    suspend fun updateAssignment(assignment: AssignmentEntity) = database.assignmentDao().updateAssignment(assignment)
    suspend fun deleteAssignment(assignment: AssignmentEntity) = database.assignmentDao().deleteAssignment(assignment)
}
