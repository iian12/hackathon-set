---
name: browser-verification
description: Verify this repository's running app through Playwright MCP and repeatable browser tests, recording observed results.
---

Read README.md for isolated versus live-server commands. npm run test:e2e starts its own server and must not reuse an unknown listener; npm run verify:live explicitly targets the running preview.
Use localhost:3000. Compare /__server_identity, the rendered server ID, and the preview ID. Different IDs mean different servers; do not claim the preview was checked.
Use MCP snapshot refs for input/click and refresh the snapshot after navigation. Verify visible results, not just successful tool responses. Capture a screenshot and check console messages.
Run npm run test:mcp for a recorded MCP handshake, snapshot, typing, click, screenshot and console check. Its expected console probe is a detector control and is logged separately from app errors.
For changed requirements adapt tests/e2e; cover success, empty/invalid input, persistence if required, and console/page errors. Report passed, failed and unverified separately, with commands and artifact paths.
