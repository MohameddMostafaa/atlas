# ADR 001: Initial Application Stack

**Status:** Accepted

**Date:** 2026-08-08

## Context

Atlas is a cloud-native incident management and service monitoring platform that will be developed as a hands-on DevOps and cloud engineering project.

The initial application needs to provide a realistic foundation for future deployment, containerization, CI/CD, infrastructure automation, monitoring, and scaling.

The application itself should remain relatively simple so that the primary focus of the project can remain on DevOps and cloud engineering.

We therefore need to choose an initial frontend framework, backend framework, and database.

## Decision

We will use:

* **Frontend:** React with Vite
* **Backend:** Python with FastAPI
* **Database:** PostgreSQL

### React + Vite

React provides a widely used component-based frontend framework, while Vite provides a lightweight and fast development/build environment.

The frontend does not need to contain complex business logic. Its primary purpose is to provide a user interface for interacting with the Atlas API and displaying service health and incident information.

### Python + FastAPI

FastAPI was selected for the backend because it allows us to build a modern REST API with relatively little framework overhead.

Python also has strong relevance to DevOps and cloud engineering through its use in automation, scripting, cloud SDKs, and infrastructure tooling.

Using Python therefore allows the application backend to also reinforce a language that is valuable outside the application itself.

### PostgreSQL

PostgreSQL was selected instead of SQLite because Atlas is intended to become a server-side, multi-user application.

PostgreSQL is designed as a database server and provides strong support for concurrent workloads, transactions, permissions, indexing, and other capabilities appropriate for production applications.

It also provides a natural foundation for eventually using a managed PostgreSQL service such as Amazon RDS.

SQLite remains useful for local and embedded applications, but its file-based architecture is less appropriate for the production-style architecture we intend to develop.

## Alternatives Considered

### Backend

**Node.js**

Node.js would be a valid choice and is widely used for web APIs and cloud applications. However, Python was selected because of its additional relevance to DevOps automation and cloud engineering, while still being well suited to building the relatively small API required by Atlas.

**Other Python frameworks**

Frameworks such as Django were considered. FastAPI was preferred because Atlas does not initially require the large feature set and conventions provided by Django.

### Database

**SQLite**

SQLite is simple, lightweight, and excellent for local applications and development. It was not selected because Atlas is intended to evolve into a multi-user server-side application where a dedicated database server is more appropriate.

**MySQL**

MySQL would also be a suitable production database. PostgreSQL was selected because of its strong feature set, widespread use in modern backend systems, and suitability for the future architecture of Atlas.

## Consequences

### Positive

* The application stack is relatively lightweight and easy to develop.
* Python provides additional value for future DevOps automation work.
* PostgreSQL provides a strong foundation for a production-style application.
* The technologies are well suited to containerization and cloud deployment.
* The stack gives us a realistic application to progressively introduce DevOps practices around.

### Negative

* We will need to learn and maintain multiple ecosystems: React, Python, and PostgreSQL.
* PostgreSQL requires more setup than a simple SQLite database.
* Choosing FastAPI means we will need to implement some functionality ourselves that frameworks such as Django provide out of the box.

## Future Considerations

This decision describes the initial application stack only.

As Atlas evolves, additional technologies may be introduced when they solve concrete problems. These may include Docker, Redis, message queues, Kubernetes, AWS managed services, monitoring systems, and other infrastructure components.

Technology will not be introduced solely for the purpose of adding tools to the project.

Future architectural changes should be documented separately when they represent significant technical decisions.
