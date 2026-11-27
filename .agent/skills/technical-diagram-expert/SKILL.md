---
name: technical-diagram-expert
description: Create professional software architecture diagrams and visual documentation using C4 model diagrams (Context, Container, Component, Deployment, Dynamic) and Mermaid (flowcharts, sequence, ERD, state, Gantt). Use when documenting architecture, visualizing data flows, or creating C4/Mermaid diagrams.
---

# Technical Diagram Expert

Generate clear, accurate architecture diagrams and technical visualizations using C4 model and Mermaid syntax. Keep every diagram at a single level of abstraction and verify all depicted components and relationships against actual codebase evidence.

## 1. Choosing the Right Diagram

### C4 Model (Architecture Documentation)

| Level | Diagram | Audience | Shows | When to Create |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `C4Context` | Everyone | System, users, external systems | Always for system docs |
| 2 | `C4Container` | Technical | Apps, APIs, DBs, queues | Always for architecture |
| 3 | `C4Component` | Developers | Internal modules/services | Only when adding clarity |
| 4 | `C4Deployment` | DevOps/Infra | Runtime nodes, hosting, CDNs | Production/infra docs |
| — | `C4Dynamic` | Technical | Numbered request/event flows | Complex runtime flows |

> Rule of thumb: `C4Context` + `C4Container` are sufficient for most teams.

### General Mermaid Diagrams

| Use Case | Mermaid Type |
| :--- | :--- |
| User/process flows, decision trees | `flowchart TD` / `flowchart LR` |
| API & service-to-service interactions | `sequenceDiagram` |
| Database / domain data models | `erDiagram` |
| Lifecycle / state transitions | `stateDiagram-v2` |
| Project timelines / milestones | `gantt` |

## 2. C4 Mermaid Templates

### System Context (Level 1)

```mermaid
C4Context
  title System Context - Application Platform
  Person(user, "User", "Primary end user")
  System(app, "Web Application", "Next.js App Router platform")
  System_Ext(auth, "Auth Provider", "Authentication & identity")
  System_Ext(ai, "LLM Provider", "Inference API")

  Rel(user, app, "Uses", "HTTPS")
  Rel(app, auth, "Authenticates", "HTTPS / OAuth")
  Rel(app, ai, "Generates structured output", "HTTPS / JSON")
```

### Container Diagram (Level 2)

```mermaid
C4Container
  title Container Diagram - Application Platform
  Person(user, "User", "Web & mobile browser")

  Container_Boundary(platform, "Platform") {
    Container(web, "Next.js App", "React, App Router", "SSR pages & Route Handlers")
    ContainerDb(db, "Database", "Firestore / SQL", "Primary persistence")
    Container(cache, "Cache / Queue", "Redis / Worker", "Async jobs & rate limiting")
  }

  Rel(user, web, "Interacts with", "HTTPS")
  Rel(web, db, "Reads/Writes", "SDK / TLS")
  Rel(web, cache, "Enqueues jobs", "TCP")
```

### Dynamic Flow (Sequence Alternative)

```mermaid
sequenceDiagram
  autonumber
  participant U as Client
  participant A as Next.js Route Handler
  participant S as Service Layer
  participant D as Database
  U->>A: POST /api/resource (JSON)
  A->>A: Verify session & Zod schema
  A->>S: Execute domain command
  S->>D: Persist record
  D-->>S: Created entity
  S-->>A: Result<Entity, DomainError>
  A-->>U: 201 Created
```

## 3. Quality Rules

- **Ground in reality:** Every container, route, and store must match actual files or approved design specs.
- **Label every arrow:** Specify action and protocol (`Reads/Writes`, `HTTPS / JSON`, `Server Action`).
- **Quote special characters:** Wrap labels containing parentheses or brackets in quotes (`id["Label (Detail)"]`).
- **Keep readable:** Split diagrams exceeding ~12–15 nodes by bounded context or flow.
