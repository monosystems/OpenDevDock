# Product Brief v0.1

## Projekt
Terminal-First Developer Workspace

## Status
Arbeitsentwurf / frühe Planungsphase

## Kontext
Dieses Produkt soll eine schlanke, performante Arbeitssoftware für Entwickler werden, die zwischen einem reinen Terminal-Setup und einer voll ausgestatteten IDE wie VS Code liegt. Der Fokus liegt auf projektbezogener Arbeit mit möglichst wenig Kontextwechseln zwischen Terminal, Dateien, Vorschau und einfachem Editing.

## Problem
Viele Entwickler arbeiten täglich mit mehreren Fenstern und Werkzeugen gleichzeitig:
- Terminal
- Editor oder IDE
- Dateimanager
- Datei-Vorschau
- KI-Tools oder agentische Coding-Tools

Dadurch entstehen mehrere Probleme:
- häufiger Kontextwechsel
- visueller und mentaler Overhead
- unnötige Reibung im Workflow
- zu viel Komplexität für Nutzer, denen klassische IDEs zu schwer sind
- zu wenig Struktur für Nutzer, denen ein reines Terminal nicht ausreicht

## Zielgruppe
### Primäre Zielgruppe
- Entwickler mit terminal-nahem Arbeitsstil
- Nutzer, denen VS Code oder ähnlich umfangreiche IDE-Setups zu überladen sind
- Nutzer, denen das reine Terminal zu wenig Struktur bietet
- technische Solo-Builder, Indie Hacker und fokussierte Einzelentwickler

### Sekundäre Zielgruppe
- Entwickler, die KI-gestützte Coding-Workflows nutzen
- Nutzer, die einen projektzentrierten statt tool-zentrierten Workspace bevorzugen

## Produktkategorie
Developer Workspace

## Produktversprechen
Ein minimalistischer, terminal-zentrierter Developer Workspace für Nutzer, denen VS Code zu viel und ein reines Terminal zu wenig ist.

## Kernnutzen
- weniger Fensterwechsel
- geringere kognitive Last
- schneller Zugriff auf projektbezogene Dateien und Arbeitsbereiche
- Fokus auf die wesentlichen workflow-kritischen Funktionen
- performanteres, schlankeres Arbeiten als in überladenen IDE-Setups

## Positionierung
Das Produkt ist kein kompletter IDE-Ersatz. Es ist eine bewusst fokussierte Alternative für Entwickler, die schneller, schlanker und terminal-näher arbeiten wollen.

## Nicht-Ziele
### Kritisch bewusst ausgeschlossen
- kein vollständiger IDE-Ersatz
- kein unendliches Plugin-System im MVP
- keine vollständige Team-Kollaborationsplattform
- keine Projektmanagement-Suite
- keine Deployment- oder DevOps-Komplettlösung
- keine maximale Layout-Freiheit im ersten Schritt

### Vorläufig nicht im MVP
- komplexe Git-Visualisierung
- integrierte Multi-Agent-Orchestrierung
- Marketplace oder Erweiterungsökosystem
- stark ausgedehnte Integrationen in externe Dienste

## Produktprinzipien
### Kritisch
- terminal first
- projektfokussiert statt global überladen
- wenige, starke Defaults
- Performance und Direktheit vor Feature-Masse

### Wichtig
- modular, aber nicht beliebig
- lesbar und fokussiert statt verspielt
- einfache, vorhersehbare Bedienung
- lokale Projektarbeit klar im Zentrum

### Optional
- AI-ready Architektur
- spätere Workspace-Presets für verschiedene Nutzertypen
- spätere zusätzliche Ansichten je nach Workflow

## MVP-Scope
### Muss enthalten sein
1. Projektgebundene Oberfläche
   - Ein Nutzer öffnet ein Projekt in einem klar begrenzten Workspace

2. File Tree
   - standardmäßig links sichtbar
   - schneller Zugriff auf Projektdateien

3. Terminal als Kernfläche
   - stabil, schnell und zentral nutzbar

4. Datei-Vorschau
   - schnelles Öffnen und Lesen von Dateien innerhalb des Projekts

5. Einfaches Datei-Editing
   - ausreichend für kleine bis mittlere Änderungen
   - kein Anspruch auf vollständige IDE-Funktionalität

6. Zuschaltbare Ansichten
   - einige klar definierte Panels oder Views
   - bewusst begrenzte Anpassbarkeit im MVP

## Kern-Use-Cases
1. Ein Entwickler öffnet ein Projekt und arbeitet überwiegend im Terminal, ohne ständig zwischen Apps zu wechseln.
2. Ein Entwickler navigiert im File Tree, öffnet eine Datei zur Vorschau und nimmt kleine Änderungen direkt im Workspace vor.
3. Ein Entwickler hält Terminal, Dateiansicht und projektrelevante Informationen in einer fokussierten Oberfläche zusammen.
4. Ein Nutzer reduziert IDE-Ballast, ohne auf grundlegende Projektstruktur und Bedienkomfort zu verzichten.

## Differenzierungshypothesen
1. Der größte Unterschied ist nicht bloß Feature-Bündelung, sondern die Qualität eines fokussierten, terminal-zentrierten Arbeitsflusses.
2. Nutzer mit Ablehnung gegen überladene IDEs bevorzugen ein reduziertes, projektgebundenes Setup mit guten Defaults.
3. Ein klar begrenzter Workspace kann mentalen Overhead wirksamer reduzieren als ein allgemein konfigurierbares Großtool.

## Größte Risiken
### Kritisch
- Die Differenzierung gegenüber VS Code, Cursor oder ähnlichen Tools bleibt zu schwach.
- Das Produkt wird durch Anpassbarkeit und Zusatzfeatures wieder selbst zu komplex.
- Der Nutzen wird als „nice to have“ statt als echte Workflow-Verbesserung wahrgenommen.

### Wichtig
- Die Zielgruppe wird zu breit adressiert.
- Das Produkt gerät zwischen Terminal-Purismus und IDE-Erwartungen in eine unklare Mitte.
- Zu viele Funktionen werden zu früh in den MVP aufgenommen.

## Offene Fragen
1. Wer ist der erste eng definierte Einstiegsnutzer?
2. Welche Ansichten sind wirklich workflow-kritisch und welche nur optional?
3. Welche konkreten Arbeitsabläufe sollen im MVP besonders gut unterstützt werden?
4. Welche technische Plattform eignet sich für Performance, lokale Integration und Dateiarbeit am besten?
5. Wie wird das Produkt klar von bestehenden IDE-Setups abgegrenzt?

## Empfohlene nächste Schritte
### Kritisch
1. Zielgruppe weiter zuspitzen
2. Top-3 Use-Cases priorisieren
3. MVP-Funktionsumfang weiter reduzieren und klar abgrenzen
4. Vergleich zu VS Code, Cursor und reinem Terminal explizit ausarbeiten

### Wichtig
5. Erste Produktarchitektur grob skizzieren
6. UI-Layout-Prinzipien definieren
7. Validierungshypothesen und Interviewfragen formulieren

### Optional
8. Namensfindung
9. erste Wireframes
10. grobe Roadmap nach MVP

## Kurzfazit
Das Produkt hat Potenzial als fokussierte Alternative zwischen überladenen IDEs und einem zu spartanischen Terminal-Setup. Die Stärke liegt wahrscheinlich nicht in maximalem Funktionsumfang, sondern in einer klaren, performanten und terminal-zentrierten Arbeitsumgebung mit guten Standardansichten und bewusst gesetzten Grenzen.
