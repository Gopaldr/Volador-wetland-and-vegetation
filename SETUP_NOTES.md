# Setup Notes: Actionable QA Findings

## 1. Prerequisites
- Node.js installed.
- npm installed.
- Project repository cloned locally.
- Frontend dependencies installed.

## 2. Frontend Location
The frontend application is located inside the frontend directory.

## 3. Install Dependencies
Open PowerShell in the frontend directory and run:


npm.cmd install


Run this command only when dependencies need to be installed or restored.

## 4. Start Development Server
Run:


npm.cmd run dev


Open the local URL displayed by Vite.

The usual development URL is:

http://localhost:5173

## 5. Run Focused QA Tests
Run:


npm.cmd test -- src/features/validation/__tests__/ValidationPage.test.tsx


Expected result: 5 tests passed.

## 6. Run Complete Frontend Tests
Run:


npm.cmd test


Verified result:
- 2 test files passed.
- 13 tests passed.

## 7. Production Build
Run:


npm.cmd run build


Verified result:
- TypeScript compilation passed.
- 241 modules transformed.
- Production build completed successfully.
- Build output generated in frontend/dist.

Note: Vite reported a non-blocking warning because the JavaScript bundle exceeds 500 kB after minification. The production build completed successfully.

## 8. QA Findings Data
The Validation page reads structured findings from the backend response at:


results.validation.flags


Supported fields:
- code
- severity
- status
- phase
- message
- recommended_action

Missing optional values are handled using fallback labels.

## 9. Relevant Files
- src/api/client.ts
- src/features/validation/ValidationPage.tsx
- src/features/validation/__tests__/ValidationPage.test.tsx

## 10. Verification Status
- Focused QA tests: PASS.
- Full frontend tests: PASS.
- Production build: PASS.

## 11. Preservation Note
These setup notes describe the frontend Actionable QA Findings improvement. Preserve unrelated local project changes and backend storage data when preparing Git commits.