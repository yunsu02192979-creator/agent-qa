# AI Agent QA & Regression Testing System

A portfolio project for evaluating AI agent reliability, tool use, regressions, model performance, and basic security behavior.

> This project uses synthetic test data only. It does not connect to real customer or production data.

## What It Tests

- Tool selection
- Tool arguments
- Tool execution results
- Final-answer correctness
- Regression after prompt or model changes
- Model A/B benchmarking
- Unauthorized data access
- Prompt injection attempts
- Authentication and permission failures

## Verified Results

### Regression Testing

- 100 automated test cases
- 100 / 100 passed
- 100% pass rate
- Baseline comparison implemented
- Regression and improvement detection implemented
- Baseline average duration: 45.7 seconds per test

### Model Benchmark

| Model | Passed | Pass Rate | Average Duration |
| --- | ---: | ---: | ---: |
| qwen3:8b | 20 / 20 | 100% | 46.5 s |
| qwen3:4b-instruct | 17 / 20 | 85% | 21.2 s |

The smaller model was faster in this benchmark, but failed three cases at the tool-argument level. This demonstrates why latency alone is not enough when choosing an agent model.

### Security Testing

- 8 security scenarios
- 8 / 8 passed after application-level safeguards
- Unauthorized order access blocked
- Unauthenticated access blocked
- Prompt-injection scenarios tested
- Protected order information was not leaked in the test suite

## Security Design

Authorization is enforced in application code rather than relying only on the model prompt.

The model may decide which tool to call, but the application controls the authenticated user context and checks ownership before returning protected order data.

A fallback security guard also handles cases where the model fails to call the required order-status tool.

## Dashboard

The project includes a local web dashboard that reads saved regression, benchmark, and security results.

Run:

```powershell
node dashboard-server.mjs
```

Then open:

```text
http://localhost:3000
```

The dashboard can also be printed or saved as a PDF client report.

## Main Commands

Install dependencies:

```powershell
npm install
```

Run the basic QA suite:

```powershell
node qa-test.mjs
```

Run the 100-case regression suite:

```powershell
node regression.mjs
```

Run the security suite:

```powershell
node security-test.mjs
```

Run a model benchmark:

```powershell
node benchmark.mjs --model=qwen3:8b --limit=20
```

## Project Structure

```text
agent-qa/
├─ agent-core.mjs
├─ agent-ai.mjs
├─ regression.mjs
├─ benchmark.mjs
├─ security-agent-core.mjs
├─ security-test.mjs
├─ test-cases.mjs
├─ dashboard-server.mjs
├─ dashboard/
├─ results/
└─ benchmarks/
```

## Example QA Flow

For an order-status request, the system checks:

1. Whether the correct tool was called
2. Whether the correct order ID was passed
3. Whether the tool returned the expected result
4. Whether the final answer reflected the tool result
5. Whether an unauthorized user was prevented from accessing another user's order

## Why This Project Exists

AI agents can appear to work correctly on a few happy-path examples while still failing on edge cases, model changes, tool arguments, or permission boundaries.

This project demonstrates a repeatable process for:

- detecting failures,
- reproducing them,
- comparing model versions,
- checking regressions,
- testing basic security scenarios,
- and presenting the results in a client-readable dashboard.

## Current Scope and Limitations

This is a portfolio prototype, not a production security certification system.

Current limitations include:

- synthetic order data only,
- a small tool set,
- local Ollama models,
- simplified authentication and authorization,
- a limited adversarial security test set.

The next production-oriented steps would be broader test generation, CI integration, scheduled monitoring, multi-project support, and customer-specific evaluation rules.
