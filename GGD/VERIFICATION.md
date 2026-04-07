# GGD VERIFICATION

Verification is a first-class system.

Every serious route pass must produce evidence, not just a feeling.

The machine-readable bundle index is:

- `GGD/verification/bundles.json`

## Severity

- `CRITICAL`: route is wrong or unsafe to promote
- `MAJOR`: route may be wrong or materially degraded
- `MINOR`: route is probably usable but incompletely validated
- `NOTE`: observation without blocking impact

## Bundles

### geometry-bundle

Checks:

- spacing ladder compliance
- grid and span compliance
- keyline and alignment consistency
- section-flow and macro-rectangle drift
- flagship exception preservation

### breakpoint-bundle

Checks:

- desktop limiting case
- tablet limiting case
- mobile limiting case
- declared wide-screen and TV limiting cases when enabled
- no horizontal overflow

### color-bundle

Checks:

- contrast pairs
- low-emphasis legibility
- token-role consistency
- black-anchor and white-anchor stability

### semantic-seo-bundle

Checks:

- main landmark presence
- route-specific title
- route-specific description
- coherent heading hierarchy
- canonical and structured data correctness where declared

### truth-bundle

Checks:

- packet truth alignment
- route-role truth alignment
- flagship isolation
- repo-backed page identity

### code-quality-bundle

Checks:

- shared-kernel integrity
- route-fork detection
- lintable and inspectable route logic
- measurement-hook preservation

## Promotion Rule

Do not promote a candidate when:

- any `CRITICAL` exists
- any `MAJOR` exists
- route truth contradicts packet truth
- flagship-only behavior is flattened into generic logic

## Gap Output

Every failed verification pass must create a gap record with:

- route
- bundle
- failing checks
- top drift surfaces
- suspected ownership boundary
- next bounded slice

Route gaps live in:

- `GGD/gaps/routes/*.json`
