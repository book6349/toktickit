# Lab 3 disposable E2E fixtures

Run from the repository root with dependencies installed and local PostgreSQL available (Docker is suitable). Set `DATABASE_URL` to a **new**, unused local database named `toktickit_lab3_e2e_<unique_run>`, with valid local database credentials. Do not use the normal application database.

1. Set the explicit database URL in the current shell. Use a unique name for every full run.
2. Ensure the application ports 3000 and 5173 are free. The default configuration refuses to reuse existing servers.
3. Run `npm run test:e2e`. This first runs `npm run test:e2e:prepare`, then Playwright.
4. Retain complete output, exit code, source SHA, dirty status, date, browser report, traces, and screenshots. Test discovery alone is not an executed E2E pass.

Preparation refuses existing databases and never drops or resets them. It creates a synthetic Lab 2 baseline using the actual migration, inserts a Ticket and Attachment, deploys Lab 3, compares baseline fields and relationships, runs the seed twice, and asserts counts, ownership, authorship, and attachment bytes. These checks are evidence only after successful execution; unit tests of the preparer are not database evidence.

The baseline adds one Ticket and Attachment to the normal seed. Sixteen additional synthetic Queue tickets are inserted only after seed assertions, making pagination executable. IDs are resolved from emails and ticket numbers, not assumed numeric seed IDs. The ignored `artifacts/lab-03/runtime/e2e-fixtures.json` binds IDs to the selected database.

Tests share deliberate serial state: initial logins change passwords, later tests use the changed password, and reset-password verification uses a separate browser context. A previously exercised database is not reset. Start another full run with a new database name.

If `E2E_BASE_URL` is supplied, Playwright does not start servers. The caller must ensure that server uses the same explicit disposable `DATABASE_URL`; set `E2E_API_BASE_URL` when its API address differs. Prefer the default managed-server configuration for submission evidence.

Fixtures contain synthetic data only. Keep their databases and retained evidence until the audit completes. Any eventual cleanup must explicitly identify these disposable databases and files; this setup performs no cleanup of existing data.
