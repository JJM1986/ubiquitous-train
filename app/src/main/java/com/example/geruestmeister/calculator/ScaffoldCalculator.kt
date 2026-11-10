package com.example.geruestmeister.calculator

import kotlin.math.ceil
import kotlin.math.max

enum class ScaffoldType(val id: String, val label: String, val desc: String) {
    FASSADENGERUEST("fassadengeruest", "Fassadengerüst", "Standard Fassaden- und Arbeitsgerüst"),
    GERUESTTREPPE("geruesttreppe", "Gerüsttreppe", "Integrierter Treppenlauf im Gerüstfeld"),
    BAUTREPPENTURM("bautreppenturm", "Bautreppenturm", "Freistehender Treppenturm 4-stielig"),
    ALUTREPPENTURM("alutreppenturm", "Alutreppenturm", "Leichter Aluminium Treppenturm"),
    GERUESTSCHUTZ("geruestschutz", "Gerüstschutz", "Schutznetz, Planen & Fanggitter"),
    SUPER_RS("super_rs", "Super RS", "Schwerlast- und Modulgerüst")
}

data class CalculationResult(
    val scaffoldType: ScaffoldType,
    val systemId: String,
    val summaryParams: String,
    val areaM2: Double,
    val parts: List<CalculatedPart>,
    val totalPieces: Int,
    val totalWeightKg: Double
)

object ScaffoldCalculator {

    fun calculateFassadengeruest(
        lengthM: Double,
        heightM: Double,
        platforms: Int,
        bayLengthM: Double = 3.0,
        systemId: String = "layher_blitz"
    ): CalculationResult {
        val bays = max(1, ceil(lengthM / bayLengthM).toInt())
        val levels = max(1, ceil(heightM / 2.0).toInt())
        val fp = bays + 1 // Ständerachsen / Feldpfosten

        val roleQuantities = listOf(
            "rahmen_200" to (fp * levels),
            "verband" to (bays * levels),
            "belag" to (bays * max(1, platforms)),
            "spindel" to fp,
            "unterlegplatte" to fp,
            "gelaender" to (fp * max(1, platforms)),
            "fanggitter" to (bays * levels)
        )

        val parts = roleQuantities.map { (role, qty) ->
            val p = ScaffoldingSystems.getPart(systemId, role)
            val weight = qty * p.weightKg
            CalculatedPart(
                roleKey = role,
                name = p.name,
                dimension = p.dim,
                quantity = qty,
                unit = p.unit,
                singleWeightKg = p.weightKg,
                totalWeightKg = weight
            )
        }

        val totalPieces = parts.sumOf { it.quantity }
        val totalWeight = parts.sumOf { it.totalWeightKg }
        val area = lengthM * heightM

        return CalculationResult(
            scaffoldType = ScaffoldType.FASSADENGERUEST,
            systemId = systemId,
            summaryParams = "L: ${"%.1f".format(lengthM)}m × H: ${"%.1f".format(heightM)}m | $platforms Ebenen",
            areaM2 = area,
            parts = parts,
            totalPieces = totalPieces,
            totalWeightKg = totalWeight
        )
    }

    fun calculateGeruesttreppe(
        heightM: Double,
        runs: Int,
        bayLengthM: Double = 3.0,
        systemId: String = "layher_blitz"
    ): CalculationResult {
        val levels = max(1, ceil(heightM / 2.0).toInt())
        val steps = runs * 10

        val roleQuantities = listOf(
            "rahmen_200" to (4 * levels),
            "treppe_wange" to (runs * 2),
            "treppe_stufe" to steps,
            "podest" to runs,
            "gelaender" to (levels * 2),
            "verband" to (levels * 2)
        )

        val parts = roleQuantities.map { (role, qty) ->
            val p = ScaffoldingSystems.getPart(systemId, role)
            val weight = qty * p.weightKg
            CalculatedPart(
                roleKey = role,
                name = p.name,
                dimension = p.dim,
                quantity = qty,
                unit = p.unit,
                singleWeightKg = p.weightKg,
                totalWeightKg = weight
            )
        }

        return CalculationResult(
            scaffoldType = ScaffoldType.GERUESTTREPPE,
            systemId = systemId,
            summaryParams = "H: ${"%.1f".format(heightM)}m | $runs Treppenläufe",
            areaM2 = bayLengthM * heightM,
            parts = parts,
            totalPieces = parts.sumOf { it.quantity },
            totalWeightKg = parts.sumOf { it.totalWeightKg }
        )
    }

    fun calculateTreppenturm(
        heightM: Double,
        isAlu: Boolean,
        systemId: String = "layher_blitz"
    ): CalculationResult {
        val levels = max(1, ceil(heightM / 2.0).toInt())
        val scaffoldType = if (isAlu) ScaffoldType.ALUTREPPENTURM else ScaffoldType.BAUTREPPENTURM

        val roleQuantities = if (isAlu) {
            listOf(
                "rahmen_alu" to (4 * levels),
                "podest_alu" to levels,
                "treppe_lauf_alu" to levels,
                "treppe_stufe" to (levels * 10),
                "gelaender_alu" to (levels * 4),
                "verband_alu" to (levels * 2),
                "spindel" to 4
            )
        } else {
            listOf(
                "rahmen_turm" to (4 * levels),
                "podest" to levels,
                "treppe_lauf" to levels,
                "treppe_stufe" to (levels * 10),
                "gelaender" to (levels * 4),
                "verband" to (levels * 2),
                "spindel" to 4
            )
        }

        val parts = roleQuantities.map { (role, qty) ->
            val p = ScaffoldingSystems.getPart(systemId, role)
            val weight = qty * p.weightKg
            CalculatedPart(
                roleKey = role,
                name = p.name,
                dimension = p.dim,
                quantity = qty,
                unit = p.unit,
                singleWeightKg = p.weightKg,
                totalWeightKg = weight
            )
        }

        return CalculationResult(
            scaffoldType = scaffoldType,
            systemId = systemId,
            summaryParams = "H: ${"%.1f".format(heightM)}m | ${levels} Lagen | ${if (isAlu) "Alu" else "Stahl"}",
            areaM2 = 2.5 * 1.5 * levels,
            parts = parts,
            totalPieces = parts.sumOf { it.quantity },
            totalWeightKg = parts.sumOf { it.totalWeightKg }
        )
    }

    fun calculateGeruestschutz(
        lengthM: Double,
        heightM: Double,
        systemId: String = "layher_blitz"
    ): CalculationResult {
        val bays = max(1, ceil(lengthM / 3.0).toInt())
        val levels = max(1, ceil(heightM / 2.0).toInt())
        val netM2 = ceil(lengthM * heightM).toInt()

        val roleQuantities = listOf(
            "schutznetz" to netM2,
            "fanggitter" to (bays * levels),
            "konsolhalter" to bays,
            "spanngurt" to max(1, ceil(lengthM / 3.0).toInt()),
            "kabelbinder" to (bays * levels * 4)
        )

        val parts = roleQuantities.map { (role, qty) ->
            val p = ScaffoldingSystems.getPart(systemId, role)
            val weight = qty * p.weightKg
            CalculatedPart(
                roleKey = role,
                name = p.name,
                dimension = p.dim,
                quantity = qty,
                unit = p.unit,
                singleWeightKg = p.weightKg,
                totalWeightKg = weight
            )
        }

        return CalculationResult(
            scaffoldType = ScaffoldType.GERUESTSCHUTZ,
            systemId = systemId,
            summaryParams = "L: ${"%.1f".format(lengthM)}m × H: ${"%.1f".format(heightM)}m ($netM2 m²)",
            areaM2 = lengthM * heightM,
            parts = parts,
            totalPieces = parts.sumOf { it.quantity },
            totalWeightKg = parts.sumOf { it.totalWeightKg }
        )
    }

    fun calculateSuperRS(
        areaM2: Double,
        heightM: Double,
        systemId: String = "layher_allround"
    ): CalculationResult {
        val levels = max(1, ceil(heightM / 2.0).toInt())
        val bays = max(1, ceil(areaM2 / 9.0).toInt())
        val fp = bays + 1

        val roleQuantities = listOf(
            "rahmen_rs" to (fp * levels),
            "laengsverbund" to (fp * levels * 2),
            "querriegel" to (bays * levels),
            "belag_m2" to ceil(areaM2).toInt(),
            "spindel" to fp,
            "unterlegplatte" to fp
        )

        val parts = roleQuantities.map { (role, qty) ->
            val p = ScaffoldingSystems.getPart(systemId, role)
            val weight = qty * p.weightKg
            CalculatedPart(
                roleKey = role,
                name = p.name,
                dimension = p.dim,
                quantity = qty,
                unit = p.unit,
                singleWeightKg = p.weightKg,
                totalWeightKg = weight
            )
        }

        return CalculationResult(
            scaffoldType = ScaffoldType.SUPER_RS,
            systemId = systemId,
            summaryParams = "Fläche: ${"%.0f".format(areaM2)}m² × H: ${"%.1f".format(heightM)}m",
            areaM2 = areaM2,
            parts = parts,
            totalPieces = parts.sumOf { it.quantity },
            totalWeightKg = parts.sumOf { it.totalWeightKg }
        )
    }
}
