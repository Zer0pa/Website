# Sourcery AI Code Review Digest — Zer0pa Repos

**Compiled:** 2026-04-06
**Source:** Sourcery AI bot reviews on GitHub PRs (last 48 hours)
**Purpose:** Input for repo maintenance agent — address these findings across all ZPE repos

## Summary

| Repo | PR | Issues Found | Key Severity |
|------|-----|-------------|--------------|
| ZPE-Neuro | #4 | 3 | 2 bug_risk, 1 performance |
| ZPE-IMC | #7 | 1 | 1 bug_risk |
| ZPE-FT | #3 | 0 | Diff too large (>20k lines) |
| ZPE-Mocap | #3 | 1 | 1 suggestion |
| ZPE-Ink | #3 | 1 | 1 security |
| ZPE-Geo | #3 | 7 | 2 bug_risk, 1 suggestion, 3 testing, 1 bug_risk |
| ZPE-Prosody | #3 | 2 | 2 performance |
| ZPE-XR | #3 | 8 | 1 issue, 2 suggestion, 5 testing, 1 typo |
| ZPE-Bio | #4 | Rate limited | Hit 500k diff char limit |
| ZPE-IoT | #4 | Rate limited | Hit 500k diff char limit |
| ZPE-Robotics | #3 | Rate limited | Hit 500k diff char limit |

**Total actionable issues: 23 across 7 repos**
**Rate limited: 3 repos (Bio, IoT, Robotics) — re-trigger with @sourcery-ai review when limit resets**

---

## ZPE-Neuro (PR #4: feat: execute action brief)

### Overall Feedback
- The `get_public_corpus_target` / `PublicCorpusRunner` selection logic will happily return a target when only one of `label` or `dandiset_id` matches; if both are supplied it might be safer to either require both to match the same entry or raise on mismatch to avoid silently running the wrong benchmark.
- In `_timed_codec_metrics` you accumulate all `packet` instances in a list but only ever use the last one; you can drop the `packets` list and just keep a single `packet` reference to reduce memory use and simplify the loop.

### Issue 1 — bug_risk (src/zpe_neuro/public_corpus.py:66-74)
**Clarify behavior when both `label` and `dandiset_id` are provided to avoid inconsistent target selection.**
The function returns the first match for either `label` or `dandiset_id`, so callers that pass both may silently get a result matching only one of them.

**Fix:** Require both to match the same entry, or reject calls where both are set.

### Issue 2 — bug_risk (src/zpe_neuro/public_corpus.py:97-100)
**Fail fast if ElectricalSeries has no valid sampling rate instead of silently using 0 Hz.**

**Suggested fix:**
```python
raw_rate = getattr(series, "rate", None)
try:
    sampling_rate_hz = float(raw_rate)
except (TypeError, ValueError):
    raise ValueError(
        f"ElectricalSeries has an invalid sampling rate {raw_rate!r}; "
        "expected a positive numeric value."
    )
if sampling_rate_hz <= 0:
    raise ValueError(
        f"ElectricalSeries has non-positive sampling rate {sampling_rate_hz}; "
        "expected a positive value in Hz."
    )
```

### Issue 3 — performance (src/zpe_neuro/public_corpus.py:615-628)
**Avoid storing all packets when only the last one is used in `_timed_codec_metrics`.**

**Suggested fix:** Remove the `packets` list, keep just `packet: dict[str, Any]` and overwrite each iteration.

---

## ZPE-IMC (PR #7: feat: execute action brief)

### Overall Feedback
- In `code/wasm/src/index.js`, the `encodeImage` front-end allows any `bitDepth`/`thresholdX10` but the Rust backend only supports `bit_depth` in [1, 6] and clamps `threshold_x10`, so mirror those range checks in JS.
- The `requireBinding` error message hard-codes a `v0.0/code/wasm` path which may drift from actual repo layout.
- In `decode_image_words_internal`, the `CMD_SET_COLOR` branch recomputes `seen.iter().filter(...).count()` on every loop iteration; track a simple counter instead.

### Issue 1 — bug_risk (code/wasm/src/index.js:75-84)
**Validate `bitDepth` and `thresholdX10` on the JS side to fail fast.**
Enforce the same constraints as Rust (integer bitDepth in [1, 6], integer thresholdX10 in [0, 63]) and throw clear TypeError/RangeError before calling into wasm.

---

## ZPE-FT (PR #3: feat: execute action brief)
**Unable to review — diff exceeds 20,000 lines (GitHub API limit).**
Also: CodeQL flagged CI workflow missing `permissions` block. Add `permissions: { contents: read }`.

---

## ZPE-Mocap (PR #3: feat: execute action brief)

### Overall Feedback
- In `scripts/benchmark_cmu._load_selection`, the call to `select_manifest_entries` is immediately overridden when `subject_trials` is falsy, making the selection logic redundant.
- Multiple test modules manually mutate `sys.path` to import project code; restructure tests to rely on the installed package instead.

### Issue 1 — suggestion (code/zpe_mocap/cmu.py:97-105)
**Manifest format error handling makes it hard to trace which file is invalid.**
Switch `RuntimeError` to `ValueError` with clearer message, and in `load_manifest` re-raise including `layout.manifest_path`.

**Suggested fix:**
```python
def _manifest_entries(payload: object) -> list[dict]:
    if isinstance(payload, list):
        return [entry for entry in payload if isinstance(entry, dict)]
    if isinstance(payload, dict):
        for key in ("clips", "entries", "motions"):
            entries = payload.get(key)
            if isinstance(entries, list):
                return [entry for entry in entries if isinstance(entry, dict)]
    raise ValueError(
        "Invalid CMU manifest structure: expected a list of objects or an object "
        "with a 'clips', 'entries', or 'motions' list; "
        f"got {type(payload).__name__} instead."
    )
```

---

## ZPE-Ink (PR #3: feat: execute action brief)

### Overall Feedback
- In both C# and Swift bindings the CRC32 uses polynomial constant 0xEDB8_8320; verify it's the standard CRC-32 (IEEE 802.3) value 0xEDB88320.
- The codec logic is now implemented independently in Python, Swift, and C#; add inline spec references to keep behaviors synchronized.

### Issue 1 — security (code/scripts/run_public_benchmarks.py:45-54)
**Using `tarfile.extractall` / `ZipFile.extractall` on remote archives can expose path traversal risk.**
Both archives are downloaded from remote URLs and extracted without path validation.

**Fix:** Validate member paths before extraction (ensure they remain under target root) or use safe extraction helpers.

---

## ZPE-Geo (PR #3: feat: execute action brief)

### Overall Feedback
- In `run_benchmark.roundtrip_check`, returning immediately on the first non-zero error means `max_abs_error` can be under-reported.
- In `ManeuverSearchIndex.query_radius`, calling `min()` over empty `points` list will raise.

### Issue 1 — bug_risk (code/zpe_geo/search.py:99)
**Guard against trajectories with zero points when computing bounding boxes.**

### Issue 2 — bug_risk (code/zpe_geo/search.py:183-156)
**Handle rows with empty point lists in `query_radius` to avoid `min()` on empty sequence.**

### Issue 3 — bug_risk (code/scripts/run_benchmark.py:210)
**Respect absolute fixture paths instead of always prefixing with `REPO_ROOT`.**

**Fix:**
```python
fixture_paths = []
for raw in args.fixture_paths or []:
    p = Path(raw)
    fixture_paths.append(REPO_ROOT / p if not p.is_absolute() else p)
```

### Issue 4 — suggestion (code/scripts/run_benchmark.py:78-98)
**Roundtrip `max_abs_error` is short-circuited and may under-report the true maximum.**
Keep iterating to update `max_error` and only flip `exact` to `False` once non-zero error is seen.

### Issue 5 — testing (code/tests/test_search_comprehensive.py:54-56)
**Test name `test_bbox_query_returns_multiple_matches` expects only a single trajectory.**

### Issue 6 — testing (code/tests/test_roundtrip.py:39-42)
**Threshold in `test_xy_fixture_error_below_quant_step` doesn't match name (allows 1.1 vs quant_step 0.05).**

### Issue 7 — testing (code/tests/test_roundtrip.py:49-52)
**AIS roundtrip error threshold (25.0m) conflicts with test name "below one meter".**

---

## ZPE-Prosody (PR #3: feat: execute action brief)

### Overall Feedback
- When extracting LibriSpeech archive, use path-traversal check instead of extractall.
- The `append_log` helper rewrites the entire log file on each call; switch to append mode.

### Issue 1 — performance (scripts/librispeech_benchmark.py:64-71)
**Append to log file instead of reading/rewriting full contents each time.**

**Suggested fix:**
```python
def append_log(path: Path, message: str) -> None:
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    entry = f"[{timestamp}] {message}\n"
    with path.open("a", encoding="utf-8") as f:
        f.write(entry)
```

### Issue 2 — performance (.github/workflows/ci.yml:21-24)
**Cache pip dependencies to speed up CI runs.** Use `actions/cache` with key based on `python-version` + hash of `pyproject.toml`.

---

## ZPE-XR (PR #3: feat: execute action brief)

### Overall Feedback
- In `run_phase6_mac_comparator_benchmark.py`, `experiment_key(experiment)` is called unconditionally even when `experiment` may be `None`.
- Comparator lane details are spread across multiple files; centralize shared metadata.

### Issue 1 — issue (code/source/zpe_xr/phase6_benchmarks.py:434-443)
**Latency computation assumes at least one iteration and nonzero frames — can blow up on edge inputs.**
Guard `_latency_metrics` against `iterations == 0`, `num_frames <= 0`, or empty `encode_ns` list.

### Issue 2 — testing (code/tests/test_phase6_benchmarks.py:38)
**Add tests for `benchmark_report` and `attempt_contactpose_report` success/blocked paths.**

### Issue 3 — testing (code/tests/test_phase6_benchmarks.py:47)
**Cover `benchmark_environment` behavior when root is definitely incomplete AND when required modules are all present.**

### Issue 4 — testing (code/tests/test_phase6_benchmarks.py:29)
**Add targeted test for `_transport_metrics` with zero `bytes_total` to guard against divide-by-zero.**

### Issue 5 — testing (code/tests/test_public_benchmark_catalog.py:7-12)
**Dataset ID ordering assertion may be brittle; assert membership instead of exact ordered list.**

### Issue 6 — testing (code/tests/test_public_benchmark_catalog.py:20-27)
**Extend manifest tests to assert contactpose authority anchor and artifact_class.**

### Issue 7 — testing (code/tests/test_comparator_triage.py:7-10)
**Verify that `first_target` ID corresponds to a candidate with `priority == 'first_target'`.**

### Issue 8 — typo (README.md:392)
**Add article: "not a substitute proof" instead of "not substitute proof".**

---

## Cross-Cutting Observations

1. **Path traversal in archive extraction** — Both ZPE-Ink and ZPE-Prosody download remote archives and use `extractall` without path validation. This is a security pattern to fix across all repos that do this.

2. **CI workflows missing permissions** — Multiple repos flagged by CodeQL for missing `permissions` block in GitHub Actions workflows. Add `permissions: { contents: read }` as minimum.

3. **Test naming accuracy** — ZPE-Geo has multiple tests where the name implies a tighter guarantee than the assertion enforces. This erodes trust in the test suite.

4. **sys.path mutation in tests** — ZPE-Mocap (and likely others) manually mutate `sys.path` instead of using proper package installation. Modernize to `pip install -e .` + proper imports.

5. **Rate limiting** — Sourcery hit the 500k diff character weekly limit after reviewing ~8 repos. Bio, IoT, and Robotics were not reviewed. Re-trigger with `@sourcery-ai review` comment on their PRs when the limit resets.
