# e2e-live — real end-to-end suite against staging

A suite that hits the **real HTTP entry point** (`E2E_BASE_URL`), traversing controller → use case → staging Firestore. It uses neither fakes nor `dispatch`. Isolated from CI: the `*.e2e-live.spec.ts` files are ignored by `yarn test` / `yarn test:ci:unit` via `testPathIgnorePatterns`.

## 1. Prerequisites

- Dev container up: `yarn start:docker:dev` (app on `:8889`, nginx on `:80`, `GET /api/health` → 200).
- `E2E_BASE_URL` in `.env.test` (default `http://localhost/api`; automatic fallback to `http://localhost:8889/api` when not configured).
- Active Firebase creds in `.env` (project `cartera-tst`) — used only by the cleanup (`yarn e2e:purge`), not by the HTTP suite.

## 2. Run the suite

```bash
yarn test:e2e
```

- Dedicated runner (`jest-e2e-config.ts`): `runInBand`, no coverage gate, no mock `setupFiles`.
- `globalSetup` applies the **anti-prod gate** (aborts if the host looks like production or is not local without `E2E_ALLOW_REMOTE=true`) and picks the first healthy target.
- Each run writes a manifest to `test/e2e/.artifacts/manifest-<runId>.json`:
  ```json
  {
    "runId": "...",
    "baseUrl": "...",
    "userIds": [],
    "authUids": [],
    "entities": {}
  }
  ```

## 3. Cleanup — two layers

The suite performs a **soft delete** through the routes (for coverage), which is **not** the real cleanup. The hard cleanup runs **post-suite, outside Jest**:

### 3a. Hard sweep by owner (via MCP firebase — run by Claude)

Reading `userIds` from the manifest, for each `uid`, in each owned collection:

- Collections swept: `persons`, `Transaction`, `Wallet`, `WalletMovement`.
- For each collection: `query where userId == uid` → delete each returned doc (includes `WalletMovement` and tree children the API does not return).
- **Fixed catalogs are NEVER swept nor mutated:** `Category`, `Payment_Method`, `Payment_Status`, `Financial_Indicator`.
- Firestore database: default `(default)`.

MCP procedure (per manifest `uid`):

```
firestore_query_collection persons        where userId == <uid>  → firestore_delete_document (each)
firestore_query_collection Transaction     where userId == <uid>  → firestore_delete_document (each)
firestore_query_collection Wallet          where userId == <uid>  → firestore_delete_document (each)
firestore_query_collection WalletMovement  where userId == <uid>  → firestore_delete_document (each)
```

### 3b. Hard-delete the Auth users (firebase-admin)

The MCP does not remove a user from Firebase Auth — dedicated script:

```bash
yarn e2e:purge              # union of authUids across all manifests
yarn e2e:purge <runId>      # only the manifest for the given run
```

The script reuses `serviceAccountKey` (same init as the migrations) and has its own anti-prod gate (aborts if `projectId` contains `prod`).

## 4. Post-suite (checklist)

1. `yarn test:e2e` → suite green.
2. Hard sweep by owner (§3a) per `userId`.
3. `yarn e2e:purge` (§3b).
4. Verify Firestore/Auth are clean and the fixed catalogs are intact.
