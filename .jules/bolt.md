## 2026-03-30 - Array Spread and Mapping in Record Serialization Loops
**Learning:** In `data-store.js`, `packRecords` is called during dataset persistence. Using `...C().metricKeys.map(...)` inside the loop per record allocated tens of thousands of short-lived metric arrays and spread arguments, creating heavy GC and CPU overhead when saving datasets.
**Action:** When serializing/packing large datasets, pull schema keys out of the record loop, pre-allocate output arrays, and push metric values directly without spread operators.

## 2026-03-31 - Redundant Payload Generation in Export Preview Checks
**Learning:** In `app.js`, `previewPackage` checks which export files are available to show status cards in the `#datos` view. Calling `EXPORT_BUILDERS` built full export payloads (forecasts, diagnostics, narratives, etc.) for each module, allocating megabytes of objects only to check availability (`e.obj ? true : false`) and discard the payload.
**Action:** Pass a `previewOnly` flag to export builders when checking status/availability so expensive payload generation is bypassed when only metadata or status is needed.
## 2026-03-30 - Linear Search and Map Instantiation in Record Sorting Comparators
**Learning:** In `data-model.js` and `data-view.js`, `getChannel` performed `Array.find` scans per record, and `filtered` instantiated `new Map()` with Map `.get()` calls inside $O(N \log N)$ sort comparators for large datasets.
**Action:** Cache static entity lookups in a Map/object index, pre-calculate sort order mappings outside sorting loops, and use fast property lookups in comparison callbacks.
## 2026-03-30 - Single-Pass Aggregation over Batch Issues
**Learning:** In `coverage.js` and `data-view.js`, batch issues were processed using `flatMap` followed by multiple `.filter()` and `.reduce()` operations. With tens of thousands of issues across batches, this created heavy GC pressure through intermediate arrays and iterated over the issues array up to 5 times.
**Action:** Combine batch row counts, rejections, issue counts (`error` / `warning`), and `issuesByType` into a single imperative loop over `bats` and `b.issues` to eliminate array allocations and achieve ~3.8x CPU speedup.
