# MVP Feature Slices v0.1

## Status
Working state after joint prioritization

## Purpose of This Document
This document decomposes the already-defined MVP into implementable construction phases.

The goal is not new brainstorming, but a clear structure for:
- Order
- Dependencies
- Early testability
- Deliberate scope boundaries

## Guiding Principle for Slice Order
The slices are prioritized as a **mix of user value and technical dependency**.

This means:
- As early testable intermediate states as possible
- But no artificial order that ignores technical realities
- The user value of each slice should become visible early

---

## Overall Overview
1. Slice 1 — Workspace Basic Framework
2. Slice 2 — Terminal-First Working Core
3. Slice 3 — Files Directly in the Same Space
4. Slice 4 — File Tree as Working Tool
5. Slice 5 — Session Change Core
6. Slice 6 — Session History

---

## Slice 1 — Workspace Basic Framework
### Goal
Open a local project and land in a stable, focused basic interface.

### Included
- Simple project list on startup
- Add existing local folder as project/workspace
- Open project
- Remove project from list
- Always only one active project at a time
- Exclusively local projects
- Left File Tree
- Right tab-based main area
- Initial terminal tab

### User Value
Already after Slice 1, the app is testable and usable:
- Open project
- See project structure
- Work in the embedded terminal

### Why This Slice Comes First
Without this slice, there is no reliable project context and no stable basic structure for all further functions.

### Dependencies
- No functional prerequisites
- Forms the foundation for all further slices

### Priority
**critical**

---

## Slice 2 — Terminal-First Working Core
### Goal
The app becomes practically workable as a terminal workspace.

### Included
- Multiple individual terminal tabs
- New terminal tab via plus button
- Terminal tabs manually renamable
- Clean tab behavior for terminal sessions

### User Value
From this slice onward, the terminal part becomes a real core promise rather than just an embedded single terminal.

### Why This Slice Stays Separate
Slice 1 proves the basic framework. Slice 2 proves that the product can be seriously usable as a terminal-first working environment.

### Dependencies
- Builds on Slice 1

### Priority
**critical**

---

## Slice 3 — Files Directly in the Same Space
### Goal
Make terminal and files usable in the same work environment without tool break.

### Included
- Open file from File Tree
- Multiple file tabs
- Text editing
- Manual save as default
- Undo/Redo
- Syntax highlighting depending on language
- Line numbers
- Search within the open file

### User Value
From this slice onward, the central product value emerges:
- Use terminal
- Open files directly next to it
- Edit files without external editor

### Why This Slice Stays Independent
File handling and editing are a large functional block with its own utility value and should not get lost in the terminal slice.

### Dependencies
- Builds on Slice 1
- Structurally benefits from Slice 2, but should be treated as its own work block

### Priority
**critical**

---

## Slice 4 — File Tree as Working Tool
### Goal
Edit project structure directly in the workspace without needing an external file manager.

### Included
- New file
- New folder
- Rename
- Delete with confirmation
- Drag & Drop to move

### User Value
The File Tree becomes from a pure navigation area to a real working tool.

### Critical Note
- Permanent deletion with confirmation is a consciously accepted MVP decision
- Remains a risk point and should be re-examined later

### Dependencies
- Builds on Slice 1
- Complements Slice 3 meaningfully, but is delimitabl as its own structure and operations block

### Priority
**important**

---

## Slice 5 — Session Change Core
### Goal
The app gains its actual own profile through session-related change logic.

### Included
- New session per project opening
- Capture changes of the current session
- Mark changed files of the current session in the File Tree
- Diff/change view as its own tab
- Diff read-only
- Before/after comparison

### User Value
From this slice onward, the app is no longer just a minimalist workspace, but a session-based work space with traceable changes.

### Why This Slice Is Critical
This slice creates a large part of the actual product identity.

### Open Technical Question
How changes outside direct editing are reliably assigned to the session is not yet finally decided.

### Dependencies
- Builds on Slice 1
- Practically assumes Slice 3, because otherwise file and change reference would be too weak
- Benefits from Slice 4, but is professionally independent

### Priority
**critical**

---

## Slice 6 — Session History
### Goal
Make past work visible and earlier sessions findable again.

### Included
- List of old sessions
- Per session visible: name and timestamp
- Automatic session naming
- Session names manually changeable
- Fallback for session names: Git branch + timestamp
- Open old sessions with focus on then-current changes and files

### User Value
The user can find earlier work states without the MVP having to perform full UI restoration.

### Why This Slice Stays Independent
It builds on the session model but extends it toward history and traceability. That is its own product milestone.

### Important Delimitation
- No hard requirement to restore old sessions 1:1 in the same UI configuration
- Focus is on changes and files, not on exact UI reconstruction

### Dependencies
- Builds directly on Slice 5

### Priority
**important**

---

## Priority Overview
### Critical
- Slice 1 — Workspace Basic Framework
- Slice 2 — Terminal-First Working Core
- Slice 3 — Files Directly in the Same Space
- Slice 5 — Session Change Core

### Important
- Slice 4 — File Tree as Working Tool
- Slice 6 — Session History

### Optional / Deliberately Later
- AI-specific features
- Global project search
- Special preview for non-text-based files
- Remote workspaces
- Deeper session restoration
- Additional panels/tab types
- Autosave as optional setting

---

## Recommended Build Order
1. Slice 1
2. Slice 2
3. Slice 3
4. Slice 4
5. Slice 5
6. Slice 6

## Why This Order Makes Sense
- Testable entry from Slice 1 onward
- Terminal-first utility is proven before building out the rest of the interface
- File handling follows as the next real product value
- File Tree operations extend the working capability
- Session change logic gives the product its actual profile
- History comes only when the active session model already works

---

## Definition of a Good Intermediate State Per Slice
### After Slice 1
The app is testable as a simple local project workspace with embedded terminal.

### After Slice 2
The app is credibly usable as a terminal-first working environment.

### After Slice 3
The app delivers the core value: Terminal + Files in the same work space.

### After Slice 4
The project structure can be edited without an external file manager.

### After Slice 5
The app shows session-related changes traceably and gains its actual profile.

### After Slice 6
The app supports not only current work, but also returning to past work contexts.

---

## Critical Notes for Further Planning
1. Slice 5 is more important product-strategically than its technical size might initially suggest.
2. Slice 6 should only be implemented when Slice 5 is clearly working in its user logic.
3. Permanent deletion remains a consciously taken MVP risk.
4. The technical implementation of session change tracking is still open and must be cleanly investigated before architecture decisions.
5. The differentiation from existing tools should be further sharpened linguistically in parallel with implementation.

## Summary
The MVP should not be built as an unstructured feature list, but as a sequence of clear product milestones.

The most important proofs are:
- Does the project workspace work?
- Is the terminal experience convincing?
- Does file work directly in the same space really feel better?
- Does the session change model provide genuine added value?

If these four points hold, the product has a reliable foundation.
