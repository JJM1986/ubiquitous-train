package com.example.geruestmeister.data.local

import com.example.geruestmeister.data.model.*

object InitialData {
    val INITIAL_PROJECTS = listOf(
        ProjectEntity(
            title = "Sanierung Rathausfassade",
            customerName = "Stadtbauamt München",
            address = "Marienplatz 8",
            city = "München",
            status = "In Arbeit",
            baustelleStatus = "läuft",
            startDate = "2026-08-10",
            endDate = "2026-11-30",
            assemblyDate = "2026-08-10",
            disassemblyDate = "2026-11-28",
            scaffoldType = "Fassadengerüst (Layher Blitz)",
            scaffoldArea = 850.0,
            scaffoldHeight = 24.0,
            description = "Vollflächige Einrüstung der denkmalgeschützten Fassade mit Planenverkleidung und Innengeländer.",
            notes = "Zufahrt nur über Nordtor mit Sondergenehmigung möglich. Passantentunnel erforderlich.",
            kolonneName = "Kolonne 1 (München-Mitte)"
        ),
        ProjectEntity(
            title = "Neubau Wohnquartier Am Park",
            customerName = "Bayerische Wohnbau GmbH",
            address = "Parkallee 14-18",
            city = "Augsburg",
            status = "In Arbeit",
            baustelleStatus = "läuft",
            startDate = "2026-07-01",
            endDate = "2026-10-15",
            assemblyDate = "2026-07-05",
            disassemblyDate = "2026-10-12",
            scaffoldType = "Modulgerüst (Layher Allround)",
            scaffoldArea = 1200.0,
            scaffoldHeight = 18.0,
            description = "Arbeits- und Schutzgerüst Lastklasse 3 für Rohbau und WDVS-Fassadenarbeiten.",
            notes = "Inklusive 2 Bautreppentürmen und Fanggitterlage an der Dachtraufe.",
            kolonneName = "Kolonne 2 (Augsburg)"
        ),
        ProjectEntity(
            title = "Schulzentrum Dachsanierung",
            customerName = "Landkreis Freising",
            address = "Schulstraße 22",
            city = "Freising",
            status = "Beauftragt",
            baustelleStatus = "geplant",
            startDate = "2026-09-12",
            endDate = "2026-10-30",
            assemblyDate = "2026-09-12",
            disassemblyDate = "2026-10-25",
            scaffoldType = "Fassadengerüst + Treppenturm",
            scaffoldArea = 460.0,
            scaffoldHeight = 12.5,
            description = "Dachfanggerüst mit Gerüstschutznetz und Alutreppenturm als Notausstieg.",
            notes = "Montage nur außerhalb der Unterrichtszeiten (Sa/Mo-Nachmittag).",
            kolonneName = "Kolonne 3 (Nordbayern)"
        ),
        ProjectEntity(
            title = "Industriepark Halle 4 Hallendecke",
            customerName = "Siemens AG Energy",
            address = "Industriestraße 100",
            city = "Erlangen",
            status = "Angebot",
            baustelleStatus = "geplant",
            startDate = "2026-10-01",
            endDate = "2026-11-15",
            assemblyDate = "2026-10-01",
            disassemblyDate = "2026-11-10",
            scaffoldType = "Raumgerüst Super RS",
            scaffoldArea = 600.0,
            scaffoldHeight = 14.0,
            description = "Freistehendes Flächen-Raumgerüst für Kranbahn- und Lüftungsinstallation.",
            notes = "Bodenbelastung max. 25 kN/m² beachten.",
            kolonneName = "Kolonne 1 (Spezialbau)"
        )
    )

    val INITIAL_FREIGABEN = listOf(
        GeruestfreigabeEntity(
            projectName = "Sanierung Rathausfassade",
            siteAddress = "Marienplatz 8, München",
            customerName = "Stadtbauamt München",
            scaffoldType = "Fassadengerüst",
            scaffoldHeight = 24.0,
            scaffoldArea = 850.0,
            scaffoldClass = "Lastklasse 3 (2,0 kN/m²)",
            inspectionType = "Erstprüfung nach Aufbau (TRBS 2121)",
            inspectorName = "Markus Weber (Geprüfter Gerüstbaumeister)",
            inspectionDate = "2026-08-11",
            result = "Freigegeben",
            status = "Freigegeben",
            conditions = "Freigabe gilt bis Windstärke 6. Tägliche Sichtprüfung vor Arbeitsaufnahme durch Nutzer erforderlich.",
            notes = "Verankerungsprüfungen durchgeführt: 15 Dübelzüge mit 5,5 kN ohne Beanstandung.",
            checkpointsJson = ""
        ),
        GeruestfreigabeEntity(
            projectName = "Neubau Wohnquartier Am Park",
            siteAddress = "Parkallee 14-18, Augsburg",
            customerName = "Bayerische Wohnbau GmbH",
            scaffoldType = "Modulgerüst Allround",
            scaffoldHeight = 18.0,
            scaffoldArea = 1200.0,
            scaffoldClass = "Lastklasse 4 (3,0 kN/m²)",
            inspectionType = "Wiederholungsprüfung (4 Wochen)",
            inspectorName = "Stefan Holzer (Bauleiter)",
            inspectionDate = "2026-09-02",
            result = "Freigegeben mit Auflagen",
            status = "Freigegeben",
            conditions = "Bordbrett an Achse 4-5 im 3. OG nachjustieren. Verankerung an Balkonachse erneuern.",
            notes = "Nachbesserung am 03.09. erfolgt und dokumentiert.",
            checkpointsJson = ""
        )
    )

    val INITIAL_MATERIALS = listOf(
        MaterialEntity(name = "Blitz-Euro-Rahmen 2,00m", category = "Gerüstrahmen", articleNumber = "0701.000", unit = "Stk", stock = 340, minStock = 50, weightKg = 15.0),
        MaterialEntity(name = "Blitz Alu-Rahmen 2,00m", category = "Gerüstrahmen", articleNumber = "0701.001", unit = "Stk", stock = 120, minStock = 30, weightKg = 8.2),
        MaterialEntity(name = "Blitz Stahlbelag 3,00m", category = "Beläge", articleNumber = "0702.300", unit = "Stk", stock = 520, minStock = 100, weightKg = 13.5),
        MaterialEntity(name = "Blitz Durchstieg mit Leiter 3,00m", category = "Beläge", articleNumber = "0702.301", unit = "Stk", stock = 45, minStock = 15, weightKg = 19.5),
        MaterialEntity(name = "Blitz Kreuzdiagonale 3,00m", category = "Verbände", articleNumber = "0703.300", unit = "Stk", stock = 180, minStock = 40, weightKg = 7.8),
        MaterialEntity(name = "Blitz Geländerholm doppel 3,00m", category = "Gerüstschutz", articleNumber = "0704.300", unit = "Stk", stock = 380, minStock = 60, weightKg = 5.5),
        MaterialEntity(name = "Bordbrett Holz 3,00m", category = "Gerüstschutz", articleNumber = "0704.305", unit = "Stk", stock = 310, minStock = 50, weightKg = 4.2),
        MaterialEntity(name = "Gewindefußplatte / Spindel 60", category = "Fundament", articleNumber = "0705.060", unit = "Stk", stock = 195, minStock = 40, weightKg = 4.8),
        MaterialEntity(name = "Unterlegholz Hartholz 50mm", category = "Fundament", articleNumber = "0705.150", unit = "Stk", stock = 220, minStock = 50, weightKg = 3.2),
        MaterialEntity(name = "Blitz Alu-Etagentreppe 3,00m", category = "Treppen", articleNumber = "0706.300", unit = "Stk", stock = 22, minStock = 8, weightKg = 22.0),
        MaterialEntity(name = "Schutznetz engmaschig (m²)", category = "Gerüstschutz", articleNumber = "0707.001", unit = "m²", stock = 1400, minStock = 300, weightKg = 0.35),
        MaterialEntity(name = "Normalkupplung 48/48 mm", category = "Kupplungen", articleNumber = "0708.001", unit = "Stk", stock = 650, minStock = 150, weightKg = 1.3),
        MaterialEntity(name = "Drehkupplung 48/48 mm", category = "Kupplungen", articleNumber = "0708.002", unit = "Stk", stock = 280, minStock = 80, weightKg = 1.4),
        MaterialEntity(name = "Ringösenschraube M12x160", category = "Verankerung", articleNumber = "0709.012", unit = "Stk", stock = 420, minStock = 100, weightKg = 0.25)
    )

    val INITIAL_EMPLOYEES = listOf(
        EmployeeEntity(name = "Markus Weber", role = "Gerüstbaumeister / Bauleiter", phone = "+49 171 2345678", status = "aktiv"),
        EmployeeEntity(name = "Stefan Holzer", role = "Kolonnenführer", phone = "+49 172 3456789", status = "aktiv"),
        EmployeeEntity(name = "Dmitri Ivanov", role = "Gerüstmonteur", phone = "+49 173 4567890", status = "aktiv"),
        EmployeeEntity(name = "Lukas Schmidt", role = "Gerüstmonteur", phone = "+49 174 5678901", status = "aktiv"),
        EmployeeEntity(name = "Florian Huber", role = "Gerüstbauhelfer", phone = "+49 175 6789012", status = "aktiv"),
        EmployeeEntity(name = "Thomas Bauer", role = "LKW-Fahrer / Logistik", phone = "+49 176 7890123", status = "aktiv")
    )

    val INITIAL_ASSIGNMENTS = listOf(
        AssignmentEntity(projectTitle = "Sanierung Rathausfassade", employeeName = "Stefan Holzer", date = "2026-09-06", taskDescription = "Gerüsterweiterung Westgiebel + Verankerungsprüfung", status = "Geplant"),
        AssignmentEntity(projectTitle = "Sanierung Rathausfassade", employeeName = "Dmitri Ivanov", date = "2026-09-06", taskDescription = "Montage Belag- und Geländerebenen 4 & 5", status = "Geplant"),
        AssignmentEntity(projectTitle = "Sanierung Rathausfassade", employeeName = "Lukas Schmidt", date = "2026-09-06", taskDescription = "Planenbespannung Westfassade", status = "Geplant"),
        AssignmentEntity(projectTitle = "Schulzentrum Dachsanierung", employeeName = "Thomas Bauer", date = "2026-09-07", taskDescription = "Materialanlieferung mit MAN 26t Kranwagen", status = "Geplant"),
        AssignmentEntity(projectTitle = "Schulzentrum Dachsanierung", employeeName = "Florian Huber", date = "2026-09-07", taskDescription = "Vorbereitung Fußpunkte und Unterbau", status = "Geplant")
    )
}
