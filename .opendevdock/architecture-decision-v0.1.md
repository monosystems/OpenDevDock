# Architecture Decision v0.1

## Status
Working state after joint fundamental clarification

## Purpose of This Document
This document records the preferred technical direction for the MVP.

It does not answer every implementation question in detail, but defines:
- the architectural guardrails
- the preferred stack direction
- the reasons for these decisions
- the most important open points and genuine borderline issues

---

## 1. Product Context
The product is a **terminal-first, session-based Developer Workspace** for local projects.

The MVP shall in particular enable:
- Project/Workspace selection
- Open local project
- File Tree on the left
- Tab-based main area on the right
- Multiple real terminal tabs
- Multiple file tabs
- File editing at intermediate depth
- Session-related change view
- Session history

The architecture must therefore handle particularly well the following requirements:
- Real local system integration
- Real terminal/PTY behavior
- Local file system work
- Stable session and UI state
- Good performance
- Cross-platform capability

---

## 2. Architecture Goals

### Critical
- Real, fully usable terminal is non-negotiable
- Good performance and low friction in everyday use
- Stable local project context
- Clean internals instead of scattered UI state logic
- Viable foundation for session model and change tracking

### Important
- Cross-platform desktop capability
- Local-first architecture
- Offline usage as good as possible, but not as a rigid dogmatic boundary
- Editor/file area solid, but not over-engineered
- Later extensibility for AI/monetization features without complete restructuring

### Optional
- Low barrier for external open-source contributors
- Native look at any cost

---

## 3. Already-Decided Guardrails

### Platform
- Desktop app
- Directly cross-platform

### Product Priorities
- if necessary: Performance before UI/development convenience
- UI does not need to look maximally native, but above all must work well
- Local-first as clear direction
- Offline capability is desirable, but not a hard architectural boundary

### Core Requirements
- Real terminal/PTY access is mandatory
- Editor/file area in MVP at intermediate depth
- Central state model is desirable
- Tendency toward structured local persistence

---

## 4. Evaluated Directions

### Option A — Electron-based Approach
#### Advantages
- Large ecosystem
- Many known patterns
- High UI productivity
- Many existing libraries

#### Disadvantages
- Heavier and more resource-intensive
- Less fitting for the product's lean and performance aspirations
- Higher risk of a "web app in a desktop window" feel

#### Assessment
Viable, but only moderately fitting for the actual product identity.

---

### Option B — Tauri-based Approach
#### Advantages
- Leaner and closer to the system than Electron
- Significantly better fit for performance aspirations
- Good foundation for local-first desktop workflows
- Cross-platform attractive
- Good balance between practical closeness and technical discipline

#### Disadvantages
- More demanding than the most convenient desktop stacks
- Terminal and system integration must be deliberately designed cleanly
- Somewhat more architectural discipline required

#### Assessment
Best overall fit for the MVP.

---

### Option C — More native/system-close approaches
#### Advantages
- Maximum control over performance and system integration
- Potentially strongest technical foundation for deep desktop proximity

#### Disadvantages
- Significantly higher initial effort
- Harder to develop cross-platform
- Higher risk of technically overloading the MVP

#### Assessment
Conceivable in the long term, but probably too heavyweight for the current MVP.

---

## 5. Architecture Decision

### Preferred Direction
**Tauri** is retained as the preferred desktop shell for the MVP.

### Rationale
Tauri offers the best balance in the current context between:
- Performance
- Desktop/system proximity
- Local-first product logic
- Cross-platform implementability
- Practical UI development

Electron was deliberately not preferred because the product identity strongly emphasizes lean-ness, performance, and low overhead.

More native approaches were deliberately not preferred because they would unnecessarily burden the MVP at this time.

---

## 6. Preferred MVP Stack

### Desktop Shell
- **Tauri**

### Frontend
- **React**

### Local Persistence
- **SQLite** as the likely direction for structured local persistence

### State Strategy
- Central state model
- No distributed, random UI state logic as the main approach

### Terminal/System Integration
- Real PTY/system shell access as a mandatory requirement
- Terminal implementation must not be merely simulated or half-interactive

---

## 7. Recommended Architecture Model

### 7.1 Separation of Main Layers
The app should be logically separated into at least four layers:

#### 1. UI Layer
Responsible for:
- Project list
- File Tree
- Tabs
- Editor views
- Diff view
- Session list

#### 2. Central App/Core State
Responsible for:
- Active project
- Open tabs
- Active session
- Session metadata
- Mapping of changes
- UI-relevant core states

#### 3. System and Terminal Layer
Responsible for:
- PTY/shell integration
- Process management for terminal sessions
- File system operations
- Platform-specific system binding

#### 4. Persistence Layer
Responsible for:
- Projects/Workspace list
- Session metadata
- Session history
- Mapping of change information
- Other local structured states

---

### 7.2 Why This Separation Matters
This separation helps ensure that:
- Session logic does not dissolve into UI components
- Terminal logic and UI are not unnecessarily tightly coupled
- Persistence is not chaotically distributed across various parts
- Later extensions build on a clean foundation

This is particularly important for this product because terminal, sessions, and change tracking are not purely UI topics, but core logic.

---

## 8. Persistence Decision: Direction

### Preliminary Direction
**Structured local persistence is preferred.**

### Likely Technology
**SQLite** is currently the preferred direction.

### Rationale
Simple file storage would initially be easier, but probably too weak for:
- Session history
- Session metadata
- Change mapping
- Later extensibility
- Robust local data model

SQLite here will likely offer the better balance of:
- Local control
- Structured data storage
- Robustness
- Later extensibility

### Still Open
- Exact schema
- Boundary between database data and file-based configuration files
- Which information should additionally be consciously stored transparently as files

---

## 9. Terminal Decision: Non-Negotiable Core

### Determination
The terminal in the MVP must be a **real, fully usable terminal**.

### What This Means Specifically
- Real shell processes
- Real interactive behavior
- Suitable for real CLI tools
- Not a purely simulated console
- No "output view with input field" as a pseudo-solution

### Rationale
The product is terminal-first. If the terminal is not reliable, the core of the entire product suffers.

### Consequence
At every further architecture or library decision, it must be examined whether this terminal requirement is cleanly supported.

---

## 10. Editor/File Area: Deliberately Limited Depth

### Determination
The editor/file area should be solid in the MVP, but deliberately not over-engineered.

### What This Means for the MVP
- Normal text-based everyday editing
- Not a complete IDE replacement
- No excessive special editor requirements in version 1

### Architectural Consequence
The architecture should not artificially neglect the editor area, but also not build it into the dominating core. The emphasis is on terminal, session model, and overall workflow.

---

## 11. Local-First and Later Monetization

### Determination
The architecture should be local-first.

### Clarification
Offline capability is desirable, but not formulated as a rigid hard system boundary.

### Rationale
This direction:
- Fits the product core
- Cleanly supports local project work
- Reduces early operational and cloud complexity
- Keeps later monetization via additional features open

### Architectural Implication
Core functions must not depend on cloud infrastructure.
At the same time, the architecture should not unnecessarily block later online/premium functions.

---

## 12. Genuine Borderline Issues and Points to Note

### Critical
1. **Terminal integration is success-critical.**
2. **Cross-platform details must be considered in the core, not just in UI.**
3. **The central state must be cleanly modeled so the product remains consistent.**
4. **The editor area must not shift the product's focus unnoticed.**

### Important
5. **Session and change model should be cleanly separated so the MVP is not unnecessarily bloated.**
6. **Persistence model and session history should fit logically early on.**
7. **The separation between UI, Core, terminal integration, and persistence should be discipline-maintained.**

---

## 13. Open Technical Decisions
1. Which concrete PTY/terminal integration fits best with the Tauri direction?
2. How is session change tracking technically modeled?
3. Which state solution is concretely used in the React frontend?
4. How exactly is SQLite structurally integrated?
5. Which parts of the state belong in the database, which only in volatile runtime state?
6. How are platform-dependent differences in shell, paths, and terminal behavior abstracted?
7. Which editor technology provides the desired intermediate depth without unnecessary overhead?

---

## 14. Recommended Next Architecture Steps

### Critical
1. Set up Tauri basic setup
2. Concretely evaluate PTY/terminal integration options
3. Define rough core state model
4. Sketch session data model
5. Cleanly cut boundaries between runtime state and persistence

### Important
6. Concretely examine SQLite as local persistence
7. Examine editor technology against MVP requirements
8. Make cross-platform specifics for terminal and file system visible

### Optional
9. Define UI component system
10. Architecturally mark later online/premium extension points

---

## Summary
The currently preferred architecture for the MVP is:
- **Tauri** as desktop shell
- **React** in the frontend
- **Central state model**
- **Real terminal/PTY as mandatory core**
- **SQLite as likely direction for structured local persistence**

This direction is fitting because it carries the actual character of the product:
not a mere desktop wrapper, not a half IDE, and not a cloud-centered platform, but a lean, local, terminal-first Developer Workspace with reliable session logic.
