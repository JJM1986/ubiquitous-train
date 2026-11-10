package com.example.geruestmeister.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.geruestmeister.data.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        ProjectEntity::class,
        GeruestfreigabeEntity::class,
        MaterialEntity::class,
        CalculationResultEntity::class,
        EmployeeEntity::class,
        AssignmentEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class GeruestMeisterDatabase : RoomDatabase() {
    abstract fun projectDao(): ProjectDao
    abstract fun geruestfreigabeDao(): GeruestfreigabeDao
    abstract fun materialDao(): MaterialDao
    abstract fun calculationResultDao(): CalculationResultDao
    abstract fun employeeDao(): EmployeeDao
    abstract fun assignmentDao(): AssignmentDao

    companion object {
        @Volatile
        private var INSTANCE: GeruestMeisterDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): GeruestMeisterDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    GeruestMeisterDatabase::class.java,
                    "geruestmeister_database"
                )
                    .addCallback(DatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateDatabase(database)
                    }
                }
            }

            suspend fun populateDatabase(db: GeruestMeisterDatabase) {
                db.projectDao().insertAll(InitialData.INITIAL_PROJECTS)
                db.geruestfreigabeDao().insertAll(InitialData.INITIAL_FREIGABEN)
                db.materialDao().insertAll(InitialData.INITIAL_MATERIALS)
                db.employeeDao().insertAll(InitialData.INITIAL_EMPLOYEES)
                db.assignmentDao().insertAll(InitialData.INITIAL_ASSIGNMENTS)
            }
        }
    }
}
