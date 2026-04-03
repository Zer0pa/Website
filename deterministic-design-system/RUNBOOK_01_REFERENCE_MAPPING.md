# Runbook 01 — Reference Mapping

## Goal

Create the machine-readable reference maps for the homepage and `/imc`.

## Inputs

- attached homepage reference screenshot
- attached flagship reference screenshot
- target reference viewport

## Output Files

- `maps/reference/home.geometry.json`
- `maps/reference/home.color.json`
- `maps/reference/imc.geometry.json`
- `maps/reference/imc.color.json`

## Procedure

1. Establish canonical desktop viewport.
2. For each screenshot, enumerate all major elements.
3. Assign deterministic ids:
   - `home.header.logo`
   - `home.hero.heading`
   - `home.hero.telemetry`
   - `home.flagship.media`
   - `home.flagship.metrics`
   - `imc.hero.title`
   - `imc.proof.assertions`
   - `imc.evidence.routes`
4. Record pixel geometry and normalized ratios.
5. Record typography and color values for each major text/container surface.
6. Store notes for ambiguous/photo-driven regions separately from measurable UI geometry.

## Rules

- Separate reusable UI surfaces from illustrative/photographic surfaces.
- Do not guess colours from memory; sample them.
- Do not collapse multiple elements into one map node if they are independently measurable.
- Distinguish:
  - element geometry
  - container geometry
  - text styling

## Pass Condition

Both pages have complete geometry and colour maps with stable ids and normalized measurements.

