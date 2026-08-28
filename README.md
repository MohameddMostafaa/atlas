# Atlas

Atlas is a service-status and incident-management application. It provides a public status page for services and incidents, plus a small authenticated operator interface for managing incidents and service health.

## Features

- Public service status, recent incidents, incident details, and update history.
- Operator login with JWT bearer authentication and Argon2 password hashing.
- Operators can create incidents, move them through their lifecycle, post updates, and change service status.
- PostgreSQL persistence with Alembic migrations and a backend pytest suite.
- Dockerized backend/PostgreSQL deployment, GitHub Actions CI/CD, and Terraform-managed AWS EC2 infrastructure.

## Architecture

```text
Public browser / operator browser
        |
React + Vite frontend
        |  /api/* (development proxy)
FastAPI + SQLAlchemy ---- PostgreSQL
        |
Docker image -> GHCR -> GitHub Actions -> SSM -> EC2

Terraform repository -> AWS EC2, security group, IAM, Terraform state
```

The frontend lives in `app/frontend`; the FastAPI application, migrations, and tests live in `app/backend`. The separate `atlas-infra` repository manages AWS infrastructure and is intentionally independent of the application repository.

## Stack

- Frontend: React, TypeScript, Vite, ESLint
- Backend: Python, FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL
- Authentication: JWT bearer tokens and Argon2 password hashes
- Delivery: Docker, GitHub Actions, GHCR, AWS Systems Manager
- Infrastructure: Terraform and AWS

## Authentication and incident workflow

Public `GET` endpoints remain read-only. Write endpoints require an `Authorization: Bearer <token>` header. The server derives incident `created_by` and update `author_id` from the authenticated token, not client request data.

Incident statuses use the enforced lifecycle:

```text
investigating -> identified -> monitoring -> resolved
```

Service statuses are `operational`, `degraded`, `partial_outage`, and `major_outage`.

## Local development

The commands below are intended for the Ubuntu VM. Use separate terminals for PostgreSQL, backend, and frontend.

### PostgreSQL

Start a local database container:

```bash
docker run --name atlas-postgres --rm -d \
  -e POSTGRES_DB=atlas \
  -e POSTGRES_USER=atlas_app \
  -e POSTGRES_PASSWORD=atlas_dev_password \
  -p 5432:5432 postgres:18
```

### Backend

```bash
cd app/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set these values in `app/backend/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg://atlas_app:atlas_dev_password@localhost:5432/atlas
TEST_DATABASE_URL=postgresql+psycopg://atlas_app:atlas_dev_password@localhost:5432/atlas
JWT_SECRET_KEY=replace-with-a-random-secret-of-at-least-32-bytes
```

Then migrate and run the API:

```bash
alembic upgrade head
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Create an explicit development operator; the script prompts for a password and never stores it in the repository:

```bash
python scripts/create_operator.py operator@example.com
```

### Frontend

```bash
cd app/frontend
npm ci
npm run dev -- --host 0.0.0.0
```

Open `http://<vm-ip>:5173`. Vite forwards frontend `/api/services` requests to FastAPI `/services` at `http://localhost:8000`; it does the same for incidents and authentication. Set `VITE_API_BASE_URL` only when using a different API location.

## Verification

Backend tests require PostgreSQL and the environment variables above:

```bash
cd app/backend
pytest
```

Frontend checks:

```bash
cd app/frontend
npm run lint
npm run build
```

## Docker and delivery

`Dockerfile` builds the FastAPI backend image. `docker-compose.yml` runs PostgreSQL and that backend image; it expects `POSTGRES_PASSWORD` and `IMAGE_TAG` in its environment. The current Compose setup exposes the API on port 80 and does not package the Vite frontend. It also does not currently pass `JWT_SECRET_KEY` to the API container, so authenticated operator actions require a deployment configuration update before they can run in that Compose environment.

The application GitHub Actions workflow runs backend tests and migrations against PostgreSQL, builds and pushes a GHCR image, performs a Docker Compose integration check, then deploys the image to the EC2 instance through AWS Systems Manager. Deployment scripts perform a health check and attempt rollback on failure.

## Infrastructure

The sibling `atlas-infra` repository stores Terraform for the existing AWS environment: an EC2 instance, HTTP security group, IAM roles for EC2/SSM/GitHub OIDC, and remote S3 Terraform state. Its workflows run plan on infrastructure pull requests and apply on pushes to `main`. Treat infrastructure changes as production changes and review Terraform plans before merging.

## Current scope

Atlas v1 focuses on a small, working status page and operator workflow. Production frontend hosting, TLS, monitoring, Kubernetes, and automated database backups are not part of this repository’s current implemented application scope.
