# Frontend Verbesserungen - Technische Spezifikation

## Status: ✅ Implementiert

---

## 1. Kritische Probleme (Sofort beheben)

### 1.1 Memory Leak in Terminal.tsx

**Datei:** `src/components/Terminal.tsx`
**Schwere:** Hoch
**Aufwand:** 30 Minuten

#### Problem
Der Tauri Event Listener `unlisten` wird bei Komponenten-Unmount niemals aufgerufen. Bei häufigem Öffnen/Schließen von Terminal-Tabs wächst der Speicher kontinuierlich.

**Betroffener Code (Zeile 91-100):**
```typescript
listen<{ id: string; data: string }>(
  "terminal-output",
  (event) => { ... }
).then((unlisten) => {
  instance.unlisten = unlisten;  // Wird nie aufgerufen!
});
```

#### Lösung
1. `instance.unlisten` bei Cleanup aufrufen
2. Terminal-Registry bei Tab-Schließung bereinigen

**Änderung in Terminal.tsx:**
```typescript
useEffect(() => {
  // ... bestehender Code ...
  
  return () => {
    // Cleanup
    resizeObserver.disconnect();
    if (instance.unlisten) {
      instance.unlisten();  // NEU
    }
    terminalRegistry.delete(terminalId);  // NEU
    openedTerminals.delete(terminalId);     // NEU
  };
}, [terminalId]);
```

### 1.2 Debug-Logs Produktion

**Dateien:** 
- `src/components/FileTree.tsx:24` - `console.log("[FILETREE DEBUG V3 LOADED]")`
- `src/components/Terminal.tsx:103` - `console.log("[Terminal] onData:", ...)`
- `src/views/WorkspaceView.tsx:283,286` - `console.log("[WorkspaceView]")`

**Schwere:** Niedrig (aber peinlich bei Demo)
**Aufwand:** 10 Minuten

#### Lösung
Alle `console.log` mit DEBUG-Präfix durch Production-Logging ersetzen oder entfernen.

---

## 2. Performance-Probleme

### 2.1 Polling in FileTree.tsx

**Datei:** `src/components/FileTree.tsx:30-39`
**Schwere:** Mittel
**Aufwand:** 1 Stunde

#### Problem
```typescript
const interval = setInterval(updateClipboard, 500);  // Polling alle 500ms!
```
Module-level `clipboardNode` und `clipboardAction` werden alle 500ms abgefragt.

#### Lösung
1. Clipboard-State in React Context verschieben
2. Polling entfernen
3. State direkt bei Cut/Copy/Paste-Operationen aktualisieren

**Neue Struktur:**
```typescript
// ClipboardContext.tsx erstellen
interface ClipboardState {
  node: FileNode | null;
  action: "cut" | "copy" | null;
}

const ClipboardContext = createContext<ClipboardState>({ node: null, action: null });
```

### 2.2 WorkspaceView.tsx Größe

**Datei:** `src/views/WorkspaceView.tsx` (511 Zeilen)
**Schwere:** Mittel
**Aufwand:** 3-4 Stunden

#### Problem
Die Komponente macht zu viel:
- Tab-Management
- FileTree-Event-Handler
- Terminal-Integration
- Resize-Logik
- File-Operationen

#### Lösung: Aufteilung in kleinere Komponenten

```
src/components/
├── TabBar.tsx           # Tab-Liste, aktiver Tab, Tabs schließen/neu
├── TabContent.tsx       # Renderlogik für terminal/file/changes
├── Resizer.tsx          # Resize-Handling zwischen FileTree und Main
└── EditorTab.tsx        # (existiert bereits, behalten)
```

**TabBar.tsx - Vorschlag:**
```typescript
interface TabBarProps {
  tabs: TabItem[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabRename: (tabId: string, newTitle: string) => void;
  onAddTerminal: () => void;
  hasChanges: boolean;
  onOpenChangesTab: () => void;
}
```

---

## 3. Accessibility

### 3.1 Tabs ARIA-Attributes

**Datei:** `src/views/WorkspaceView.tsx:414-446`
**Schwere:** Mittel
**Aufwand:** 1 Stunde

#### Aktuell
```tsx
<div className="tab" onClick={() => setActiveTabId(tab.id)}>
```

#### Lösung
```tsx
<div 
  role="tab"
  id={`tab-${tab.id}`}
  aria-selected={tab.id === activeTabId}
  aria-controls={`panel-${tab.id}`}
  tabIndex={tab.id === activeTabId ? 0 : -1}
  className={`tab ${tab.id === activeTabId ? "active" : ""}`}
  onClick={() => setActiveTabId(tab.id)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      setActiveTabId(tab.id);
    }
  }}
>
```

### 3.2 Tab-Panel ARIA

```tsx
<div 
  role="tabpanel"
  id={`panel-${tab.id}`}
  aria-labelledby={`tab-${tab.id}`}
  hidden={tab.id !== activeTabId}
>
```

### 3.3 Context Menu Keyboard-Support

**Datei:** `src/components/FileTree.tsx`
**Schwere:** Mittel
**Aufwand:** 2 Stunden

#### Anforderungen
- `Escape` schließt Context Menu
- `Pfeiltasten` navigieren zwischen Items
- `Enter` wählt aus
- Focus-Management

#### Lösung
```tsx
const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

// Bei Öffnung: erstes Item fokussieren
useEffect(() => {
  if (contextMenu) {
    menuItemsRef.current[0]?.focus();
  }
}, [contextMenu]);

// Keyboard-Handler
const handleMenuKeyDown = (e: React.KeyboardEvent, index: number) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    menuItemsRef.current[index + 1]?.focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    menuItemsRef.current[index - 1]?.focus();
  } else if (e.key === "Escape") {
    setContextMenu(null);
  }
};
```

---

## 4. Fehlerbehandlung

### 4.1 Inkonsistente Error-Handling

**Problem:** Mix aus `alert()`, `console.error()` und keiner Rückmeldung

**Betroffene Stellen:**
- `WorkspaceView.tsx:291` - `alert(\`Fehler beim Erstellen der Datei: ${e}\`)`
- `WorkspaceView.tsx:304` - `alert(\`Fehler beim Erstellen des Ordners: ${e}\`)`
- Mehrere `catch` mit nur `console.error`

#### Lösung
1. Error Boundary Component erstellen
2. Toast/Notification System für User-Feedback
3. `alert()` komplett entfernen

**Toast Component (Vorschlag):**
```typescript
interface ToastProps {
  message: string;
  type: "error" | "success" | "info";
  duration?: number;
}

// Verwendung:
toast.error("Fehler beim Erstellen der Datei");
toast.success("Datei erfolgreich gespeichert");
```

### 4.2 Error Boundary Implementation

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Etwas ist schiefgelaufen</h2>
          <button onClick={() => window.location.reload()}>
            App neu laden
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 5. UX-Verbesserungen

### 5.1 Tab Overflow Handling

**Datei:** `src/styles.css`
**Schwere:** Niedrig
**Aufwand:** 30 Minuten

#### Problem
Bei vielen Tabs keine Scroll-Indikatoren sichtbar.

#### Lösung
```css
.tabs-list {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-container-highest) transparent;
}

.tabs-list::-webkit-scrollbar {
  height: 4px;
}

.tabs-list::-webkit-scrollbar-thumb {
  background: var(--surface-container-highest);
  border-radius: 2px;
}
```

### 5.2 Inline Tab Rename

**Datei:** `src/views/WorkspaceView.tsx:421-425`
**Schwere:** Niedrig
**Aufwand:** 2 Stunden

#### Problem
```tsx
onDoubleClick={() => {
  if (tab.type === "terminal") {
    const newTitle = prompt("Rename tab:", tab.title);  // window.prompt!
    if (newTitle) handleRenameTab(tab.id, newTitle);
  }
}}
```

#### Lösung
- Double-Click öffnet Inline-Input
- Enter bestätigt, Escape abbricht
- Klick außerhalb bricht ab

### 5.3 Auto-Save Option

**Datei:** `src/components/EditorTab.tsx`
**Schwere:** Mittel
**Aufwand:** 3 Stunden

#### Implementierung
```typescript
interface EditorTabProps {
  // ... bestehende Props
  autoSave?: boolean;
  autoSaveDelay?: number; // ms, default 2000
}

const handleChange: OnChange = useCallback((value) => {
  // ... bestehender Code
  
  if (autoSave) {
    debouncedSave.current = setTimeout(() => {
      handleSave();
    }, autoSaveDelay);
  }
}, [autoSave, autoSaveDelay, /* ... */]);
```

---

## 6. Code Quality

### 6.1 TypeScript: `unknown` statt `any`

**Mehrere Stellen** - `e: any` in Catch-Blöcken

#### Ändern zu:
```typescript
catch (e: unknown) {
  console.error("Failed to read file:", e);
  if (e instanceof Error) {
    setError(\`Failed to load file: \${e.message}\`);
  }
}
```

### 6.2 Konfigurierbare Terminal-Font-Size

**Datei:** `src/components/Terminal.tsx:58`

#### Problem
```typescript
fontSize: 14,  // Hardcoded
```

#### Lösung
CSS Custom Property oder Config:
```typescript
const fontSize = getComputedStyle(document.documentElement)
  .getPropertyValue('--terminal-font-size') || '14';
```

### 6.3 Monaco Editor Init Fehlerbehandlung

**Datei:** `src/components/EditorTab.tsx:5-39`

#### Problem
Keine Fehlerbehandlung bei `loader.init()`.

#### Lösung
```typescript
loader.init()
  .then((monaco) => { /* bestehender Code */ })
  .catch((e) => {
    console.error("Failed to initialize Monaco:", e);
    // Fallback zu Basic-Editor oder Error-State
  });
```

---

## 7. Priorisierte Umsetzungsreihenfolge

| Priorität | Aufgabe | Aufwand | Status |
|-----------|---------|---------|--------|
| 1 | Debug-Logs entfernen | 10 min | ✅ Erledigt |
| 2 | Terminal Memory Leak fix | 30 min | ✅ Erledigt |
| 3 | TypeScript `any` → `unknown` | 30 min | ✅ Erledigt |
| 4 | Error Boundary | 2 h | ✅ Erledigt |
| 5 | Clipboard Polling entfernen | 1 h | ✅ Erledigt |
| 6 | Tabs ARIA | 1 h | ✅ Erledigt |
| 7 | Toast/Notification System | 2 h | ✅ Erledigt |
| 8 | Context Menu Keyboard | 2 h | ✅ Erledigt |
| 9 | WorkspaceView aufteilen | 3-4 h | ✅ Erledigt |
| 10 | Inline Tab Rename | 2 h | ✅ Erledigt |
| 11 | Auto-Save Option | 3 h | ✅ Erledigt |
| 12 | Unit Tests | 2 h | ✅ Erledigt |

---

## 8. Testing Anforderungen

### 8.1 Unit Tests (✅ Implementiert)

| Testdatei | Tests | Abdeckung |
|-----------|-------|-----------|
| `src/utils/diff.test.ts` | 16 | `computeDiff`, `getChangeTypeLabel`, `getChangeTypeIcon` |
| `src/hooks/useSession.test.ts` | 10 | `getStorageKey`, `loadSessionsFromStorage`, `saveSessionsToStorage` |
| `src/commands/fileOperations.test.ts` | 12 | Alle Tauri-Command-Wrapper |

**Testausführung:**
```bash
pnpm vitest run src/utils/diff.test.ts
pnpm vitest run src/hooks/useSession.test.ts
pnpm vitest run src/commands/fileOperations.test.ts
```

### 8.2 Integration Tests (Geplant)
- Tab-Öffnen/Schließen
- FileTree CRUD-Operationen
- Session-Erstellung und -Wiederherstellung

### 8.3 E2E Tests (Zukünftig)
- Projekt öffnen → Datei editieren → speichern
- Terminal bedienen
- Session-Historie durchsuchen

---

## 9. Dateistruktur Ziel

```
src/
├── components/
│   ├── ui/                    # NEU: Generische UI-Komponenten
│   │   ├── Button.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   └── ErrorBoundary.tsx
│   ├── TabBar.tsx             # NEU: Extracted aus WorkspaceView
│   ├── TabContent.tsx         # NEU: Tab-Rendering-Logik
│   ├── Resizer.tsx            # NEU: Resize-Handling
│   ├── FileTree.tsx           # (existiert)
│   ├── EditorTab.tsx          # (existiert)
│   ├── Terminal.tsx          # (existiert)
│   ├── ChangesTab.tsx         # (existiert)
│   └── SessionHistoryList.tsx
├── contexts/
│   ├── ClipboardContext.tsx   # NEU
│   └── ToastContext.tsx      # NEU
├── hooks/
│   ├── useSession.ts          # (existiert)
│   └── useTerminalManager.ts # (existiert)
├── views/
│   ├── StartView.tsx          # (existiert)
│   └── WorkspaceView.tsx     # (sollte schlanker werden)
├── commands/                  # (existiert)
├── state/                     # (existiert)
├── styles.css                 # (existiert)
└── App.tsx                    # (existiert)
```

---

## 10. Referenzen

- [React Accessibility Guide](https://react.dev/learn/accessibility)
- [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [MDN: Keyboard Navigation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_interactive_widgets)
- [Tauri Security Best Practices](https://tauri.app/docs/security/)
