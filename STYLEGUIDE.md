# OpenDevDock Styleguide

## Design System: "Technical Monolith"

This styleguide documents the visual design language used in OpenDevDock, based on the "Technical Monolith" principle: a high-performance terminal reimagined through a premium editorial lens.

---

## Color Palette

### Core Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--surface` | `#000000` | Foundation background |
| `--surface-container-low` | `#212121` | Card backgrounds |
| `--surface-container-high` | `#1a1a1a` | Session item backgrounds |
| `--surface-container-highest` | `#2a2a2a` | Hover states |
| `--primary` | `#39FF14` | Neon green accent (CTAs, branding, interactive elements) |
| `--primary-hover` | `#32E612` | Hover state for primary |
| `--on-surface` | `#FFFFFF` | Primary text |
| `--on-surface-variant` | `#A0A0A0` | Secondary text (paths, metadata) |
| `--outline-variant` | `rgba(255,255,255,0.08)` | Subtle borders/dividers |
| `--error` | `#FF4444` | Error states |
| `--success` | `#39FF14` | Success states (same as primary) |

### Color Usage Rules

- **Never use pure white (#ffffff)** for text - always `--on-surface` (#ffffff) for primary text
- **Primary accent (#39FF14)** is used sparingly as a "beacon" - branding, CTAs, interactive highlights
- **Background hierarchy** is achieved through tonal shifts only (no solid borders)

---

## Typography

### Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Labels, secondary emphasis |
| SemiBold | 600 | Subheadings |
| Bold | 700 | Headlines, project names |

### Type Scale

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| `h1` | Space Grotesk | 32px | 700 | Logo/title |
| Subtitle | Inter | 14px | 400 | Descriptive text |
| Project Name | Space Grotesk | 16px | 700 | Uppercase, 0.02em letter-spacing |
| Body | Inter | 14px | 400 | General text |
| Path/Code | JetBrains Mono | 11px | 400 | File paths, technical info |
| Label Small | Inter | 10px | 600 | Uppercase, 0.1em letter-spacing |

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

---

## Spacing

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps between related items |
| sm | 8px | Default gaps |
| md | 12-16px | Section padding |
| lg | 20px | Card padding |
| xl | 24-28px | Button padding |
| 2xl | 40-48px | Major section gaps |

### Layout Spacing (Start View)

```css
.start-view {
  padding: 80px 40px 40px;  /* Top attention-grabbing, content below */
  gap: 48px;                 /* Major separation between sections */
}

.project-entry {
  padding: 20px;             /* Card internal spacing */
}

.session-history-item {
  padding: 12px 16px;        /* Compact but breathable */
}
```

---

## Components

### Buttons

#### Primary Button

```css
.btn-primary {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 14px 28px;
  border-radius: 6px;
  background: var(--primary);           /* #39FF14 */
  color: #000000;                        /* Black text on neon */
  box-shadow: 0 4px 24px rgba(57, 255, 20, 0.3);  /* Neon glow */
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
```

**Rules:**
- Use for main CTAs only
- Never use rounded-full (reserved for status indicators)
- Always use rounded-md (6px) or rounded-lg (8px)

#### Ghost Button (Remove, etc.)

```css
.project-item-actions button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary);
  transition: background 0.15s;
}

.project-item-actions button:hover {
  background: rgba(57, 255, 20, 0.1);
}
```

### Cards / Project Entry

```css
.project-entry {
  background: var(--surface-container-low);  /* #212121 */
  border-radius: 8px;
  overflow: hidden;
}

.project-item {
  padding: 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.project-item:hover {
  background: var(--surface-container-highest);  /* #2a2a2a */
}
```

**Rules:**
- No borders - depth is achieved through tonal shift
- Hover state: shift to a slightly lighter shade
- Rounded corners: 8px for cards

### Session History Items

```css
.session-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--surface-container-high);  /* #1a1a1a */
  border-radius: 6px;
  border-left: 2px solid transparent;          /* Accent placeholder */
  transition: background 0.15s, border-color 0.15s;
}

.session-history-item:hover {
  background: var(--surface-container-highest);  /* #2a2a2a */
  border-left-color: var(--primary);              /* #39FF14 on hover */
}
```

**Rules:**
- Left accent bar (2px) appears on hover
- Use transparent border as placeholder to avoid layout shift

### Empty State

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
  text-align: center;
  border: 1px dashed var(--outline-variant);   /* rgba(255,255,255,0.08) */
  border-radius: 8px;
  background: var(--surface-container-low);
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
```

**Rules:**
- Use dashed border for empty/inactive states
- Icon should be large (48px) with reduced opacity
- Centered layout with generous padding

### Input Fields

```css
input {
  background: var(--surface-container-low);
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  color: var(--on-surface);
}

input:focus {
  background: var(--surface-container-highest);
  box-shadow: 0 0 0 1px var(--primary);  /* Subtle focus ring */
}
```

**Rules:**
- No visible border by default
- Focus state: background shift + subtle primary ring
- Use none border style

### Modal / Overlay

```css
.session-modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
}

.session-modal {
  background: var(--surface-container-low);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--outline-variant);
}
```

**Rules:**
- Semi-transparent black overlay (70% opacity)
- Optional backdrop blur for glassmorphism effect
- Modal uses surface-container-low with subtle border

---

## Visual Effects

### Shadows

```css
/* Ambient shadow for modals */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

/* Neon glow for primary button */
box-shadow: 0 4px 24px rgba(57, 255, 20, 0.3);
```

**Rules:**
- Never use pure black shadows - always tinted with surface color
- Use for floating elements only (modals, dropdowns)

### Transitions

```css
transition: background 0.15s;
transition: opacity 0.15s, transform 0.15s;  /* For buttons */
```

**Rules:**
- Keep transitions fast (0.15s - 0.2s)
- Animate color/background, not layout properties

### Borders

**The "No-Line" Rule:**
- Avoid 1px solid borders to section off UI
- Use `background-color` shifts for visual hierarchy
- If border needed: use `--outline-variant` at 8% opacity

```css
/* Fallback if accessibility requires border */
border: 1px solid var(--outline-variant);  /* rgba(255,255,255,0.08) */
```

---

## Layout

### Start View Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  OPENDEVDOCK                                                 │  ← 80px top padding
│  Select a project to open your workspace                      │  ← subtitle
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PROJECT_NAME                              [REMOVE]    │  │  ← surface-container-low
│  │  /path/to/project                                       │  │
│  │                                                          │  │
│  │  RECENT SESSIONS                                        │  │  ← label-sm, primary color
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Session Name          1 hour ago    3 changes   │   │  │  ← surface-container-high
│  │  └──────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                 [ ADD PROJECT FOLDER ]                       │  ← Primary CTA
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

- Content max-width: 600px (centered)
- Full viewport height with scroll for overflow
- Generous whitespace (48px gaps between major sections)

---

## Iconography

### Rules

- Use emoji for simple empty states (📁, 📂)
- Keep icons monochrome unless color-coded
- Size: 12px for inline, 48px for empty state illustrations

---

## Accessibility

### Color Contrast

- Primary text (`#FFFFFF`) on surface (`#000000`): 21:1 ✓
- Secondary text (`#A0A0A0`) on surface: 10:1 ✓
- Primary (`#39FF14`) on surface: 15:1 ✓

### Focus States

```css
button:focus {
  outline: none;  /* Replace with custom focus ring if needed */
}

input:focus {
  box-shadow: 0 0 0 1px var(--primary);
}
```

---

## CSS Variables Reference

```css
:root {
  /* Surfaces */
  --surface: #000000;
  --surface-container-low: #212121;
  --surface-container-high: #1a1a1a;
  --surface-container-highest: #2a2a2a;

  /* Primary */
  --primary: #39FF14;
  --primary-hover: #32E612;

  /* Text */
  --on-surface: #ffffff;
  --on-surface-variant: #a0a0a0;

  /* Utility */
  --outline-variant: rgba(255, 255, 255, 0.08);
  --error: #ff4444;
  --success: #39FF14;
}
```

---

## Implementation Checklist

- [ ] Import Google Fonts (Inter, Space Grotesk, JetBrains Mono)
- [ ] Define CSS custom properties in `:root`
- [ ] Apply Surface hierarchy (no borders, tonal shifts only)
- [ ] Use Space Grotesk for headlines, uppercase with letter-spacing
- [ ] Use JetBrains Mono for paths and technical text
- [ ] Primary buttons: neon green with glow shadow
- [ ] Ghost buttons: transparent with primary color text
- [ ] Hover states: shift to lighter surface shade
- [ ] Session items: left accent bar on hover
- [ ] Empty states: dashed border, centered icon + text
- [ ] Transitions: 0.15s for color/background changes
