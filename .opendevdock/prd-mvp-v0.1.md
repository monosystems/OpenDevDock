# PRD / MVP v0.1

## Status
Working state after joint clarification

## Working Method
This document is based on a step-by-step joint elaboration:
1. Targeted questions, each individually
2. Collect answers
3. Intermediate evaluation and critical review
4. Clarify open or disputed points
5. Transfer document into a reliable first state

---

## 1. MVP Goal
The MVP shall prove that a lean, terminal-first development environment improves the workflow for developers who want to work between terminal, files, and change overview without constantly switching between multiple windows or an overloaded IDE.

The MVP shall not cover all possible developer workflows, but demonstrate a clear core:
- Project-centered work
- Terminal as the main work surface
- Direct access to files
- Visible changes in the current work context
- Less friction than in classic IDE setups

## 2. Target Users
### Primary Target Users
- Solo developers
- Goal-focused developers
- Developers with a terminal-near working style
- Developers who can or want to work with AI-assisted tools, but do not need deeply integrated AI features in the MVP
- Users for whom VS Code or similar IDEs are too much, but a pure terminal offers too little structure

### Productive Core User in the MVP
A solo dev working on a project that actively uses the terminal, who needs to regularly check and edit files, and wants as little window switching and UI ballast as possible.

## 3. Core Problem
Many developers today work distributed across multiple surfaces:
- Terminal
- Editor / IDE
- Project files
- Change overview
- Possibly external coding tools

This especially causes these problems in everyday work:
- Too many window switches
- Unnecessary mental overhead
- Too much ballast in classic IDEs
- Too little structure in pure terminal-based setups

The central guiding problem of the MVP is:
**The switch between terminal, files, and changes is unnecessarily fragmented.**

## 4. Product Promise
A terminal-first Developer Workspace for users for whom VS Code is too much and a pure terminal is too little.

The product promises:
- More focused work
- Less window switching
- Less overhead
- Clear project context
- Fast orientation over files and current changes

## 5. Top Use Cases
1. A user opens the app and selects a local project/workspace from a list.
2. After opening, the user sees the project's File Tree on the left and a tab-based main area on the right.
3. By default, the user works in the terminal tab.
4. The user starts desired tools directly in the embedded terminal.
5. If the user clicks on a file in the File Tree, it opens as its own tab in the main area.
6. The user edits files directly in the app for normal everyday situations.
7. The user opens a diff/change view to see the changes of the current session as a before/after comparison.
8. Changed files of the current session are additionally marked in the File Tree, subtly but clearly visible.
9. When opening a project again, a new fresh session starts.
10. Earlier sessions remain visible and callable so that changes and files from past work sessions can be found again.

## 6. Must Be Included in the MVP
### Project and Workspace Entry
- Simple project/workspace list on startup
- Open project
- Add existing local folder as project/workspace
- Remove project from list
- Always only one active project at a time
- Exclusively local projects in the MVP

### Layout and Navigation
- Left File Tree
- Tab-based main area on the right side
- Default main tab: Terminal
- File click in File Tree opens file as tab in main area

### Terminal
- Fully embedded terminal as core work surface
- Multiple individual terminal tabs in the MVP
- New terminal tabs via plus button
- Terminal tabs manually renamable
- User starts tools themselves directly in the terminal

### File Handling and Editing
- Multiple file tabs in the MVP
- Edit text
- Manual save as default
- Undo/Redo
- Syntax highlighting depending on language
- Line numbers
- Search within the open file

### File Tree Actions
- Navigation
- New file
- New folder
- Rename
- Delete with confirmation
- Drag & Drop to move
- Visual marking of changed files of the current session

### Change View / Diff
- Own diff/change tab
- Read-only in the MVP
- Shows all changes of the current session
- Display as before/after comparison

### Sessions
- When opening a project, a new session always starts
- Old sessions are preserved
- Old sessions are displayed in a list
- Per session visible: name and timestamp
- Session names are auto-generated, but can be manually changed
- If auto-generation is not sensibly possible, git branch name plus timestamp serves as fallback
- Old sessions are callable
- When opening old sessions, the focus is on finding then-current changes and files

### Shortcuts
- Only most important shortcuts in the MVP
- Search in file
- Close tab
- Undo/Redo
- Switch between tabs

## 7. Should Follow Later
- Additional AI-specific features
- AI-related monetization features
- Further integrations into coding tools
- Global project search
- Special preview for non-text-based file types
- Deeper session recovery / stronger reconstruction of earlier UI states
- Remote/virtual workspaces
- Additional comfort shortcuts
- Further views or panels beyond terminal, files, and diff
- Possibly autosave as optional setting

## 8. Deliberately Not in the MVP
### Product Boundaries
- No complete IDE replacement
- No overloaded all-in-one development platform
- No deep AI integration in the MVP
- No special startup logic for AI tools in the app
- No global project search
- No special preview features for non-text-based file types
- No remote workspaces
- No team collaboration
- No plugin/marketplace system
- No project management or deployment suite

### UI/Operation Boundaries
- No freely sprawling layout flexibility
- No large selection of additional tab types in the MVP
- Diff view not editable

## 9. Success Criteria
The MVP is successful if early users can after short use meaningfully say:

**"Finally I no longer have to constantly jump between different windows just to keep terminal, files, and changes in view together."**

Additional qualitative success criteria:
- The app feels noticeably more focused than a classic IDE
- The terminal-first approach remains credible
- Users quickly understand the interface
- The session/change logic creates genuine added value rather than confusion
- The app looks lean rather than half-finished IDE imitation

## 10. Risks and Open Questions
### Critical Risks
1. **Session history significantly increases the MVP scope.**
2. **Permanent deletion despite confirmation is an consciously accepted risk.**
3. **The differentiation from VS Code/Cursor is not yet sharply enough formulated.**
4. **The technical logic for capturing session changes is still open.**
5. **Multiple terminal tabs make the quality of the terminal part business-critical.**

### Important Open Questions
1. How are changes outside the editor or outside direct editing reliably assigned to the current session?
2. How exactly does automatic session naming arise?
3. How visible and accessible will the session list be in the UI?
4. How are error cases for moving, deleting, and file operations cleanly communicated?

## 11. Disputed Decisions
### Consciously Decided
- Manual save as default in the MVP
- Permanent deletion with confirmation
- Session history must be in the MVP
- Multiple terminal tabs must be in the MVP
- Multiple file tabs must be in the MVP
- AI added value in MVP only indirectly via good workflow, not via special features

### Re-examine Later
- Whether deletion should be recoverable in the future instead of permanent
- Whether autosave as an optional setting function makes sense
- How deep the recovery of old sessions should go later
- Whether additional views or panels provide genuine added value or just inflate scope

## 12. Final MVP Scope
The MVP is a **terminal-first, session-based Developer Workspace** for local projects.

It offers:
- A simple project list
- Exactly one active project at a time
- Left File Tree
- Right tab-based main area
- Multiple terminal tabs
- Multiple file tabs
- Read-only diff/change tab
- Normal text-based everyday editing
- Session history with visible and callable old sessions
- Focus on fewer window switches between terminal, files, and changes

It deliberately does **not** offer:
- Complete IDE coverage
- Deep AI special integration
- Global project search
- Remote projects
- Plugin systems or team features

## Summary
The MVP is not a "small VS Code" and not an AI tool in the narrower sense. It is a focused development environment for developers who work terminal-near and want to keep files as well as session changes directly in view in the same project context.

The actual test for the MVP is not whether it rebuilds as many features as possible, but whether it creates a noticeably more direct and focused workflow than the previous switch between IDE, terminal, and additional windows.
