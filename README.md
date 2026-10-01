# AI Agent QA & Regression Testing System

An automated QA system for evaluating AI agents, detecting regressions, benchmarking models, inspecting tool calls, and testing basic security behavior.

This project runs locally with Ollama and uses synthetic test data only.

---

## Overview

AI agents can fail even when the underlying model appears to answer correctly.

Typical failures include:

- calling the wrong tool
- passing the wrong tool argument
- failing to call a required tool
- producing an incorrect final answer
- breaking previously working behavior after a prompt or model change
- exposing information to an unauthorized user
- behaving incorrectly after prompt-injection attempts

This project was built to detect those problems automatically.

---

## Current Features

### Automated QA

- Reusable AI agent execution module
- Automatic PASS / FAIL evaluation
- Tool-call inspection
- Tool-argument validation
- Final-answer validation
- JSON result storage

### Regression Testing

- 100 automated regression test cases
- Baseline result storage
- Current-vs-baseline comparison
- Regression detection
- Improvement detection
- Targeted test execution by test ID

### Model Benchmarking

- Compare multiple Ollama models with the same test cases
- Measure pass rate
- Measure average execution time
- Identify model-specific failures
- Store benchmark results as JSON

### Security Testing

- Authentication checks
- Authorization checks
- Unauthorized order-access tests
- Prompt-injection scenarios
- Identity-manipulation attempts
- Sensitive-data leakage checks
- Application-level security guard

### Dashboard

- Local web dashboard
- Regression summary
- Model comparison
- Security-test summary
- Recent failure display
- Printable client report

---

## Test Results

### Regression Test

Initial full regression run:

- Total tests: 100
- Passed: 96
- Failed: 4

The failed cases were analyzed and the agent policy was improved.

Final regression result:

- Total tests: 100
- Passed: 100
- Failed: 0
- Pass rate: 100%

A stable 100% baseline was then saved for future regression comparison.

---

## Model Benchmark

A representative 20-test benchmark was used to compare two local models.

| Model | Passed | Pass Rate | Average Time |
|---|---:|---:|---:|
| Qwen3 8B | 20 / 20 | 100% | 46.5 sec |
| Qwen3 4B-Instruct | 17 / 20 | 85% | 21.2 sec |

The smaller model was approximately 2.2x faster in this test set, but failed three order-ID argument cases.

This demonstrated why model selection should consider both speed and task reliability.

---

## Security Test

The security test suite includes:

1. Authorized access to the user's own order
2. Unauthorized access to another user's order
3. Administrator-impersonation prompt injection
4. User identity manipulation
5. Request to bypass required tool use
6. Non-existent order lookup
7. Unauthenticated access
8. Mixed authorized and unauthorized order requests

Final result:

- Total security tests: 8
- Passed: 8
- Failed: 0
- Pass rate: 100%

The application enforces authorization outside the language model.

Even if the model fails to call the required tool, an application-level security guard can detect the order ID and route the request through the permission check.

---

## Architecture

```text
User Request
    ↓
AI Agent
    ↓
Tool Selection
    ↓
Tool Arguments
    ↓
Application Permission Check
    ↓
Tool Execution
    ↓
Final AI Response
    ↓
Automated QA Evaluation
    ↓
Regression / Security / Benchmark Results
```

---

## Project Structure

```text
agent-qa
│
├─ agent.js
├─ agent-ai.mjs
├─ agent-core.mjs
├─ qa-test.mjs
├─ test-cases.mjs
├─ regression.mjs
├─ benchmark.mjs
├─ security-agent-core.mjs
├─ security-test.mjs
├─ dashboard-server.mjs
│
├─ dashboard
│  └─ index.html
│
├─ benchmarks
│  ├─ qwen3_8b.json
│  ├─ qwen3_4b.json
│  └─ qwen3_4b_instruct.json
│
├─ results
│  ├─ baseline.json
│  ├─ current.json
│  └─ security.json
│
├─ package.json
├─ package-lock.json
├─ .gitignore
└─ README.md
```

---

## Requirements

- Node.js
- npm
- Ollama
- A compatible local Ollama model

The reference model used in the current regression and security tests is:

```text
qwen3:8b
```

---

## Installation

Install project dependencies:

```bash
npm install
```

Make sure Ollama is running and the required model is available.

Example:

```bash
ollama pull qwen3:8b
```

---

## Run Basic Agent QA

```bash
node qa-test.mjs
```

---

## Run Regression Tests

Run the full regression suite:

```bash
node regression.mjs
```

Run only a limited number of tests:

```bash
node regression.mjs --limit=10
```

Run selected test IDs:

```bash
node regression.mjs --ids=T054,T066,T067,T071
```

Save the current result as a baseline:

```bash
node regression.mjs --save-baseline
```

---

## Run Model Benchmark

Example:

```bash
node benchmark.mjs --model=qwen3:8b --limit=10
```

Another model:

```bash
node benchmark.mjs --model=qwen3:4b-instruct --limit=10
```

---

## Run Security QA

```bash
node security-test.mjs
```

Security results are saved to:

```text
results/security.json
```

---

## Run Dashboard

```bash
node dashboard-server.mjs
```

Then open:

```text
http://localhost:3000
```

The dashboard can also be printed or saved as a PDF report from the browser.

---

## Example QA Flow

Example user request:

```text
1001번 주문 상태 알려줘
```

The QA system checks:

1. Was the correct tool called?
2. Was the correct order ID passed?
3. Did the backend return the expected result?
4. Did the final answer include the correct status?
5. Was the request allowed for the authenticated user?

A failure at any layer can be recorded separately.

---

## Security Design Principle

Authentication and authorization are not trusted to the language model alone.

The application code independently checks the authenticated user's identity and permissions before returning protected data.

This limits the impact of prompt injection or model mistakes.

---

## Data

This repository contains synthetic test data only.

It does not require real customer information, production credentials, or real order data.

---

## Purpose

The purpose of this project is to demonstrate a repeatable workflow for testing AI agents before deployment or after changes to:

- prompts
- models
- tools
- tool schemas
- application logic
- permission rules

The long-term goal is to turn the system into a reusable AI-agent QA and monitoring service.