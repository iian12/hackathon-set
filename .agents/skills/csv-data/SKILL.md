---
name: csv-data
description: Import, validate, filter and export CSV data with this repository's reusable helpers and replaceable problem schema.
---

Reuse src/shared/csv.js and table.js; replace src/domain/dashboard.js rules with the actual schema. Do not split CSV on commas manually.
readCsvFile enforces .csv, 2MB, UTF-8, headers and 10,000 rows. Adjust limits only if the question requires it. Invalid files must not overwrite existing valid data.
Return actionable row errors. Keep raw parsing separate from business validation, stable UI IDs and computed metrics. Preserve zero values and sort numeric fields numerically.
toCsv emits UTF-8 BOM, quoted fields and formula escaping; download only the selected view when the UI promises filtered export. Explain if exact raw cell preservation is required instead of safe spreadsheet export.
Check BOM, quoted commas/newlines, duplicate/missing headers, inconsistent row widths, empty files, invalid numbers and download content. Fixtures in public/samples are synthetic practice data.
