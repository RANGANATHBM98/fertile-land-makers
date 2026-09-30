# Agri App

## Run locally on Windows

Use two PowerShell terminals from the project folder, `C:\agri-app`.

### Backend terminal

For a first-time setup, install the Python dependencies:

```powershell
Set-Location C:\agri-app\backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Start the API (the database and local storage directories are initialized automatically):

```powershell
Set-Location C:\agri-app\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API is at <http://localhost:8000> and its interactive documentation is at <http://localhost:8000/docs>.

### Frontend terminal

Set the Windows command shell for this PowerShell session, then install frontend dependencies (managed by pnpm) on first setup:

```powershell
Set-Location C:\agri-app\frontend
$env:ComSpec = "$env:SystemRoot\System32\cmd.exe"
corepack prepare pnpm@11 --activate
corepack pnpm install
```

Start the app:

```powershell
Set-Location C:\agri-app\frontend
$env:ComSpec = "$env:SystemRoot\System32\cmd.exe"
npm run dev
```

The app is at <http://localhost:3000>. The dev script uses Webpack because Turbopack currently produces a React Server Components manifest runtime error in this project.

Keep both terminals open while using the app. Press `Ctrl+C` in each terminal to stop its server. The frontend uses `http://localhost:8000/api` by default; set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to override it.

## Checks

From `frontend/`, run `npm run build` or `.\node_modules\.bin\tsc.cmd --noEmit`. From `backend/`, run `python -m pytest`.

See [backend/README.md](backend/README.md) for administrator setup and API workflow details.
