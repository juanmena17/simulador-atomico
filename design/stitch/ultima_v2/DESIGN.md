---
name: Atomic Matrix UI
colors:
  surface: '#11131c'
  surface-dim: '#11131c'
  surface-bright: '#373943'
  surface-container-lowest: '#0c0e17'
  surface-container-low: '#191b25'
  surface-container: '#1d1f29'
  surface-container-high: '#282933'
  surface-container-highest: '#32343e'
  on-surface: '#e1e1ef'
  on-surface-variant: '#cac7ae'
  inverse-surface: '#e1e1ef'
  inverse-on-surface: '#2e303a'
  outline: '#94927a'
  outline-variant: '#494834'
  surface-tint: '#cfcc26'
  primary: '#ffffff'
  on-primary: '#333200'
  primary-container: '#ece944'
  on-primary-container: '#696700'
  inverse-primary: '#636100'
  secondary: '#c7fff0'
  on-secondary: '#00382f'
  secondary-container: '#00f2d1'
  on-secondary-container: '#006a5a'
  tertiary: '#ffffff'
  on-tertiary: '#3c0091'
  tertiary-container: '#e9ddff'
  on-tertiary-container: '#7342dd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ece944'
  primary-fixed-dim: '#cfcc26'
  on-primary-fixed: '#1d1d00'
  on-primary-fixed-variant: '#4a4900'
  secondary-fixed: '#26fedc'
  secondary-fixed-dim: '#00dfc1'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005144'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#11131c'
  on-background: '#e1e1ef'
  surface-variant: '#32343e'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-md:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Newsreader
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Newsreader
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.015em
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 9px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.12em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-dense: 0.5rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The design system translates quantum mechanics research and atomic modeling into a high-precision, digital laboratory instrument. Designed for quantum computational scientists, theoretical physicists, and specialized aerospace and semiconductor researchers, it merges the rigorous discipline of electron microscope consoles with the atmospheric depth of deep-field astrophysical instrumentation.

The design movement combines **Precision Scientific Brutalism** and **Atmospheric Glassmorphism**:
- Ultra-refined 1px structural data grids that reference optical bench measurements and particle detector meshes.
- Deep space, multi-tier black surfaces layered with calibrated transmission blur, allowing quantum probability visualizations and wave function amplitudes to radiate without ocular fatigue during extended sessions.
- Instrument-grade focal cues using coherent gold and spectral cyan/violet emissions to signify state transitions, coherence levels, and probability density thresholds.
- Zero decorative ornamental fluff: every line, badge, border, and tick mark carries metric or operational relevance.

## Colors

The palette operates on calibrated luminescence tiers across pure dark-field voids, preventing visual contamination of particle cloud rendering:

- **Primary (`#F0ED48` - Quantum Gold):** Represents active valence states, dominant atomic orbital shells, cursor probes, and principal interactive controls. Used sparingly to draw immediate, unambiguous focus.
- **Secondary (`#00F5D4` - Coherence Cyan):** Represents coherent wave phases, positive spin eigenstates, magnetic trap vectors, and safe hardware metrics.
- **Tertiary (`#8B5CF6` - Spectral Violet):** Signifies wave function collapses, superposition probabilities, negative parity states, and auxiliary spectral readouts.
- **Surface Foundations:**
  - `Base / Space`: `#08090D` (void canvas / background baseline)
  - `Surface Tier 1`: `#0D0F18` (primary workspace panels, control racks)
  - `Surface Tier 2`: `#141726` (floating tool inspectors, modal heads, input tracks)
  - `Surface Highlight`: `#1E2338` (hover states and selected matrix cells)
- **Structural Accents & Dividers:**
  - Neutral rule: `rgba(255, 255, 255, 0.08)`
  - Active boundary: `rgba(240, 237, 72, 0.25)`
  - Secondary glow rim: `rgba(0, 245, 212, 0.2)`
- **Alert & Functional Status:**
  - Thermal Runaway / Error: `#FF3366`
  - Warning / Phase Decoherence: `#FF9900`
  - Success / Entanglement Established: `#00F5D4`

## Typography

The type system is divided into three functional disciplines:

1. **Instrumentation & Structural Headers (`Space Grotesk`):** Clean geometric headers that project authority and technological discipline without leaning into sci-fi tropes.
2. **Physical Theory & Narrative Papers (`Newsreader`):** An editorial, high-legibility serif designated for quantum field theory derivations, documentation modals, experimental notes, and Hamiltonian descriptions.
3. **Quantum Telemetry & Readouts (`JetBrains Mono`):** Tabular numbers, ket notation ($|\psi\rangle$), orbital angular momentum states ($n, l, m_l, m_s$), and raw hardware telemetry. All labels are formatted uppercase with wide tracking (`letterSpacing: 0.08em` to `0.12em`) for immediate peripheral recognition.

## Layout & Spacing

The layout is built around a rigid, dockable modular desktop instrument grid:
- **Canvas Shell:** 100vh non-scrolling master container with a fixed perimeter margin (`margin: 1.5rem`) and structural 1px docking separators.
- **Multi-Split Workspace:**
  - Left dock: Atomic configuration, element matrices, and field generator parameter racks (fixed 320px–380px width).
  - Center viewport: Full 3D Hamiltonian wave equation canvas and particle orbital simulation engine (fluid flex-fill).
  - Right dock: Telemetry histograms, state vectors, and eigenspectrum charts (fixed 360px width).
  - Bottom panel: Collapsible quantum step runner, timeline controls, and Hamiltonian matrix output (auto height, max 260px).
- **Rhythm:** Spacing follows strict micro-increments (4px/8px/12px) to pack dense scientific metrics without visual crowding. Compact layouts use `gutter-dense` (8px) for tightly coupled scalar inputs.

## Elevation & Depth

Visual hierarchy does not use soft natural drop shadows; it relies strictly on calibrated optical depth and emission fields:

- **Tier 0 (Root Vacuum):** `#08090D` background. Contains zero-blur rendering canvas and background coordinate grids.
- **Tier 1 (Instrument Deck Panels):** `#0D0F18` with 88% opacity and 16px backdrop-blur. Outlined with a hairline `1px solid rgba(255, 255, 255, 0.06)`.
- **Tier 2 (Floating Inspect Toolbars & Overlays):** `#141726` with 80% opacity and 24px backdrop-blur. Rimmed with `1px solid rgba(240, 237, 72, 0.18)` and an ambient optical glow: `box-shadow: 0 0 24px -4px rgba(240, 237, 72, 0.06), 0 8px 32px -8px rgba(0, 0, 0, 0.7)`.
- **Emission States:** Active nodes and quantum emitters project direct specular glow using dual drop-shadows:
  - Gold Focus: `0 0 8px rgba(240, 237, 72, 0.4), 0 0 1px #F0ED48`
  - Cyan State: `0 0 8px rgba(0, 245, 212, 0.4), 0 0 1px #00F5D4`
  - Violet Singularity: `0 0 12px rgba(139, 92, 246, 0.45), 0 0 1px #8B5CF6`

## Shapes

The interface embraces a machined, surgical profile. Corners use an ultra-restrained 4px (`roundedness: 1`) radius for interactive modules, badges, and panel cards, with 0px sharp inner boundaries for segmented data arrays. 

Larger containers such as floating dialogs or inspect windows scale up to a maximum corner radius of 8px (`rounded-lg`), ensuring UI components feel milled from crystalline optical substrates rather than molded plastic.

## Components

### Buttons
- **Primary Instrument Action (Execute Simulation, Collapse State):** Solid `#F0ED48` background with `#08090D` text, typed in uppercase `JetBrains Mono` bold. Sharp 4px radius. Hover triggers an intensive inner gold bloom and slight outer halo (`0 0 12px rgba(240, 237, 72, 0.5)`).
- **Secondary / Mode Toggle:** Translucent `#141726` background, 1px border in `rgba(255, 255, 255, 0.12)`, text in `#FFFFFF`. Hover changes border color to `rgba(0, 245, 212, 0.5)` and text to `#00F5D4`.
- **Ghost Action / Tool Icon:** Pure transparent background, 1px border transparent. Active state triggers inset border `1px solid rgba(240, 237, 72, 0.4)` and background `rgba(240, 237, 72, 0.05)`.

### Chips & Badges
- **Status Badges (Coherence, Iso-Surface, Shells):** 20px height, mono typography (`label-sm`). Rendered with a 1px border matching the metric's emission hue at 30% alpha, background at 8% alpha. Features a 4px circular glowing micro-indicator dot on the left.

### Lists & Telemetry Feeds
- **Quantum Parameter Rows:** Compact 28px alternating data rows. Left-aligned parameter name in muted slate gray; right-aligned tabular readout in `JetBrains Mono` white. Dividing rules use `1px dashed rgba(255, 255, 255, 0.06)`. Hovering a row highlights the data cell with a `rgba(0, 245, 212, 0.08)` sweep.

### Checkboxes & Radio Controls
- **Checkboxes:** 14px square, 2px radius, hairline border `rgba(255, 255, 255, 0.2)`. Checked state fills `#F0ED48` with a 2px dark inset tick mark, casting a faint yellow glow.
- **Radio Buttons:** 14px concentric rings. Selected state displays an inner glowing 6px circle in `#00F5D4` encircled by a sharp neon-cyan border.

### Input Fields & Numeric Steppers
- **Scientific Inputs:** Height 32px, background `#0D0F18`, border `1px solid rgba(255, 255, 255, 0.1)`. Focus state illuminates the border to `rgba(240, 237, 72, 0.7)` with zero outline offset. Numeric values right-align in `JetBrains Mono`; scientific units (e.g., `eV`, `pm`, `GHz`) sit permanently anchored on the right in muted gray (`#5B6275`).

### Cards & Modular Docks
- **Module Racks:** Background `#0D0F18` with 1px border in `rgba(255, 255, 255, 0.07)`. Header bar is partitioned by a 1px solid separator with a dedicated sub-panel indicator in uppercase monospace text. Corner accents have optional subtle 4px L-bracket corner notches in primary gold.

### Custom Component: Wavefunction Phase Sliders
- Linear track (4px high) rendered in deep `#1E2338` with an illuminated gradient progress fill (`#8B5CF6` transitioning to `#00F5D4`). Thumb is a crisp 12px diamond polygon rimmed in `#F0ED48` with numeric tooltips anchored directly above the thumb handle.

### Scrollbars
- Ultra-narrow 4px width. Track is transparent. Thumb is styled with `rgba(255, 255, 255, 0.15)` and transitions to `#F0ED48` on hover and active scroll drag.