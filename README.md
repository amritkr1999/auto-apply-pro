# Auto Apply Pro

Auto Apply Pro is an AI-powered career coach and job search automation platform designed to simplify the job hunting process. The core focus of the project is to automate the cold emailing and application outreach phase, reducing application fatigue and letting job seekers focus on interview preparation.

* **System Design Architecture**: View the design diagrams on [Lucidchart](https://lucid.app/lucidchart/6707ac3d-7e0e-43f8-a861-53cf3db1c9ba/edit?viewport_loc=32%2C-11%2C1575%2C895%2C0_0&invitationId=inv_8000be9d-0c0e-47eb-b0a4-2e5fdc796501).
* **UI/UX Design**: View the SaaS Dashboard mockup on [Figma](https://www.figma.com/make/BuR77V0IplrEwWdMx8wGda/SaaS-Dashboard-for-AutoApply-Pro?t=th4ZFWN23WX9ofYJ-1).

---

## Project Structure

This project is structured as a monorepo containing the following components:

* **[backend](file:///Users/amrit/Development/work/auto-apply-pro/backend)**: A Spring Boot application providing the REST API, database access (Hibernate/JPA), and user/candidate authentication and management.
* **[frontend](file:///Users/amrit/Development/work/auto-apply-pro/frontend)**: A React frontend application built with TypeScript and Vite, providing a modern SaaS dashboard and profile/job pipeline interfaces.
* **[pipeline](file:///Users/amrit/Development/work/auto-apply-pro/pipeline)**: A local Python-based AI pipeline utilizing Poetry, Alembic, and FastAPI. It orchestrates job description OCR/extraction (via local Ollama/Deepseek-vision) and resume parsing.
* **[pipeline_architecture](file:///Users/amrit/Development/work/auto-apply-pro/pipeline_architecture)**: Detailed architecture specifications and diagrams for the local AI pipeline.

---

## Project Description

### 1. Executive Summary & Value Proposition
* **The Problem:** Job seekers face significant "application fatigue" due to the slow, repetitive, and error-prone process of manually searching for jobs, tailoring resumes, and tracking application statuses.
* **The Solution:** Auto Apply Pro serves as an intelligent agent that automates the repetitive parts of the job search process (searching, drafting, applying), freeing up candidates to focus on high-value activities like interviewing and networking.
* **Target Audience:** Anyone actively searching for a job.

### 2. Feature Matrix (MVP vs. Future Releases)

| Feature | Scope | Description |
| :--- | :--- | :--- |
| **Automated Email Drafting** | MVP (Phase 1) | Automatically draft personalized emails based on user resumes and job descriptions. |
| **Scheduled Email Sending** | MVP (Phase 1) | Send outreach emails via SMTP with rate-limiting to protect sender reputation. |
| **PostgreSQL Database Tracking** | MVP (Phase 1) | Keep track of manual job entries, CSV imports, and application statuses. |
| **AI Resume Optimizer/ATS Checker** | Nice-to-Have (V2+) | Parse resumes and optimize them to match ATS systems. |
| **Multi-Profile Portfolio Management** | Nice-to-Have (V2+) | Manage multiple portfolios or resumes for different target roles. |
| **Automated Job Scraping/Discovery** | Nice-to-Have (V2+) | Automatically find and crawl new job listings based on preferences. |
| **Mock Interview Platform** | Nice-to-Have (V2+) | Provide AI-driven mock interview sessions and feedback. |

### 3. End-to-End User Journey
1. **Onboarding:** User registers and creates their profile.
2. **Asset Upload:** User uploads their primary resume and defines job search preferences.
3. **Job Pipeline:** System pulls relevant job opportunities into a "Review" queue.
4. **Drafting & Review:** User reviews AI-generated draft emails for specific job listings and clicks "Approve".
5. **Outreach:** The system automatically sends the email via SMTP and updates the application status to "Sent" in the database.
6. **Tracking:** User views the dashboard to see application statuses ("Pending", "Rejected", "Interviewing") and leverages AI analytics to understand rejection trends.

### 4. Success Metrics
* **Outreach Velocity:** Number of personalized applications sent per week per user.
* **Response Rate:** Percentage of applications resulting in a recruiter response or interview request.
* **System Health:** Email deliverability rate (percentage of successfully sent emails without bounce-backs).
* **User Efficiency:** Time saved per application compared to manual processing.

### 5. Recent System Updates
* **Skills Database Refactoring**: Created a separate `skills` database table and established a many-to-many relationship (`candidate_skills`) with the `candidates` table. This allows dynamic skill categorization and autocomplete features.
* **Resume Upload & DB Storage**: Implemented file upload for resumes, saving them directly as a byte array (BLOB) (`resume_bytes`) in the PostgreSQL candidate profile.
* **UI Redesign**: Refactored the dashboard layout and candidate profile pages to match the Figma designs.

---

## Local Setup & Run Instructions

Follow these steps to get the project running locally on your machine.

### Prerequisites
Make sure you have the following installed:
* **Java 21 (LTS)** or newer
* **Node.js** (v18 or newer recommended) and **npm**
* **Python 3.9+** and **Poetry**
* **PostgreSQL** database server
* **Ollama** (configured with local LLM models)

---

### 1. Database Setup
1. Start your local PostgreSQL server.
2. Create a new database named `autoapplypro`.
3. The database connection properties can be found and configured in:
   [backend/src/main/resources/application.properties](file:///Users/amrit/Development/work/auto-apply-pro/backend/src/main/resources/application.properties)
   * Default URL: `jdbc:postgresql://localhost:5432/autoapplypro`
   * Default Username: `amrit`
   * Default Password: `amrit123`
   *(Update these credentials in your local properties if your PostgreSQL settings differ.)*

---

### 2. Backend Setup & Run
The backend is built with Spring Boot and Maven.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build and run the application using the Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Once running, the server will start on port `8060`.
4. You can access the OpenAPI Swagger documentation at:
   [http://localhost:8060/swagger-ui.html](http://localhost:8060/swagger-ui.html)

---

### 3. Frontend Setup & Run
The frontend is built with React, TypeScript, and Vite.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Once running, you can access the frontend in your browser (typically at [http://localhost:5173](http://localhost:5173)).

---

### 4. AI Outreach Pipeline Setup & Run
The AI outreach pipeline is a Python-based asynchronous service that handles job description (JD) extraction, candidate resume parsing, and personalized outreach email generation.

1. Navigate to the pipeline directory:
   ```bash
   cd pipeline
   ```
2. Copy the environment variables template and configure them:
   ```bash
   cp .env.example .env
   ```
   *(Edit the `.env` file to specify your local database credentials, Ollama API endpoint, and Spring Boot API endpoints.)*
3. Install dependencies using Poetry:
   ```bash
   poetry install
   ```
4. Run the database migrations using Alembic to set up the pipeline schemas:
   ```bash
   poetry run alembic upgrade head
   ```
5. Start the FastAPI development server:
   ```bash
   poetry run uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload
   ```
6. Once running, the service starts on port `8000`. You can access the API endpoints (e.g., `/extract-job-details`, `/parse-resume`) to interact with the pipeline.

---

## Contributing Rules

To maintain a clean and stable codebase, please adhere to the following issue-based contribution workflow:

### 1. Issue Assignment
* **Do not start work without an issue.** All work must be tracked via GitHub issues created by the project owner.
* Before starting, select an issue, assign it to yourself (or comment to indicate you are working on it), and mark it as "working on it."

### 2. Branching & Naming
* **Do not merge directly into the `main` branch.**
* Always create a new side branch branching off from the `develop` branch.
* Link the branch with the issue by naming it descriptively, preferably including the issue number:
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b issue-<number>/<short-description>
  # Example: git checkout -b issue-42/add-email-rate-limiting
  ```

### 3. Development & Pull Request
* Implement your changes, write tests if applicable, and commit your work.
* Once ready, push your branch and open a Pull Request (PR) to merge your branch **back into the `develop` branch**.
* Make sure to link the PR to the original issue (e.g., by writing `Closes #<issue-number>` in the PR description).

### 4. Code Review & Release
* Get your PR reviewed and approved by the team/owner.
* Once approved, the PR can be merged into `develop`.
* Periodically, the project owner will personally review and merge the `develop` branch into the `main` branch.
