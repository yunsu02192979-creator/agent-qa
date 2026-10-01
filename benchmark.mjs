import fs from "fs/promises";
import path from "path";

import { runAgent } from "./agent-core.mjs";
import tests from "./test-cases.mjs";

// -----------------------------------
// 명령줄 옵션
// -----------------------------------

const args = process.argv.slice(2);

const modelArg = args.find((arg) =>
  arg.startsWith("--model=")
);

const limitArg = args.find((arg) =>
  arg.startsWith("--limit=")
);

const idsArg = args.find((arg) =>
  arg.startsWith("--ids=")
);

const model = modelArg
  ? modelArg.split("=")[1]
  : "qwen3:8b";

const limit = limitArg
  ? Number(limitArg.split("=")[1])
  : tests.length;

let selectedTests;

if (idsArg) {
  const selectedIds = idsArg
    .split("=")[1]
    .split(",")
    .map((id) => id.trim());

  selectedTests = tests.filter((test) =>
    selectedIds.includes(test.id)
  );
} else {
  selectedTests = tests.slice(0, limit);
}

// -----------------------------------
// 테스트 판정 함수
// -----------------------------------

function evaluateTest(test, result) {
  const checks = [];

  const toolWasCalled =
    result.toolCalls.length > 0;

  checks.push({
    name: "tool_called",
    pass:
      toolWasCalled ===
      test.expectTool,
  });

  if (test.expectTool) {
    const call =
      result.toolCalls[0];

    checks.push({
      name: "tool_name",
      pass:
        call?.name ===
        test.expectedToolName,
    });

    checks.push({
      name: "order_id",
      pass:
        String(
          call?.arguments?.orderId ?? ""
        ) === test.expectedOrderId,
    });

    checks.push({
      name: "tool_success",
      pass:
        call?.result?.success ===
        test.expectedSuccess,
    });

    if (test.expectedStatus) {
      checks.push({
        name: "tool_status",
        pass:
          call?.result?.status ===
          test.expectedStatus,
      });

      checks.push({
        name: "answer_contains_status",
        pass:
          result.finalAnswer.includes(
            test.expectedStatus
          ),
      });
    }
  }

  return {
    pass:
      checks.every(
        (check) => check.pass
      ),

    failedChecks:
      checks
        .filter(
          (check) => !check.pass
        )
        .map(
          (check) => check.name
        ),
  };
}

// -----------------------------------
// Benchmark 시작
// -----------------------------------

console.log("");
console.log("====================================");
console.log("        MODEL BENCHMARK");
console.log("====================================");

console.log("MODEL:", model);
console.log(
  "TESTS:",
  selectedTests.length
);

console.log("");

const results = [];

const benchmarkStartedAt =
  Date.now();

for (
  let i = 0;
  i < selectedTests.length;
  i++
) {
  const test =
    selectedTests[i];

  const startedAt =
    Date.now();

  console.log(
    `[${i + 1}/${selectedTests.length}] ${test.id}`
  );

  try {
    const agentResult =
      await runAgent(
        test.question,
        model
      );

    const evaluation =
      evaluateTest(
        test,
        agentResult
      );

    const durationMs =
      Date.now() - startedAt;

    results.push({
      id: test.id,
      question:
        test.question,

      pass:
        evaluation.pass,

      failedChecks:
        evaluation.failedChecks,

      durationMs,
    });

    console.log(
      evaluation.pass
        ? `✅ PASS (${durationMs}ms)`
        : `❌ FAIL (${durationMs}ms)`
    );

    if (
      !evaluation.pass
    ) {
      console.log(
        "   실패 항목:",
        evaluation.failedChecks.join(
          ", "
        )
      );
    }
  } catch (error) {
    const durationMs =
      Date.now() - startedAt;

    results.push({
      id: test.id,
      question:
        test.question,
      pass: false,
      durationMs,
      error:
        error.message,
    });

    console.log(
      "💥 ERROR:",
      error.message
    );
  }
}

const totalDurationMs =
  Date.now() -
  benchmarkStartedAt;

const passed =
  results.filter(
    (result) => result.pass
  ).length;

const failed =
  results.length - passed;

const passRate =
  Number(
    (
      (passed /
        results.length) *
      100
    ).toFixed(1)
  );

const averageDurationMs =
  Math.round(
    results.reduce(
      (sum, result) =>
        sum +
        result.durationMs,
      0
    ) /
      results.length
  );

const fastest =
  Math.min(
    ...results.map(
      (result) =>
        result.durationMs
    )
  );

const slowest =
  Math.max(
    ...results.map(
      (result) =>
        result.durationMs
    )
  );

const summary = {
  model,

  generatedAt:
    new Date().toISOString(),

  totalTests:
    results.length,

  passed,

  failed,

  passRate,

  averageDurationMs,

  fastestMs:
    fastest,

  slowestMs:
    slowest,

  totalDurationMs,

  apiCostUSD: 0,

  results,
};

// -----------------------------------
// 결과 출력
// -----------------------------------

console.log("");
console.log("====================================");
console.log("           BENCHMARK RESULT");
console.log("====================================");

console.log(
  "MODEL:",
  model
);

console.log(
  `TOTAL: ${results.length}`
);

console.log(
  `PASS: ${passed}`
);

console.log(
  `FAIL: ${failed}`
);

console.log(
  `PASS RATE: ${passRate}%`
);

console.log(
  `AVG TIME: ${averageDurationMs}ms`
);

console.log(
  `FASTEST: ${fastest}ms`
);

console.log(
  `SLOWEST: ${slowest}ms`
);

console.log(
  `TOTAL TIME: ${totalDurationMs}ms`
);

console.log(
  "API COST: $0 (local Ollama)"
);

// -----------------------------------
// 파일 저장
// -----------------------------------

const resultsDir =
  path.join(
    process.cwd(),
    "benchmarks"
  );

await fs.mkdir(
  resultsDir,
  {
    recursive: true,
  }
);

const safeModelName =
  model.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  );

const outputPath =
  path.join(
    resultsDir,
    `${safeModelName}.json`
  );

await fs.writeFile(
  outputPath,
  JSON.stringify(
    summary,
    null,
    2
  ),
  "utf8"
);

console.log("");
console.log(
  "저장:",
  outputPath
);