# Plan Técnico de Implementación: `job-seeker-auto`
## Automatización Modular de Búsqueda, Evaluación con IA (Ollama) y Postulación en CompuTrabajo

---

## 1. Objetivo General y Alcance

El proyecto **`job-seeker-auto`** tiene como finalidad automatizar el flujo integral de búsqueda, filtrado inteligente y postulación a vacantes laborales en **CompuTrabajo** para el perfil profesional de **Santiago Monrroy López** (QA Analyst & Technical Quality Specialist / Web Developer).

### Características Principales:
1. **Infraestructura Contenerizada (Docker Compose):** Arquitectura modular de servicios (`ollama`, `n8n`, `playwright-service`) comunicados en una red interna dedicada (`job_seeker_network`).
2. **Base de Conocimiento del Candidato (`profile.json`):** Perfil estructurado con experiencia, habilidades técnicas, proyectos, educación, certificaciones y respuestas a preguntas típicas de selección.
3. **Persistencia y Deduplicación (SQLite):** Base de datos relacional local en `./data/jobs.sqlite` para registrar vacantes encontradas, evitar reprocesamientos y auditar estados (`DISCOVERED`, `EVALUATED`, `REJECTED`, `PENDING_APPROVAL`, `APPLIED`, `FAILED`).
4. **Motor de Inferencia Local (Ollama):** Evaluación de afinidad técnica ($\ge 70\%$) y generación de respuestas a cuestionarios del empleador de forma privada y autónoma.
5. **Navegación Web y Persistencia de Sesión (Playwright en Node/TS):** Interacción con CompuTrabajo reutilizando la sesión activa del navegador (`storageState.json`) para evadir retos de Cloudflare y captchas.
6. **Pre-Notificación y Aprobación 100% en Texto:** Generación de un resumen estructurado (título, empresa, score, justificación y preguntas con respuestas propuestas) antes del envío final, esperando confirmación manual.
7. **Orquestación Visual (n8n):** Workflow automatizado para coordinar búsqueda, deduplicación, inferencia, notificación y postulación.
8. **Metodología de Desarrollo por Commits Atómicos:** Cada cambio funcional se entregará con su comando exacto de Git para revisión y ejecución manual por el desarrollador.

---

## 2. Diagrama de Arquitectura y Flujo de Información

```
+-------------------------------------------------------------------------------------------------+
|                                     ENTORNO DOCKER COMPOSE                                      |
|                                                                                                 |
|   +--------------------------+       +--------------------------+       +-------------------+   |
|   |           n8n            | <---> |    Playwright Service    | <---> |   Base de Datos   |   |
|   |   (Orquestador Visual)   |       |     (Node.js / TS API)   |       |   (jobs.sqlite)   |   |
|   |       Puerto: 5678       |       |       Puerto: 3000       |       |   (./data/jobs)   |   |
|   +------------+-------------+       +------------+-------------+       +-------------------+   |
|                |                                  |                                             |
|                v                                  v                                             |
|   +--------------------------+       +--------------------------+                               |
|   |          Ollama          |       |   Sesión de Navegador    |                               |
|   |    (LLM: qwen2.5:3b)     |       |   (storageState.json)    |                               |
|   |       Puerto: 11434      |       |  (./data/sessions/state) |                               |
|   +--------------------------+       +--------------------------+                               |
+----------------|----------------------------------|---------------------------------------------+
                 |                                  |
                 v                                  v
      +----------------------+            +-------------------+
      | Canal Notificación   |            |   CompuTrabajo    |
      | (Texto estructurado) |            |   (Portal Web)    |
      +----------------------+            +-------------------+
```

---

## 3. Tablero de Control y Checklist del Proyecto (TODO List)

* [x] **Fase 1: Repositorio Base & Base de Conocimiento**
  * [x] `1.1` Inicializar repositorio Git y crear `.gitignore` (excluyendo sesiones, DBs y `.env`).
  * [x] `1.2` Crear plantilla de variables `.env.example` con configuraciones de entorno.
  * [x] `1.3` Crear `profile.json` estructurado con CV, habilidades, preferencias y respuestas tipo.
* [ ] **Fase 2: Infraestructura Docker (Docker Compose)**
  * [ ] `2.1` Crear carpeta persistente `data/` y `docker-compose.yml` base (red `job_seeker_network`).
  * [ ] `2.2` Configurar servicio `ollama` y validar arranque en puerto `11434`.
  * [ ] `2.3` Configurar servicio `n8n` y validar interfaz en puerto `5678`.
  * [ ] `2.4` Configurar servicio `playwright-service` con su `Dockerfile` base.
* [ ] **Fase 3: Estandarización de Datos (SQLite)**
  * [ ] `3.1` Crear `data/schema.sql` (tablas `jobs` y `applications_log`).
  * [ ] `3.2` Crear script `data/init_db.js` y verificar creación de `data/jobs.sqlite`.
* [ ] **Fase 4: Ambiente Ollama e Inferencia Standalone**
  * [ ] `4.1` Descargar modelo ligero (`qwen2.5:3b` o `llama3.2:3b`) en el contenedor de Ollama.
  * [ ] `4.2` Diseñar prompts estructurados `evaluate_match.prompt` ($\ge 70\%$) y `answer_questions.prompt`.
  * [ ] `4.3` Crear script `ollama/test_inference.js` para probar API directa con respuestas JSON.
* [ ] **Fase 5: Microservicio Playwright (Node.js/TypeScript)**
  * [ ] `5.1` Estructurar `playwright-service` (`package.json`, `tsconfig.json`, `browserManager.ts`).
  * [ ] `5.2` Implementar script interactivo `sessionSaver.ts` para capturar y guardar `storageState.json`.
  * [ ] `5.3` Implementar endpoint de búsqueda `POST /jobs/search` con soporte de paginación.
  * [ ] `5.4` Implementar endpoint de detalle y preguntas `POST /jobs/detail`.
  * [ ] `5.5` Implementar endpoints de postulación `POST /jobs/prepare-apply` y `POST /jobs/submit-apply`.
* [ ] **Fase 6: Orquestación en n8n**
  * [ ] `6.1` Subflujo de búsqueda periódica y deduplicación contra SQLite.
  * [ ] `6.2` Subflujo de evaluación con Ollama y generación de pre-notificación en texto.
  * [ ] `6.3` Subflujo de aprobación por webhook y postulación final en Playwright.
  * [ ] `6.4` Exportación del workflow consolidado `n8n/workflows/computrabajo_auto_apply.json`.

---

## 4. Estructura de Directorios del Proyecto

```text
C:\_code\job-seeker-auto/
├── .env.example                               # Variables de entorno [CREADO]
├── .gitignore                                 # Exclusiones de Git [CREADO]
├── profile.json                               # Base de conocimiento del candidato [CREADO]
├── job-seeker-plan.md                         # Documento maestro del plan [ESTE ARCHIVO]
├── cv_es_santiago_monrroy_lopez_markdown.md   # CV original (Español)
├── cv_en_santiago_monrroy_lopez_markdown.md   # CV original (Inglés)
├── docker-compose.yml                         # Definición de servicios (Ollama, n8n, Playwright)
├── data/
│   ├── schema.sql                             # Esquema SQL (jobs y applications_log)
│   ├── init_db.js                             # Script de inicialización de SQLite
│   ├── jobs.sqlite                            # Base de datos SQLite local
│   └── sessions/
│       └── storageState.json                  # Sesión activa de CompuTrabajo
├── ollama/
│   ├── test_inference.js                      # Script de test de API Ollama
│   └── prompts/
│       ├── evaluate_match.prompt              # Prompt de evaluación de afinidad
│       └── answer_questions.prompt            # Prompt de resolución de preguntas
├── playwright-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts                          # API REST Express
│       ├── config.ts                          # Rutas y constantes
│       ├── browser/
│       │   ├── browserManager.ts              # Playwright con storageState
│       │   └── sessionSaver.ts                # Helper interactivo de login
│       ├── scrapers/
│       │   ├── computrabajoSearch.ts          # Búsqueda y listado
│       │   ├── computrabajoDetail.ts          # Detalle y cuestionarios
│       │   └── computrabajoApply.ts           # Relleno de campos y postulación
│       └── routes/
│           ├── auth.routes.ts                 # Chequeo de sesión
│           └── jobs.routes.ts                 # Endpoints para n8n
└── n8n/
    └── workflows/
        └── computrabajo_auto_apply.json       # Workflow exportable
```

---

## 5. Especificaciones Técnicas por Componente

### 5.1. Docker Compose (`docker-compose.yml`)
- Red unificada: `job_seeker_network` (bridge).
- Volúmenes:
  - `ollama_models`: Persistencia de los modelos de IA descargados.
  - `n8n_data`: Configuración interna de n8n.
  - `./data`: Mapeo directo al directorio local para compartir `jobs.sqlite` y `storageState.json` entre servicios.
- Puertos expuestos:
  - `11434`: Ollama API.
  - `5678`: n8n Web UI y Webhooks.
  - `3000`: Playwright Service API.

### 5.2. Base de Datos SQLite (`data/jobs.sqlite`)
- **Tabla `jobs`:**
  - `id` (TEXT PRIMARY KEY): Identificador único o hash de la oferta.
  - `title`, `company`, `location`, `salary`, `url` (UNIQUE).
  - `description` (TEXT): Contenido completo de la vacante.
  - `score` (INTEGER): Afinidad calculada por Ollama (0 a 100).
  - `match_reason` (TEXT): Justificación del análisis de IA.
  - `status` (TEXT): `DISCOVERED` | `EVALUATED` | `REJECTED` | `PENDING_APPROVAL` | `APPLIED` | `FAILED`.
  - `has_questions` (BOOLEAN): Si la vacante contiene preguntas de filtro.
  - Timestamps: `created_at`, `evaluated_at`, `applied_at`.
- **Tabla `applications_log`:**
  - `id` (INTEGER PRIMARY KEY), `job_id` (TEXT), `questions_and_answers` (JSON/TEXT), `status` (TEXT), `error_message` (TEXT), `timestamp`.
- **Índices:** `idx_jobs_status` y `idx_jobs_url` para deduplicación instantánea.

### 5.3. Prompts de Inferencia de Ollama
- **Prompt de Evaluación (`evaluate_match.prompt`):**
  Recibe la descripción de la oferta y `profile.json`. Devuelve JSON estricto:
  ```json
  {
    "score": 85,
    "should_apply": true,
    "summary_reason": "El candidato cumple con los requisitos técnicos de automatización y QA.",
    "pros": ["Experiencia en Playwright y TypeScript", "Inglés B2"],
    "cons": ["Deseable experiencia en AWS"]
  }
  ```
- **Prompt de Respuestas (`answer_questions.prompt`):**
  Recibe las preguntas formuladas por la empresa en CompuTrabajo y devuelve respuestas redactadas en primera persona basadas exclusivamente en `profile.json`.

### 5.4. Formato de Pre-Notificación (100% Texto)
Mensaje enviado por el canal de notificación (Telegram / Webhook) para pre-aprobación:
```text
🔔 NUEVA POSTULACIÓN LISTA PARA APROBACIÓN

📌 Cargo: Senior QA Automation Engineer
🏢 Empresa: Tech Solutions SAS
📍 Ubicación: Bogotá (Híbrido)
💰 Salario: $5.000.000 COP
🎯 Score de Afinidad: 88%
💡 Razón: Coincidencia alta en Playwright, TypeScript y metodologías ágiles.

📝 PREGUNTAS Y RESPUESTAS DEL FORMULARIO:
1. ¿Cuántos años de experiencia tienes en automatización con Playwright?
  R: Cuento con más de 3 años de experiencia en QA técnico y automatización de pruebas E2E utilizando Playwright con TypeScript bajo el patrón Page Object Model.

2. ¿Cuál es tu pretensión salarial?
  R: Mi pretensión salarial base es de $4.000.000 a $5.000.000 COP según beneficios.

3. ¿Tienes disponibilidad inmediata?
  R: Sí, cuento con disponibilidad inmediata para iniciar labores en modalidad remota o híbrida en Bogotá.

[APROBAR POSTULACIÓN]  |  [DESCARTAR]
```

### 5.5. Microservicio Playwright (Endpoints REST)
- `POST /auth/save-session`: Abre navegador para autenticación interactiva única.
- `POST /jobs/search`: `{ keywords, location, maxPages }` -> `[ { id, title, company, location, url } ]`.
- `POST /jobs/detail`: `{ url }` -> `{ description, hasQuestions, questions: [...] }`.
- `POST /jobs/prepare-apply`: `{ url, answers }` -> Rellena campos y retorna `{ ready: true }`.
- `POST /jobs/submit-apply`: `{ url }` -> Ejecuta el click de postulación final y valida confirmación en el DOM.

---

## 6. Plan de Verificación y Criterios de Aceptación

| Fase | Verificación | Criterio de Éxito |
| :--- | :--- | :--- |
| **Fase 2** | `docker compose ps` | Contenedores `ollama`, `n8n` y `playwright-service` en estado `running`. |
| **Fase 3** | `node data/init_db.js` | Archivo `data/jobs.sqlite` creado con tablas indexadas. |
| **Fase 4** | `node ollama/test_inference.js` | Respuesta HTTP 200 con JSON válido (score y pros/cons). |
| **Fase 5** | `npm run session:save` y `/jobs/search` | Sesión guardada y lista de ofertas reales devueltas. |
| **Fase 6** | Ejecución de workflow en n8n | Notificación en texto recibida -> confirmación manual -> postulación exitosa y log en SQLite. |
