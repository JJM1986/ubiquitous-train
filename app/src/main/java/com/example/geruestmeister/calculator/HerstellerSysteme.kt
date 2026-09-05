package com.example.geruestmeister.calculator

data class HerstellerSystem(
    val id: String,
    val label: String,
    val typ: String,
    val hersteller: String,
    val beschreibung: String
)

data class PartItem(
    val name: String,
    val dim: String,
    val weightKg: Double,
    val unit: String = "Stk",
    val category: String = "Allgemein"
)

data class CalculatedPart(
    val roleKey: String,
    val name: String,
    val dimension: String,
    val quantity: Int,
    val unit: String,
    val singleWeightKg: Double,
    val totalWeightKg: Double
)

object ScaffoldingSystems {
    val SYSTEMS = listOf(
        HerstellerSystem("layher_blitz", "Layher Blitz", "Rahmengerüst", "Layher", "Verzinktes Rahmengerüst für schnelle Fassadenmontage"),
        HerstellerSystem("layher_allround", "Layher Allround", "Modulgerüst", "Layher", "Rosetten-Modulsystem für komplexe Geometrien"),
        HerstellerSystem("mj_geruest", "MJ Gerüst (Uni)", "Rahmengerüst", "MJ Gerüst", "Bewährtes Fassadengerüst-System"),
        HerstellerSystem("plettac_assco", "Plettac Assco", "Modulgerüst", "Plettac", "Flexibles Fassaden- und Raumgerüst")
    )

    private val BLITZ_PARTS = mapOf(
        "rahmen_200" to PartItem("Blitz-Euro-Rahmen 2,00m", "2,00 × 0,73 m", 15.0, "Stk", "Gerüstrahmen"),
        "rahmen_turm" to PartItem("Blitz-Turmrahmen TR 200", "2,00 × 1,40 m", 16.5, "Stk", "Gerüstrahmen"),
        "rahmen_rs" to PartItem("Blitz Schwerlast-Rahmen RS", "2,00 × 1,00 m", 18.0, "Stk", "Gerüstrahmen"),
        "rahmen_alu" to PartItem("Blitz Alu-Rahmen Leichtbau", "2,00 × 0,73 m", 8.2, "Stk", "Gerüstrahmen"),
        "verband" to PartItem("Blitz Kreuzdiagonale KD 300", "3,00 m Diagonale", 7.8, "Stk", "Verbände"),
        "verband_alu" to PartItem("Blitz Alu-Diagonale", "3,00 m Diagonale", 4.1, "Stk", "Verbände"),
        "laengsverbund" to PartItem("Blitz Längsriegel LR 300", "3,00 m", 5.9, "Stk", "Verbände"),
        "querriegel" to PartItem("Blitz Querriegel QR 73", "0,73 m", 4.2, "Stk", "Verbände"),
        "belag" to PartItem("Blitz Stahl-Bodenbelag 300", "3,00 × 0,32 m", 13.5, "Stk", "Beläge"),
        "podest" to PartItem("Blitz Durchstiegsbelag mit Leiter", "3,00 × 0,61 m", 19.5, "Stk", "Beläge"),
        "podest_alu" to PartItem("Blitz Alu-Podestbelag", "3,00 × 0,61 m", 11.0, "Stk", "Beläge"),
        "belag_m2" to PartItem("Gerüstbelag (m²)", "variabel", 12.0, "m²", "Beläge"),
        "treppe_wange" to PartItem("Blitz Treppenwange TW", "3,00 m", 12.0, "Stk", "Treppen"),
        "treppe_stufe" to PartItem("Blitz Treppenstufe TS", "0,65 m", 4.0, "Stk", "Treppen"),
        "treppe_lauf" to PartItem("Blitz Alu-Etagentreppe", "3,00 × 2,00 m", 22.0, "Stk", "Treppen"),
        "treppe_lauf_alu" to PartItem("Blitz Alu-Treppenlauf", "3,00 × 2,00 m", 14.0, "Stk", "Treppen"),
        "gelaender" to PartItem("Blitz Geländerholm doppel", "3,00 m", 5.5, "Stk", "Gerüstschutz"),
        "gelaender_alu" to PartItem("Blitz Alu-Rückengeländer", "3,00 m", 2.8, "Stk", "Gerüstschutz"),
        "fanggitter" to PartItem("Blitz Schutznetz/Fanggitter", "3,00 × 2,00 m", 6.2, "Stk", "Gerüstschutz"),
        "schutznetz" to PartItem("Schutznetz winddurchlässig", "per m²", 0.35, "m²", "Gerüstschutz"),
        "konsolhalter" to PartItem("Blitz Auslegerkonsole 0,73m", "0,73 m", 4.5, "Stk", "Gerüstschutz"),
        "spanngurt" to PartItem("Schwerlast-Spanngurt 5t", "6,00 m", 1.2, "Stk", "Zubehör"),
        "kabelbinder" to PartItem("UV-Kabelbinder Heavy-Duty", "380 mm", 0.02, "Stk", "Zubehör"),
        "spindel" to PartItem("Gewindefußplatte / Spindel 60", "0,60 m", 4.8, "Stk", "Fundament"),
        "unterlegplatte" to PartItem("Unterlegholz Hartholz 50mm", "0,25 × 0,50 m", 3.2, "Stk", "Fundament")
    )

    private val ALLROUND_PARTS = mapOf(
        "rahmen_200" to PartItem("Allround Vertikalstiel 2,00m", "2,00 m Rosetten", 9.8, "Stk", "Gerüstrahmen"),
        "rahmen_turm" to PartItem("Allround Turmstiel 2,00m", "2,00 m", 12.0, "Stk", "Gerüstrahmen"),
        "rahmen_rs" to PartItem("Allround Schwerlaststiel", "2,00 m", 14.5, "Stk", "Gerüstrahmen"),
        "rahmen_alu" to PartItem("Allround Alu-Vertikalstiel", "2,00 m", 5.5, "Stk", "Gerüstrahmen"),
        "verband" to PartItem("Allround Diagonale 3,00m", "3,00 × 2,00 m", 8.8, "Stk", "Verbände"),
        "verband_alu" to PartItem("Allround Alu-Diagonale", "3,00 × 2,00 m", 4.5, "Stk", "Verbände"),
        "laengsverbund" to PartItem("Allround O-Riegel 3,00m", "3,00 m", 6.5, "Stk", "Verbände"),
        "querriegel" to PartItem("Allround U-Riegel 0,73m", "0,73 m", 4.0, "Stk", "Verbände"),
        "belag" to PartItem("Allround Stahlbelag T9", "3,00 × 0,32 m", 13.8, "Stk", "Beläge"),
        "podest" to PartItem("Allround Alu-Durchstieg T9", "3,00 × 0,61 m", 18.2, "Stk", "Beläge"),
        "podest_alu" to PartItem("Allround Leichtmetall-Podest", "3,00 × 0,61 m", 12.0, "Stk", "Beläge"),
        "belag_m2" to PartItem("Allround Belagfläche (m²)", "variabel", 12.5, "m²", "Beläge"),
        "treppe_wange" to PartItem("Allround Treppenwange", "3,00 m", 13.0, "Stk", "Treppen"),
        "treppe_stufe" to PartItem("Allround Alu-Stufe", "0,65 m", 3.8, "Stk", "Treppen"),
        "treppe_lauf" to PartItem("Allround Treppenturmlauf", "3,00 × 2,00 m", 24.0, "Stk", "Treppen"),
        "treppe_lauf_alu" to PartItem("Allround Alu-Treppenturm", "3,00 × 2,00 m", 15.0, "Stk", "Treppen"),
        "gelaender" to PartItem("Allround O-Geländerriegel", "3,00 m", 6.2, "Stk", "Gerüstschutz"),
        "gelaender_alu" to PartItem("Allround Alu-Geländer", "3,00 m", 3.0, "Stk", "Gerüstschutz"),
        "fanggitter" to PartItem("Allround Schutzgitter SG", "3,00 × 2,00 m", 7.0, "Stk", "Gerüstschutz"),
        "schutznetz" to PartItem("Allround Gerüstschutznetz", "per m²", 0.35, "m²", "Gerüstschutz"),
        "konsolhalter" to PartItem("Allround Konsole 0,73m", "0,73 m", 5.2, "Stk", "Gerüstschutz"),
        "spanngurt" to PartItem("Zurrgurt mit Ratsche", "6,00 m", 1.2, "Stk", "Zubehör"),
        "kabelbinder" to PartItem("Kabelbinder Industriequalität", "380 mm", 0.02, "Stk", "Zubehör"),
        "spindel" to PartItem("Allround Fußspindel 60", "0,60 m", 4.9, "Stk", "Fundament"),
        "unterlegplatte" to PartItem("Allround Unterlegbohle", "0,25 × 0,50 m", 3.5, "Stk", "Fundament")
    )

    fun getPart(systemId: String, roleKey: String): PartItem {
        val mapping = if (systemId == "layher_allround") ALLROUND_PARTS else BLITZ_PARTS
        return mapping[roleKey] ?: PartItem(
            name = roleKey.replace("_", " ").replaceFirstChar { it.uppercase() },
            dim = "Standard",
            weightKg = 5.0,
            unit = "Stk"
        )
    }
}
