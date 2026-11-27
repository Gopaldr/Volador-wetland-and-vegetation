# AETHRA | GIS Wetland and Vegetation Engine

Volador Aerospace — enhancement handover, 28 November 2026 (scheduled submission).

Implementation baseline: `3cbc687` on `feature/actionable-qa-findings`. Review: [PR #4](https://github.com/Volador-aero/Volador-wetland-and-vegetation/pull/4). Refer to the pull request for current review and acceptance status.

## Overview
The application supports Sentinel-2 vegetation assessment, single-date and temporal analysis, four-class transitions, change vector analysis (CVA), NDWI surface-water monitoring and cartographic reports. This enhancement makes QA findings actionable, improves project management and strengthens validation, output recovery and frontend reliability.

## Contribution history
Seven enhancement commits dated 17–26 November 2026 follow the Volador-aero baseline of 11 October 2026. Commit summaries, dates and recorded verification are documented in CHANGELOG.md. Full commit details and file inventories are available through Git history and the separate handover package. The implementation diff through commit 3cbc687 covers 56 paths, excluding subsequent documentation updates. This documentation is revision 2.0; it does not represent a new application release.

## Architecture
- React / TypeScript / Vite frontend: `frontend/src`, with OpenLayers maps and ECharts.
- FastAPI application: `backend/app`, including project, dataset, run, result, layer and report routers.
- GIS engine: `backend/Engine_module/src/gis_engine`, with ingestion, alignment, preprocessing, ONNX inference, change analysis, wetland masking, metrics, validation and reporting.
- Local project storage: run outputs, raster layers, JSON results, QA reports, PDF reports and integrity manifests.

The existing model contract uses NDVI, GNDVI, NDRE, NIR and RedEdge in that order; classes 0–3 represent Background, Severe Stress, Moderate Stress and Healthy Vegetation. Required input bands are green, red, rededge and nir. Check dates, grid alignment, CRS and NoData before interpreting results.

## Windows setup
Use an approved checkout of `feature/actionable-qa-findings` containing implementation commit `3cbc687` and the subsequent documentation updates. The observed environment is Python 3.14.6, Node.js 26.13.0 and npm 11.20.0. These are observed versions, not minimum supported versions.

For a new checkout, create an isolated environment from the repository root. The supplied `requirements-observed.txt` records the local packages; installation from this snapshot has not been verified on a clean machine. Review it with the maintainer before installing. Ensure the approved ONNX model and any external weights, configuration and permitted raster inputs are available. Do not substitute a synthetic model for scientific analysis.


```
py -3.14 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-observed.txt
.\.venv\Scripts\python.exe -m pip check
```


Backend terminal (repository root initially):


```
cd backend
$env:PYTHONPATH = "$($PWD.Path)\Engine_module;$($PWD.Path)\Engine_module\src;$env:PYTHONPATH"
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```


Check `http://127.0.0.1:8000/api/health` for HEALTHY and open `http://127.0.0.1:8000/docs` for API schemas. Keep the terminal running.

Frontend terminal (repository root initially):


```
cd frontend
npm.cmd ci
npm.cmd run dev
```


Open the URL printed by Vite (normally http://localhost:5173; another port may be selected). `npm ci` is recommended for the committed lockfile, but a clean install has not been verified. The observed local npm inventory includes extraneous packages; investigate rather than relying on them.

The original README lists `backend/scripts/generate_sample_scene.py` and `backend/scripts/create_onnx_model.py` for optional demo setup. Inspect their output paths before running them in a disposable checkout; never overwrite approved models or real data.

## Using the enhancement
Create or select a project, upload the required bands for the chosen analysis mode, validate datasets, prepare the area of interest, configure and launch analysis. Wait for completion. Open Validation to inspect overall QA, systematic checks and actionable findings. Search by code or message and filter severity/status. Read recommended actions and correct inputs before rerunning. Review Results, maps and available PDF reports only for the selected project and completed run. WARN is not unconditional scientific approval; NOT_AVAILABLE is not zero or PASS.

## Verification commands
From the backend directory, with the environment and PYTHONPATH above:


```
$env:PYTHONDONTWRITEBYTECODE = "1"
..\.venv\Scripts\python.exe -m pytest Engine_module/tests -q -p no:cacheprovider --tb=short
..\.venv\Scripts\python.exe -m pytest tests -q -p no:cacheprovider --tb=short -W error::DeprecationWarning -W error::PendingDeprecationWarning
```


From the frontend directory:


```
npm.cmd test
npm.cmd run lint
npm.cmd run build
```


Recorded local results: 1,005 engine tests passed (one skipped), 48 backend tests passed and 38 frontend tests passed: 1,091 passes, zero failures across separate suites. 22 live API checks passed; browser acceptance was manually reported. Lint, production build and pip check passed. These results are recorded in SUBMISSION_SUMMARY.md; they were not rerun during documentation preparation.

## Limitations and deployment readiness
The revision deliberately restricts the previously optional temporal physical wetland extent calculation. Physical depletion is NOT_AVAILABLE pending verified independent evidence and reviewer approval. General vegetation metrics must not be interpreted as verified wetland depletion. Independent scientific validation, probability calibration and full reproducibility are not established. Checksums establish registered output integrity, not authenticity. One engine test was skipped; latest scientific reporting changes lack dedicated regression coverage. The revision is broad and requires review.

The local application uses filesystem storage and background workers. Do not expose the development server publicly. The supplied entry point permits wildcard CORS with credentials and returns exception details; restrict origins, sanitize errors, and establish authentication and authorization before external deployment. Project-scoped lookup is not access control. Verify concurrency, storage permissions, backup/restore, resource limits, model artifacts, dependency installation, and API base URL configuration in a staging environment. No validated production deployment or clean-environment installation is evidenced. Avoid multiple workers until shared run state and locking are reviewed.

## Handover references
See [CHANGELOG.md](CHANGELOG.md) and [requirements-observed.txt](requirements-observed.txt). The technical handover, complete PDF changelog and illustrated application usage guide are supplied separately in the handover package. Existing IMPLEMENTATION_PLAN.md and SETUP_NOTES.md describe earlier milestones; SUBMISSION_SUMMARY.md includes the revised verification record. Keep historical evidence. Stage documentation explicitly; avoid git add . because generated files and backups may be present.
