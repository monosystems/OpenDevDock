# Architecture Decision v0.1

## Status
Arbeitsstand nach gemeinsamer Grundsatzklärung

## Zweck des Dokuments
Dieses Dokument hält die bevorzugte technische Grundrichtung für den MVP fest.

Es beantwortet nicht jede Implementierungsfrage im Detail, sondern definiert:
- die architektonischen Leitplanken
- die bevorzugte Stack-Richtung
- die Gründe für diese Entscheidungen
- die wichtigsten offenen Punkte und echten Grenzthemen

---

## 1. Produktkontext
Das Produkt ist ein **terminal-zentrierter, sessionbasierter Developer Workspace** für lokale Projekte.

Der MVP soll insbesondere ermöglichen:
- Projekt-/Workspace-Auswahl
- lokales Projekt öffnen
- File Tree links
- tab-basierter Hauptbereich rechts
- mehrere echte Terminal-Tabs
- mehrere Datei-Tabs
- Datei-Bearbeitung in mittlerer Tiefe
- sessionbezogene Änderungsansicht
- Session-Historie

Die Architektur muss deshalb besonders gut mit folgenden Anforderungen umgehen können:
- echte lokale Systemintegration
- echtes Terminal-/PTY-Verhalten
- lokale Dateisystemarbeit
- stabiler Session- und UI-Zustand
- gute Performance
- Cross-Platform-Fähigkeit

---

## 2. Architekturziele

### Kritisch
- echtes, voll nutzbares Terminal ist nicht verhandelbar
- gute Performance und geringe Reibung im Alltagsgebrauch
- stabiler lokaler Projektkontext
- sauberes Innenleben statt verstreuter UI-Zustandslogik
- tragfähige Basis für Session-Modell und Änderungsverfolgung

### Wichtig
- plattformübergreifende Desktop-Fähigkeit
- lokal-first Architektur
- Offline-Nutzung möglichst gut, aber nicht als starre Dogma-Grenze
- Editor-/Dateibereich solide, aber nicht überentwickelt
- spätere Erweiterbarkeit um AI-/Monetarisierungsfunktionen ohne komplette Grundumbauten

### Optional
- niedrige Einstiegshürde für externe Open-Source-Contributors
- native Optik um jeden Preis

---

## 3. Bereits entschiedene Leitplanken

### Plattform
- Desktop-App
- direkt plattformübergreifend

### Produktprioritäten
- wenn nötig: Performance vor UI-/Entwicklungskomfort
- UI muss nicht maximal nativ wirken, sondern vor allem gut funktionieren
- lokal-first als klare Richtung
- Offline-Fähigkeit ist wünschenswert, aber keine harte Architekturgrenze

### Kernanforderungen
- echtes Terminal / PTY-Zugang ist Pflicht
- Editor-/Dateibereich im MVP mit mittlerer Tiefe
- zentrales State-Modell ist erwünscht
- Tendenz zu strukturierter lokaler Persistenz

---

## 4. Bewertete Grundrichtungen

### Option A — Electron-basierter Ansatz
#### Vorteile
- großes Ökosystem
- viele bekannte Patterns
- hohe UI-Produktivität
- viele bestehende Bibliotheken

#### Nachteile
- schwerer und ressourcenintensiver
- weniger passend zum Schlankheits- und Performance-Anspruch des Produkts
- höheres Risiko eines „Web-App-im-Desktopfenster“-Gefühls

#### Bewertung
Machbar, aber nur mittel passend zur eigentlichen Produktidentität.

---

### Option B — Tauri-basierter Ansatz
#### Vorteile
- schlanker und systemnäher als Electron
- deutlich bessere Passung zum Performance-Anspruch
- gute Grundlage für lokal-first Desktop-Workflows
- plattformübergreifend attraktiv
- guter Mittelweg zwischen Praxisnähe und technischer Disziplin

#### Nachteile
- anspruchsvoller als die bequemsten Desktop-Stacks
- Terminal- und Systemintegration müssen bewusst sauber entworfen werden
- etwas mehr Architekturdisziplin erforderlich

#### Bewertung
Beste Gesamtpassung für den MVP.

---

### Option C — stärker native/systemnahe Ansätze
#### Vorteile
- maximale Kontrolle über Performance und Systemintegration
- potenziell stärkste technische Grundlage für tiefe Desktop-Nähe

#### Nachteile
- deutlich höherer Initialaufwand
- schwerer plattformübergreifend zu entwickeln
- höheres Risiko, den MVP technisch zu überladen

#### Bewertung
Langfristig denkbar, für den aktuellen MVP aber wahrscheinlich zu schwergewichtig.

---

## 5. Architekturentscheidung

### Bevorzugte Grundrichtung
**Tauri** wird als bevorzugte Desktop-Hülle für den MVP festgehalten.

### Begründung
Tauri bietet im aktuellen Kontext den besten Mittelweg zwischen:
- Performance
- Desktop-/Systemnähe
- lokal-first Produktlogik
- plattformübergreifender Umsetzbarkeit
- praktikabler UI-Entwicklung

Electron wurde bewusst nicht bevorzugt, weil die Produktidentität stark auf Schlankheit, Performance und geringen Overhead setzt.

Stärker native Ansätze wurden bewusst nicht bevorzugt, weil sie den MVP derzeit unnötig aufladen würden.

---

## 6. Bevorzugter MVP-Stack

### Desktop-Hülle
- **Tauri**

### Frontend
- **React**

### Lokale Persistenz
- **SQLite** als wahrscheinliche Richtung für strukturierte lokale Persistenz

### State-Strategie
- zentrales State-Modell
- keine verteilte, zufällige UI-Zustandslogik als Hauptansatz

### Terminal-/Systemintegration
- echter PTY-/System-Shell-Zugang als Pflichtanforderung
- Terminal-Implementierung darf nicht nur simuliert oder halb interaktiv sein

---

## 7. Empfohlenes Architekturmodell

### 7.1 Trennung der Hauptschichten
Die App sollte logisch in mindestens vier Schichten getrennt werden:

#### 1. UI-Schicht
Verantwortlich für:
- Projektliste
- File Tree
- Tabs
- Editoransichten
- Diff-Ansicht
- Session-Liste

#### 2. zentraler App-/Core-State
Verantwortlich für:
- aktives Projekt
- offene Tabs
- aktive Session
- Session-Metadaten
- Zuordnung von Änderungen
- UI-relevante Kernzustände

#### 3. System- und Terminal-Schicht
Verantwortlich für:
- PTY-/Shell-Integration
- Prozessverwaltung für Terminal-Sessions
- Dateisystemoperationen
- plattformspezifische Systemanbindung

#### 4. Persistenzschicht
Verantwortlich für:
- Projekte/Workspace-Liste
- Session-Metadaten
- Session-Historie
- Zuordnung von Änderungsinformationen
- weitere lokale strukturierte Zustände

---

### 7.2 Warum diese Trennung wichtig ist
Diese Trennung hilft dabei, dass:
- Session-Logik nicht in UI-Komponenten zerfällt
- Terminal-Logik und UI nicht unnötig eng gekoppelt werden
- Persistenz nicht chaotisch über verschiedene Teile verteilt wird
- spätere Erweiterungen auf einer sauberen Grundlage aufbauen

Gerade für dieses Produkt ist das wichtig, weil Terminal, Sessions und Änderungsverfolgung keine reinen UI-Themen sind, sondern Kernlogik.

---

## 8. Persistenzentscheidung: Richtung

### Vorläufige Richtung
**Strukturierte lokale Persistenz wird bevorzugt.**

### Wahrscheinliche Technologie
**SQLite** ist aktuell die bevorzugte Richtung.

### Begründung
Einfache Dateiablagen wären zwar zunächst leichter, aber voraussichtlich zu schwach für:
- Session-Historie
- Session-Metadaten
- Änderungszuordnung
- spätere Erweiterbarkeit
- robustes lokales Datenmodell

SQLite bietet hier voraussichtlich den besseren Mittelweg aus:
- lokaler Kontrolle
- strukturierter Datenhaltung
- Robustheit
- späterer Erweiterbarkeit

### Noch offen
- genaues Schema
- Abgrenzung zwischen Datenbankdaten und dateibasierten Konfigurationsdateien
- welche Informationen zusätzlich bewusst transparent als Dateien gespeichert werden sollen

---

## 9. Terminalentscheidung: nicht verhandelbarer Kern

### Festlegung
Das Terminal im MVP muss ein **echtes, voll nutzbares Terminal** sein.

### Das bedeutet konkret
- echte Shell-Prozesse
- echtes interaktives Verhalten
- Eignung für reale CLI-Tools
- keine rein simulierte Konsole
- keine „Output-Ansicht mit Eingabefeld“ als Pseudolösung

### Begründung
Das Produkt ist terminal-first. Wenn das Terminal nicht belastbar ist, leidet der Kern des gesamten Produkts.

### Konsequenz
Bei jeder weiteren Architektur- oder Bibliotheksentscheidung muss geprüft werden, ob diese Terminalanforderung sauber getragen wird.

---

## 10. Editor-/Dateibereich: bewusst begrenzte Tiefe

### Festlegung
Der Editor-/Dateibereich soll im MVP solide, aber bewusst nicht überentwickelt sein.

### Bedeutet für den MVP
- normale textbasierte Alltagsbearbeitung
- kein vollständiger IDE-Ersatz
- keine überzogenen Spezialeditor-Anforderungen in Version 1

### Architektonische Konsequenz
Die Architektur soll den Editorbereich nicht künstlich vernachlässigen, aber auch nicht zum dominierenden Kern ausbauen. Das Schwergewicht liegt auf Terminal, Session-Modell und Gesamtarbeitsfluss.

---

## 11. Lokal-first und spätere Monetarisierung

### Festlegung
Die Architektur soll lokal-first sein.

### Präzisierung
Offline-Fähigkeit ist erwünscht, aber nicht als starre harte Systemgrenze formuliert.

### Begründung
Diese Richtung:
- passt zum Produktkern
- unterstützt lokale Projektarbeit sauber
- reduziert frühe Betriebs- und Cloud-Komplexität
- hält spätere Monetarisierung über Zusatzfunktionen offen

### Architektonische Folgerung
Die Grundfunktionen dürfen nicht von einer Cloud-Infrastruktur abhängen.
Gleichzeitig sollte die Architektur spätere Online-/Premium-Funktionen nicht unnötig verbauen.

---

## 12. Echte Grenzthemen und zu beachtende Punkte

### Kritisch
1. **Terminalintegration ist erfolgskritisch.**
2. **Cross-Platform-Details werden im Kernbereich mitgedacht werden müssen, nicht nur im UI.**
3. **Der zentrale State muss sauber modelliert sein, damit das Produkt konsistent bleibt.**
4. **Der Editorbereich darf den Fokus des Produkts nicht unbemerkt verschieben.**

### Wichtig
5. **Session- und Änderungsmodell sollten sauber geschnitten werden, damit der MVP nicht unnötig aufgebläht wird.**
6. **Persistenzmodell und Session-Historie sollten früh logisch zusammenpassen.**
7. **Die Trennung zwischen UI, Core, Terminalintegration und Persistenz sollte diszipliniert eingehalten werden.**

---

## 13. Offene technische Entscheidungen
1. Welche konkrete PTY-/Terminal-Integration passt am besten zur Tauri-Richtung?
2. Wie wird Session-Änderungsverfolgung technisch modelliert?
3. Welche State-Lösung wird im React-Frontend konkret verwendet?
4. Wie genau wird SQLite strukturell eingebunden?
5. Welche Teile des Zustands gehören in Datenbank, welche nur in flüchtigen Runtime-State?
6. Wie werden plattformabhängige Unterschiede bei Shell, Pfaden und Terminalverhalten abstrahiert?
7. Welche Editor-Technologie liefert die gewünschte mittlere Tiefe ohne unnötigen Overhead?

---

## 14. Empfohlene nächste Architektur-Schritte

### Kritisch
1. Tauri-Grundsetup aufsetzen
2. PTY-/Terminal-Integrationsoptionen konkret evaluieren
3. grobes Core-State-Modell definieren
4. Session-Datenmodell skizzieren
5. Grenzen zwischen Runtime-State und Persistenz sauber schneiden

### Wichtig
6. SQLite als lokale Persistenz konkret prüfen
7. Editor-Technologie gegen MVP-Anforderungen prüfen
8. Cross-Platform-Besonderheiten für Terminal und Dateisystem sichtbar machen

### Optional
9. UI-Component-System festlegen
10. spätere Online-/Premium-Erweiterungspunkte architektonisch markieren

---

## Kurzfazit
Die aktuell bevorzugte Architektur für den MVP ist:
- **Tauri** als Desktop-Hülle
- **React** im Frontend
- **zentrales State-Modell**
- **echtes Terminal / PTY als Pflichtkern**
- **SQLite als wahrscheinliche Richtung für strukturierte lokale Persistenz**

Diese Richtung ist deshalb passend, weil sie den eigentlichen Charakter des Produkts trägt:
kein bloßer Desktop-Wrapper, keine halbe IDE und keine Cloud-zentrierte Plattform, sondern ein schlanker, lokaler, terminal-zentrierter Developer Workspace mit belastbarer Session-Logik.
