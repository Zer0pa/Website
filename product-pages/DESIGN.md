```markdown
# Design System Document

## 1. Overview & Creative North Star

### Creative North Star: "The Dossier of Absolute Truth"
This design system rejects the "SaaS-standard" friendliness of the modern web. It is a digital manifestation of technical authority—blending the cold, calculated restraint of Swedish minimalism with the urgent, unredacted aesthetic of a DARPA technical leak. The interface does not "onboard" users; it grants them access to evidence.

The visual identity is driven by **Zero-Point Geometry**: a commitment to absolute edges, pure black voids, and a mathematical use of negative space. We break the template look by eschewing soft shadows and rounded corners in favor of a rigid, uncompromising grid. Hierarchy is not suggested through color or decoration, but through the brutalist contrast of scale and the stark isolation of the "0" singularity.

---

## 2. Colors

The palette is a study in monochromatic restraint. It operates on a strict "void-to-signal" ratio.

### The Palette (Material Design Mapping)
*   **Background / Surface:** `#131313` (Deep Void)
*   **Primary:** `#FFFFFF` (Reserved for the '0' and critical proof points only)
*   **Secondary / Neutrals:** Grayscale range from `#C7C6C6` (Data Labels) to `#474747` (Structural cues).
*   **Error:** `#FFB4AB` (High-contrast technical alert).

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. They represent a failure in spatial organization. Boundaries must be defined through:
1.  **Background Shifts:** Use `surface-container-low` vs `surface-container-high` to define content blocks.
2.  **Negative Space:** Use the Spacing Scale (specifically `spacing-16` or `spacing-24`) to create "dead zones" that separate logical units.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical, stacked layers. 
*   **Base:** `surface` (#131313).
*   **Evidence Cards:** `surface-container-low` (#1B1B1B).
*   **Active Overlays:** `surface-bright` (#393939).
This nesting creates depth through luminance rather than lines, making the interface feel like a cohesive, engineered object.

---

## 3. Typography

Typography is the primary vehicle for the brand’s "Exact" and "Technical" tone.

### Font Pairings
*   **Mastheads & Branding:** **Oswald (Regular/Medium)**. All-caps. This is our architectural voice. It is used for the wordmark and massive, section-defining headings.
*   **UI, Body, & Evidence:** **Courier (Monospace)**. This is our functional voice. Every data point, label, and paragraph must feel like it was output by a terminal or typed on a high-precision machine.

### Typography Scale
*   **Display-LG (Oswald, 3.5rem):** For the singularity '0' and key headers.
*   **Headline-SM (Oswald, 1.5rem):** Section titles.
*   **Body-MD (Courier, 0.875rem):** Standard technical descriptions and reports.
*   **Label-SM (Courier, 0.6875rem):** Meta-data, timestamps, and terminal telemetry.

---

## 4. Elevation & Depth

In this system, "Elevation" does not mean "Floating." It means "Priority."

*   **The Layering Principle:** Depth is achieved by "stacking" tonal values. A card sits *in* the surface, not *on* it. 
*   **Ambient Shadows:** While traditional shadows are avoided, when an element must overlap (e.g., a modal), use a high-dispersion, low-opacity shadow: `box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5)`. Never use a visible "drop shadow" color.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the `outline-variant` (#474747) at 20% opacity. It should be felt, not seen.
*   **Glassmorphism:** For terminal panels that overlay live data, use `surface-container-highest` with a `backdrop-blur: 12px`. This maintains the "technical leak" aesthetic, allowing the grid underneath to remain partially visible.

---

## 5. Components

### Primitive Elements
*   **Buttons:** 
    *   *Primary:* Solid `#FFFFFF` background, `#000000` Courier text. No rounded corners (`0px`).
    *   *Secondary:* Transparent background, `outline` (#919191) Ghost Border, `#FFFFFF` text.
*   **Terminal Evidence Panels:** High-contrast containers using `surface-container-low` with a header bar in `surface-container-high`. Labels always in all-caps Courier.
*   **Status Badges:** Small, rectangular blocks. Success uses Grayscale (high luminance), Error uses `#FFB4AB` text only.
*   **Input Fields:** Strictly bottom-border only or Ghost Borders. No filled boxes. Use `#FFFFFF` for the cursor to emphasize the "terminal" feel.
*   **Metric Callouts:** Large-scale Courier numbers. If a metric is "Critical Proof," use `#FFFFFF`. Otherwise, use `secondary` (#C7C6C6).

### Custom Components
*   **The "Singularity" 0:** A recurring visual motif. Always pure White (#FFFFFF), centered, or used as a massive background watermark.
*   **Evidence Cards:** Modular units with `0px` border radius. Content is separated by vertical spacing (`spacing-4`) instead of horizontal dividers.

---

## 6. Do's and Don'ts

### Do
*   **Do** use extreme negative space. If a layout feels "full," remove 20% of the content.
*   **Do** align everything to a strict modular grid. Asymmetry is encouraged, but only if it follows the grid's mathematical logic.
*   **Do** use monospace for *everything* that isn't a headline.
*   **Do** reserve pure White (#FFFFFF) for moments of "Truth" or finality.

### Don't
*   **Don't** use border-radius. Every corner must be exactly 90 degrees.
*   **Don't** use gradients, shadows, or "glow" effects. The light comes from the data itself.
*   **Don't** use icons if text can do the job. A label "EXECUTE" is more powerful than a play icon.
*   **Don't** use "Marketing Speak." Labels should be functional (e.g., "GET STARTED" becomes "INITIALIZE_SYSTEM").

---

**Director's Final Note:** This design system is about the power of what is left out. Every pixel must justify its existence. If an element does not contribute to the "Technical Restraint" aesthetic, delete it.```