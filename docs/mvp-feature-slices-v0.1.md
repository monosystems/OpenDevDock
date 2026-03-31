# MVP Feature Slices v0.1

## Status
Arbeitsstand nach gemeinsamer Priorisierung

## Zweck des Dokuments
Dieses Dokument zerlegt den bereits definierten MVP in umsetzbare Bauabschnitte.

Ziel ist nicht neues Brainstorming, sondern eine klare Struktur für:
- Reihenfolge
- Abhängigkeiten
- frühe Testbarkeit
- bewusste Scope-Grenzen

## Leitprinzip für die Slice-Reihenfolge
Die Slices sind als **Mischform aus Nutzerwert und technischer Abhängigkeit** priorisiert.

Das bedeutet:
- möglichst früh testbare Zwischenstände
- aber keine künstliche Reihenfolge, die technische Realitäten ignoriert
- der Nutzerwert jedes Slices soll früh sichtbar werden

---

## Gesamtüberblick
1. Slice 1 — Workspace-Grundgerüst
2. Slice 2 — Terminal-first Arbeitskern
3. Slice 3 — Dateien direkt im selben Raum
4. Slice 4 — File Tree als Arbeitswerkzeug
5. Slice 5 — Session-Änderungskern
6. Slice 6 — Session-Historie

---

## Slice 1 — Workspace-Grundgerüst
### Ziel
Ein lokales Projekt öffnen und in einer stabilen, fokussierten Grundoberfläche landen.

### Enthalten
- einfache Projektliste beim Start
- bestehenden lokalen Ordner als Projekt / Workspace hinzufügen
- Projekt öffnen
- Projekt aus Liste entfernen
- immer nur ein aktives Projekt gleichzeitig
- ausschließlich lokale Projekte
- linker File Tree
- rechter tab-basierter Hauptbereich
- initialer Terminal-Tab

### Nutzerwert
Bereits nach Slice 1 ist die App testbar und nutzbar:
- Projekt öffnen
- Projektstruktur sehen
- im eingebetteten Terminal arbeiten

### Warum dieser Slice zuerst kommt
Ohne diesen Slice gibt es keinen belastbaren Projektkontext und keine stabile Grundstruktur für alle weiteren Funktionen.

### Abhängigkeiten
- keine funktionalen Vorbedingungen
- bildet die Grundlage für alle weiteren Slices

### Priorität
**kritisch**

---

## Slice 2 — Terminal-first Arbeitskern
### Ziel
Die App wird als Terminal-Workspace real arbeitsfähig.

### Enthalten
- mehrere individuelle Terminal-Tabs
- neuer Terminal-Tab per Plus-Button
- Terminal-Tabs manuell umbenennbar
- sauberes Tab-Verhalten für Terminal-Sessions

### Nutzerwert
Ab diesem Slice wird der Terminal-Teil zu einem echten Kernversprechen statt nur zu einem eingebetteten Einzelterminal.

### Warum dieser Slice separat bleibt
Slice 1 beweist das Grundgerüst. Slice 2 beweist, dass das Produkt als terminal-first Arbeitsumgebung ernsthaft nutzbar sein kann.

### Abhängigkeiten
- baut auf Slice 1 auf

### Priorität
**kritisch**

---

## Slice 3 — Dateien direkt im selben Raum
### Ziel
Terminal und Dateien ohne Toolbruch in derselben Arbeitsumgebung nutzbar machen.

### Enthalten
- Datei aus File Tree öffnen
- mehrere Datei-Tabs
- Textbearbeitung
- manuelles Speichern als Standard
- Undo / Redo
- Syntax Highlighting je nach Sprache
- Zeilennummern
- Suche innerhalb der geöffneten Datei

### Nutzerwert
Ab diesem Slice entsteht der zentrale Produktnutzen:
- Terminal nutzen
- Dateien direkt daneben öffnen
- Dateien ohne externen Editor bearbeiten

### Warum dieser Slice eigenständig bleibt
Datei-Handling und Editing sind ein großer Funktionsblock mit eigenem Nutzwert und sollten nicht im Terminal-Slice untergehen.

### Abhängigkeiten
- baut auf Slice 1 auf
- profitiert strukturell von Slice 2, ist aber logisch als eigener Arbeitsblock zu behandeln

### Priorität
**kritisch**

---

## Slice 4 — File Tree als Arbeitswerkzeug
### Ziel
Projektstruktur direkt im Workspace bearbeiten, ohne einen externen Dateimanager zu benötigen.

### Enthalten
- neue Datei
- neuer Ordner
- umbenennen
- löschen mit Bestätigung
- Drag & Drop zum Verschieben

### Nutzerwert
Der File Tree wird vom reinen Navigationsbereich zu einem echten Arbeitswerkzeug.

### Kritischer Hinweis
- endgültiges Löschen mit Bestätigung ist eine bewusst akzeptierte MVP-Entscheidung
- bleibt ein Risikopunkt und sollte später erneut geprüft werden

### Abhängigkeiten
- baut auf Slice 1 auf
- ergänzt Slice 3 sinnvoll, ist aber als eigener Struktur- und Operationsblock abgrenzbar

### Priorität
**wichtig**

---

## Slice 5 — Session-Änderungskern
### Ziel
Die App erhält ihr eigentliches Eigenprofil durch sessionbezogene Änderungslogik.

### Enthalten
- neue Session pro Projektöffnung
- Änderungen der aktuellen Session erfassen
- geänderte Dateien der aktuellen Session im File Tree markieren
- Diff-/Änderungsansicht als eigener Tab
- Diff read-only
- Vergleich alt/neu

### Nutzerwert
Ab diesem Slice ist die App nicht mehr nur ein minimalistischer Workspace, sondern ein sessionbasierter Arbeitsraum mit nachvollziehbaren Änderungen.

### Warum dieser Slice kritisch ist
Dieser Slice stiftet einen großen Teil der eigentlichen Produktidentität.

### Offene technische Frage
Wie Änderungen außerhalb direkter Bearbeitung verlässlich der Session zugeordnet werden, ist noch nicht final entschieden.

### Abhängigkeiten
- baut auf Slice 1 auf
- setzt Slice 3 praktisch voraus, weil Datei- und Änderungsbezug sonst zu schwach wäre
- profitiert von Slice 4, ist aber fachlich eigenständig

### Priorität
**kritisch**

---

## Slice 6 — Session-Historie
### Ziel
Vergangene Arbeit sichtbar machen und frühere Sessions wieder auffindbar machen.

### Enthalten
- Liste alter Sessions
- pro Session sichtbar: Name und Zeitstempel
- automatische Session-Benennung
- Session-Namen manuell änderbar
- Fallback für Session-Namen: Git-Branch + Zeitstempel
- alte Sessions öffnen mit Fokus auf damalige Änderungen und Dateien

### Nutzerwert
Der Nutzer kann frühere Arbeitsstände wiederfinden, ohne dass der MVP vollständige UI-Restoration leisten muss.

### Warum dieser Slice eigenständig bleibt
Er baut auf dem Session-Modell auf, erweitert dieses aber in Richtung Historie und Nachvollziehbarkeit. Das ist ein eigener Produktmeilenstein.

### Wichtige Abgrenzung
- keine harte Anforderung, alte Sessions 1:1 in derselben UI-Konstellation wiederherzustellen
- Fokus liegt auf Änderungen und Dateien, nicht auf exakter UI-Rekonstruktion

### Abhängigkeiten
- baut direkt auf Slice 5 auf

### Priorität
**wichtig**

---

## Prioritätenübersicht
### Kritisch
- Slice 1 — Workspace-Grundgerüst
- Slice 2 — Terminal-first Arbeitskern
- Slice 3 — Dateien direkt im selben Raum
- Slice 5 — Session-Änderungskern

### Wichtig
- Slice 4 — File Tree als Arbeitswerkzeug
- Slice 6 — Session-Historie

### Optional / bewusst später
- AI-spezifische Features
- globale Projektsuche
- spezielle Vorschau für nicht-textbasierte Dateien
- Remote-Workspaces
- tiefere Session-Restoration
- zusätzliche Panels / Tab-Typen
- Autosave als optionale Einstellung

---

## Empfohlene Build-Reihenfolge
1. Slice 1
2. Slice 2
3. Slice 3
4. Slice 4
5. Slice 5
6. Slice 6

## Warum diese Reihenfolge sinnvoll ist
- früh testbarer Einstieg ab Slice 1
- Terminal-first Nutzen wird vor Ausbau der restlichen Oberfläche bewiesen
- Datei-Handling folgt als nächster echter Produktnutzen
- File Tree-Operationen erweitern die Arbeitsfähigkeit
- Session-Änderungslogik gibt dem Produkt sein eigentliches Profil
- Historie kommt erst, wenn das aktive Session-Modell bereits funktioniert

---

## Definition eines guten Zwischenstands je Slice
### Nach Slice 1
Die App ist als einfacher lokaler Projekt-Workspace mit eingebettetem Terminal testbar.

### Nach Slice 2
Die App ist als terminal-first Arbeitsumgebung glaubwürdig nutzbar.

### Nach Slice 3
Die App liefert den Kernnutzen: Terminal + Dateien im selben Arbeitsraum.

### Nach Slice 4
Die Projektstruktur kann ohne externen Dateimanager bearbeitet werden.

### Nach Slice 5
Die App zeigt sessionbezogene Änderungen nachvollziehbar an und gewinnt ihr eigentliches Profil.

### Nach Slice 6
Die App unterstützt nicht nur aktuelle Arbeit, sondern auch die Rückkehr in vergangene Arbeitskontexte.

---

## Kritische Hinweise für die weitere Planung
1. Slice 5 ist produktstrategisch wichtiger, als seine technische Größe vielleicht zunächst vermuten lässt.
2. Slice 6 sollte erst umgesetzt werden, wenn Slice 5 in seiner Nutzerlogik klar funktioniert.
3. Endgültiges Löschen bleibt ein bewusst eingegangenes MVP-Risiko.
4. Die technische Umsetzung der Session-Änderungsverfolgung ist noch offen und muss vor Architekturentscheidungen sauber untersucht werden.
5. Die Differenzierung gegenüber bestehenden Tools sollte parallel zur Umsetzung sprachlich weiter geschärft werden.

## Kurzfazit
Der MVP sollte nicht als unstrukturierte Featureliste gebaut werden, sondern als Folge klarer Produktmeilensteine.

Die wichtigsten Nachweise sind dabei:
- funktioniert der Projekt-Workspace?
- ist die Terminal-Erfahrung überzeugend?
- fühlt sich Datei-Arbeit direkt im selben Raum wirklich besser an?
- liefert das Session-Änderungsmodell einen echten Mehrwert?

Wenn diese vier Punkte tragen, hat das Produkt eine belastbare Grundlage.