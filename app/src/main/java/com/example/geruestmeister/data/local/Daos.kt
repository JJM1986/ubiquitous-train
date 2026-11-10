package com.example.geruestmeister.data.local

import androidx.room.*
import com.example.geruestmeister.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ProjectDao {
    @Query("SELECT * FROM projects ORDER BY id DESC")
    fun getAllProjects(): Flow<List<ProjectEntity>>

    @Query("SELECT * FROM projects WHERE id = :id")
    suspend fun getProjectById(id: Long): ProjectEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProject(project: ProjectEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(projects: List<ProjectEntity>)

    @Update
    suspend fun updateProject(project: ProjectEntity)

    @Delete
    suspend fun deleteProject(project: ProjectEntity)

    @Query("SELECT COUNT(*) FROM projects")
    suspend fun getProjectCount(): Int
}

@Dao
interface GeruestfreigabeDao {
    @Query("SELECT * FROM geruestfreigaben ORDER BY id DESC")
    fun getAllFreigaben(): Flow<List<GeruestfreigabeEntity>>

    @Query("SELECT * FROM geruestfreigaben WHERE id = :id")
    suspend fun getFreigabeById(id: Long): GeruestfreigabeEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFreigabe(freigabe: GeruestfreigabeEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(freigaben: List<GeruestfreigabeEntity>)

    @Update
    suspend fun updateFreigabe(freigabe: GeruestfreigabeEntity)

    @Delete
    suspend fun deleteFreigabe(freigabe: GeruestfreigabeEntity)

    @Query("SELECT COUNT(*) FROM geruestfreigaben")
    suspend fun getFreigabenCount(): Int
}

@Dao
interface MaterialDao {
    @Query("SELECT * FROM materials ORDER BY category, name")
    fun getAllMaterials(): Flow<List<MaterialEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMaterial(material: MaterialEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(materials: List<MaterialEntity>)

    @Update
    suspend fun updateMaterial(material: MaterialEntity)

    @Query("UPDATE materials SET stock = stock + :delta WHERE id = :id")
    suspend fun updateStock(id: Long, delta: Int)

    @Delete
    suspend fun deleteMaterial(material: MaterialEntity)

    @Query("SELECT COUNT(*) FROM materials")
    suspend fun getMaterialCount(): Int
}

@Dao
interface CalculationResultDao {
    @Query("SELECT * FROM calculation_results ORDER BY id DESC")
    fun getAllCalculations(): Flow<List<CalculationResultEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCalculation(calc: CalculationResultEntity): Long

    @Delete
    suspend fun deleteCalculation(calc: CalculationResultEntity)
}

@Dao
interface EmployeeDao {
    @Query("SELECT * FROM employees ORDER BY name")
    fun getAllEmployees(): Flow<List<EmployeeEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(employees: List<EmployeeEntity>)

    @Query("SELECT COUNT(*) FROM employees")
    suspend fun getEmployeeCount(): Int
}

@Dao
interface AssignmentDao {
    @Query("SELECT * FROM assignments ORDER BY date DESC, id DESC")
    fun getAllAssignments(): Flow<List<AssignmentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAssignment(assignment: AssignmentEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(assignments: List<AssignmentEntity>)

    @Update
    suspend fun updateAssignment(assignment: AssignmentEntity)

    @Delete
    suspend fun deleteAssignment(assignment: AssignmentEntity)

    @Query("SELECT COUNT(*) FROM assignments")
    suspend fun getAssignmentCount(): Int
}
