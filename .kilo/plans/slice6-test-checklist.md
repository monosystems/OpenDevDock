# Slice 6 - Manuelle Test-Checkliste

## Session-Historie erstellen

- [ ] Projekt öffnen (z.B. `/Users/max/Projekte/OpenDevDock`)
- [ ] Mehrere Dateien erstellen/bearbeiten/löschen
- [ ] Änderungen im Changes-Tab sehen (`◆ Changes` Button erscheint)
- [ ] Workspace schließen (← Back)
- [ ] Projekt in der Liste zeigt "Recent Sessions" mit 1 Eintrag

## Session wieder öffnen

- [ ] Auf Session-Eintrag klicken
- [ ] Workspace öffnet sich mit Session-Name im Header
- [ ] Changes-Tab öffnet sich **automatisch**
- [ ] Erwartete Änderungen werden im Diff angezeigt

## Session-Name ändern

- [ ] Doppelklick auf Session-Namen in der Liste
- [ ] Name ist editierbar
- [ ] Enter drücken speichert
- [ ] Name bleibt nach erneutem Öffnen erhalten

## Session löschen

- [ ] 🗑️ Button bei Session-Item hovern
- [ ] Auf 🗑️ klicken
- [ ] Bestätigungsdialog erscheint
- [ ] "OK" klicken → Session verschwindet aus Liste

## Git-Integration

- [ ] Ein Git-Repo als Projekt öffnen
- [ ] Session-Name enthält Branch-Namen, z.B. `projekt (main) - 02.04.2026 19:15`
- [ ] Ein Non-Git-Projekt öffnen
- [ ] Session-Name enthält nur Projektname und Zeitstempel

## Persistenz

- [ ] App schließen und neu starten
- [ ] Projekt auswählen
- [ ] Sessions erscheinen wieder in der Liste
- [ ] Alle Session-Metadaten (Name, Timestamp, Changes) sind korrekt

## Mehrere Sessions

- [ ] Projekt öffnen → Session 1
- [ ] Ändern → Schließen
- [ ] Projekt öffnen → Session 2
- [ ] Ändern → Schließen
- [ ] Projekt öffnen → Session 3
- [ ] Projekt öffnen → Session 4
- [ ] Drei Sessions in der Liste sehen (neueste zuerst)
- [ ] Alle Sessions bleiben gespeichert (auch > 3)
- [ ] Älteste Session wird NICHT gelöscht
- [ ] "Show all (X)" Button erscheint bei mehr als 3 Sessions
- [ ] Klick auf "Show all" öffnet Modal mit allen Sessions
- [ ] Modal kann mit × oder ESC geschlossen werden
- [ ] Klick außerhalb des Modals schließt es

## Edge Cases

- [ ] Leeres Projekt (keine Änderungen) → Session mit "0 changes"
- [ ] Sehr langer Session-Name → Text wird gekürzt mit `...`
- [ ] Session-Name leer lassen → Originalname bleibt erhalten
- [ ] Auf Projekt-Item klicken (nicht Session) → Neue Session wird erstellt

## UI/UX

- [ ] Hover-Effekt auf Session-Item sichtbar
- [ ] Aktionen-Buttons erscheinen bei Hover
- [ ] Edit-Input hat Fokus bei Doppelklick
- [ ] Stile konsistent mit App-Farbschema (Dunkelmodus)
