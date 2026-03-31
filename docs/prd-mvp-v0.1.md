# PRD / MVP v0.1

## Status
Arbeitsstand nach gemeinsamer Klärung

## Arbeitsweise
Dieses Dokument basiert auf einer schrittweisen gemeinsamen Ausarbeitung:
1. Gezielte Fragen, jeweils einzeln
2. Antworten sammeln
3. Zwischenbewertung und kritische Prüfung
4. Offene oder strittige Punkte klären
5. Dokument in einen belastbaren ersten Stand überführen

---

## 1. Ziel des MVP
Der MVP soll beweisen, dass eine schlanke, terminal-zentrierte Entwicklungsumgebung den Arbeitsfluss für Entwickler verbessert, die zwischen Terminal, Dateien und Änderungsübersicht arbeiten wollen, ohne ständig zwischen mehreren Fenstern oder einer überladenen IDE zu wechseln.

Der MVP soll dabei nicht alle möglichen Entwickler-Workflows abdecken, sondern einen klaren Kern demonstrieren:
- projektzentrierte Arbeit
- Terminal als Hauptarbeitsfläche
- direkter Zugriff auf Dateien
- sichtbare Änderungen im aktuellen Arbeitskontext
- weniger Reibung als in klassischen IDE-Setups

## 2. Zielgruppe
### Primäre Zielgruppe
- Solo Developer
- zielfokussierte Entwickler
- Entwickler mit terminal-nahem Arbeitsstil
- Entwickler, die AI-assisted arbeiten können oder wollen, aber im MVP keine tief integrierten AI-Features benötigen
- Nutzer, denen VS Code oder ähnliche IDEs zu viel sind, ein reines Terminal aber zu wenig Struktur bietet

### Produktiver Kernnutzer im MVP
Ein Solo Dev, der in einem Projekt arbeitet, das Terminal aktiv nutzt, Dateien regelmäßig prüfen und bearbeiten muss und dabei möglichst wenig Fensterwechsel und UI-Ballast will.

## 3. Kernproblem
Viele Entwickler arbeiten heute verteilt über mehrere Oberflächen:
- Terminal
- Editor / IDE
- Projektdateien
- Änderungsübersicht
- ggf. externe Coding-Tools

Dadurch entstehen im Alltag vor allem diese Probleme:
- zu viele Fensterwechsel
- unnötiger mentaler Overhead
- zu viel Ballast in klassischen IDEs
- zu wenig Struktur in rein terminalbasierten Setups

Das zentrale Leitproblem des MVP lautet:
**Der Wechsel zwischen Terminal, Dateien und Änderungen ist unnötig fragmentiert.**

## 4. Produktversprechen
Ein terminal-zentrierter Developer Workspace für Nutzer, denen VS Code zu viel und ein reines Terminal zu wenig ist.

Das Produkt verspricht:
- fokussierteres Arbeiten
- weniger Fensterwechsel
- weniger Overhead
- klaren Projektkontext
- schnelle Orientierung über Dateien und aktuelle Änderungen

## 5. Top-Use-Cases
1. Ein Nutzer öffnet die App und wählt aus einer Liste ein lokales Projekt / einen Workspace.
2. Nach dem Öffnen sieht der Nutzer links den File Tree des Projekts und rechts einen tab-basierten Hauptbereich.
3. Standardmäßig arbeitet der Nutzer im Terminal-Tab.
4. Der Nutzer startet gewünschte Tools direkt im eingebetteten Terminal selbst.
5. Klickt der Nutzer im File Tree auf eine Datei, öffnet sie sich als eigener Tab im Hauptbereich.
6. Der Nutzer bearbeitet Dateien direkt in der App für normale Alltagssituationen.
7. Der Nutzer öffnet eine Diff-/Änderungsansicht, um die Änderungen der aktuellen Session als alt/neu-Vergleich zu sehen.
8. Geänderte Dateien der aktuellen Session sind zusätzlich dezent, aber gut sichtbar im File Tree markiert.
9. Beim erneuten Öffnen eines Projekts startet eine neue frische Session.
10. Frühere Sessions bleiben sichtbar und aufrufbar, damit Änderungen und Dateien vergangener Arbeitssitzungen wiedergefunden werden können.

## 6. Muss im MVP enthalten sein
### Projekt- und Workspace-Einstieg
- einfache Projekt-/Workspace-Liste beim Start
- Projekt öffnen
- bestehenden lokalen Ordner als Projekt / Workspace hinzufügen
- Projekt aus der Liste entfernen
- immer nur ein aktives Projekt gleichzeitig
- ausschließlich lokale Projekte im MVP

### Layout und Navigation
- linker File Tree
- tab-basierter Hauptbereich auf der rechten Seite
- Standard-Haupttab: Terminal
- Datei-Klick im File Tree öffnet Datei als Tab im Hauptbereich

### Terminal
- vollständiges eingebettetes Terminal als Kernarbeitsfläche
- mehrere individuelle Terminal-Tabs im MVP
- neue Terminal-Tabs per Plus-Button
- Terminal-Tabs manuell umbenennbar
- Nutzer startet Tools selbst direkt im Terminal

### Datei-Handling und Editing
- mehrere Datei-Tabs im MVP
- Text bearbeiten
- manuelles Speichern als Standard
- Undo / Redo
- Syntax Highlighting je nach Sprache
- Zeilennummern
- Suche innerhalb der geöffneten Datei

### File Tree-Aktionen
- Navigation
- neue Datei
- neuer Ordner
- umbenennen
- löschen mit Bestätigung
- Drag & Drop zum Verschieben
- visuelle Markierung geänderter Dateien der aktuellen Session

### Änderungsansicht / Diff
- eigener Diff-/Änderungstab
- read-only im MVP
- zeigt alle Änderungen der aktuellen Session
- Darstellung als Vergleich alt/neu

### Sessions
- beim Öffnen eines Projekts startet immer eine neue Session
- alte Sessions bleiben erhalten
- alte Sessions werden in einer Liste angezeigt
- pro Session sichtbar: Name und Zeitstempel
- Session-Namen werden automatisch generiert, sind aber manuell änderbar
- wenn automatische Generierung nicht sinnvoll möglich ist, dient Git-Branch-Name plus Zeitstempel als Fallback
- alte Sessions sind aufrufbar
- beim Öffnen alter Sessions liegt der Fokus darauf, damalige Änderungen und Dateien wiederzufinden

### Shortcuts
- nur wichtigste Shortcuts im MVP
- Suche in Datei
- Tab schließen
- Undo / Redo
- zwischen Tabs wechseln

## 7. Sollte später folgen
- zusätzliche AI-spezifische Features
- AI-bezogene Monetarisierungsfunktionen
- weitergehende Integrationen in Coding-Tools
- globale Projektsuche
- spezielle Vorschau für nicht-textbasierte Dateitypen
- tiefere Session-Wiederherstellung / stärkere Rekonstruktion früherer UI-Zustände
- Remote-/virtuelle Workspaces
- zusätzliche Komfort-Shortcuts
- weitere Ansichten oder Panels jenseits von Terminal, Dateien und Diff
- eventuell Autosave als optionale Einstellung

## 8. Bewusst nicht im MVP
### Produktgrenzen
- kein vollständiger IDE-Ersatz
- keine überladene All-in-one-Entwicklungsplattform
- keine tiefe AI-Integration im MVP
- keine spezielle Startlogik für AI-Tools in der App
- keine globale Projektsuche
- keine speziellen Vorschau-Features für nicht-textbasierte Dateitypen
- keine Remote-Workspaces
- keine Team-Kollaboration
- kein Plugin-/Marketplace-System
- keine Projektmanagement- oder Deployment-Suite

### UI-/Bediengrenzen
- keine frei ausufernde Layout-Flexibilität
- keine große Auswahl zusätzlicher Tab-Typen im MVP
- Diff-Ansicht nicht editierbar

## 9. Erfolgskriterien
Der MVP ist erfolgreich, wenn frühe Nutzer nach kurzer Nutzung sinngemäß sagen können:

**„Endlich muss ich nicht mehr ständig zwischen verschiedenen Fenstern springen, nur um Terminal, Dateien und Änderungen zusammen im Blick zu haben.“**

Zusätzliche qualitative Erfolgskriterien:
- die App fühlt sich spürbar fokussierter an als eine klassische IDE
- der Terminal-first-Ansatz bleibt glaubwürdig
- Nutzer verstehen die Oberfläche schnell
- die Session-/Änderungslogik erzeugt einen echten Mehrwert statt Verwirrung
- die App wirkt schlank statt halb fertiger IDE-Nachbau

## 10. Risiken und offene Fragen
### Kritische Risiken
1. **Session-Historie erhöht den MVP-Scope deutlich.**
2. **Endgültiges Löschen trotz Bestätigung ist ein bewusst akzeptiertes Risiko.**
3. **Die Differenzierung gegenüber VS Code / Cursor ist noch nicht scharf genug formuliert.**
4. **Die technische Logik zur Erfassung von Session-Änderungen ist noch offen.**
5. **Mehrere Terminal-Tabs machen die Qualität des Terminal-Teils geschäftskritisch.**

### Wichtige offene Fragen
1. Wie werden Änderungen außerhalb des Editors bzw. außerhalb direkter Bearbeitung verlässlich der aktuellen Session zugeordnet?
2. Wie genau entsteht die automatische Session-Benennung?
3. Wie sichtbar und zugänglich wird die Session-Liste in der UI?
4. Wie werden Fehlerfälle bei Verschieben, Löschen und Dateioperationen sauber kommuniziert?

## 11. Strittige Entscheidungen
### Bewusst entschieden
- manuelles Speichern als Standard im MVP
- endgültiges Löschen mit Bestätigung
- Session-Historie muss in den MVP
- mehrere Terminal-Tabs müssen in den MVP
- mehrere Datei-Tabs müssen in den MVP
- AI-Mehrwert im MVP nur indirekt über guten Workflow, nicht über Spezialfeatures

### Später erneut prüfen
- ob Löschen künftig recoverable statt endgültig sein sollte
- ob Autosave als optionale Setting-Funktion sinnvoll wird
- wie tief die Wiederherstellung alter Sessions später gehen soll
- ob zusätzliche Ansichten oder Panels echten Mehrwert liefern oder nur Scope aufblasen

## 12. Finaler MVP-Scope
Der MVP ist ein **terminal-zentrierter, sessionbasierter Developer Workspace** für lokale Projekte.

Er bietet:
- eine einfache Projektliste
- genau ein aktives Projekt gleichzeitig
- linken File Tree
- rechten tab-basierten Hauptbereich
- mehrere Terminal-Tabs
- mehrere Datei-Tabs
- read-only Diff-/Änderungstab
- normales textbasiertes Alltags-Editing
- Session-Historie mit sichtbaren und aufrufbaren alten Sessions
- Fokus auf weniger Fensterwechsel zwischen Terminal, Dateien und Änderungen

Er bietet bewusst **nicht**:
- vollständige IDE-Abdeckung
- tiefe AI-Sonderintegration
- globale Projektsuche
- Remote-Projekte
- Plugin-Systeme oder Teamfeatures

## Kurzfazit
Der MVP ist kein „kleiner VS Code“ und auch kein AI-Tool im engeren Sinn. Er ist eine fokussierte Entwicklungsumgebung für Entwickler, die terminal-nah arbeiten und dabei Dateien sowie Session-Änderungen direkt im selben Projektkontext im Blick behalten wollen.

Der eigentliche Test für den MVP lautet nicht, ob er möglichst viele Features nachbaut, sondern ob er einen spürbar direkteren und fokussierteren Arbeitsfluss erzeugt als der bisherige Wechsel zwischen IDE, Terminal und weiteren Fenstern.
