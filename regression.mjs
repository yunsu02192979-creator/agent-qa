import fs from "fs/promises";
import path from "path";

import { runAgent } from "./agent-core.mjs";
import tests from "./test-cases.mjs";

const args = process.argv.slice(2);

const limitArg = args.find((arg) => arg.startsWith("--limit="));

const idsArg = args.find((arg) => arg.startsWith("--ids="));

const limit = limitArg
  ? Number(limitArg.split("=")[1])
  : tests.length;

const saveBaseline = args.includes("--save-baseline");

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

const resultsDirectory = path.join(process.cwd(), "results");

await fs.mkdir(resultsDirectory, {
  recursive: true,
});

function checkTest(test, result) {
  const checks = [];

  const toolWasCalled = result.toolCalls.length > 0;

  checks.push({
    name: "tool_called",
    expected: test.expectTool,
    actual: toolWasCalled,
    pass: toolWasCalled === test.expectTool,
  });

  if (test.expectTool) {
    const call = result.toolCalls[0];

    checks.push({
      name: "tool_name",
      expected: test.expectedToolName,
      actual: call?.name ?? null,
      pass: call?.name === test.expectedToolName,
    });

    checks.push({
      name: "order_id",
      expected: test.expectedOrderId,
      actual: String(call?.arguments?.orderId ?? ""),
      pass:
        String(call?.arguments?.orderId ?? "") ===
        test.expectedOrderId,
    });

    checks.push({
      name: "tool_success",
      expected: test.expectedSuccess,
      actual: call?.result?.success,
      pass:
        call?.result?.success ===
        test.expectedSuccess,
    });

    if (test.expectedStatus) {
      checks.push({
        name: "tool_status",
        expected: test.expectedStatus,
        actual: call?.result?.status ?? null,
        pass:
          call?.result?.status ===
          test.expectedStatus,
      });

      checks.push({
        name: "answer_contains_status",
        expected: test.expectedStatus,
        actual: result.finalAnswer,
        pass:
          result.finalAnswer.includes(
            test.expectedStatus
          ),
      });
    }
  }

  const passedChecks =
    checks.filter((check) => check.pass).length;

  return {
    checks,
    passedChecks,
    totalChecks: checks.length,
    pass: passedChecks === checks.length,
  };
}

const runResults = [];

console.log("");
console.log("========================================");
console.log("       AGENT REGRESSION TEST");
console.log("========================================");
console.log(`테스트 개수: ${selectedTests.length}`);
console.log("");

for (let i = 0; i < selectedTests.length; i++) {
  const test = selectedTests[i];

  const startedAt = Date.now();

  console.log(
    `[${i + 1}/${selectedTests.length}] ${test.id} - ${test.question}`
  );

  try {
    const agentResult =
      await runAgent(test.question);

    const evaluation =
      checkTest(test, agentResult);

    const durationMs =
      Date.now() - startedAt;

    const record = {
      id: test.id,
      category: test.category,
      question: test.question,

      pass: evaluation.pass,

      passedChecks:
        evaluation.passedChecks,

      totalChecks:
        evaluation.totalChecks,

      durationMs,

      checks: evaluation.checks,

      toolCalls:
        agentResult.toolCalls,

      finalAnswer:
        agentResult.finalAnswer,
    };

    runResults.push(record);

    if (evaluation.pass) {
      console.log(
        `✅ PASS (${durationMs}ms)`
      );
    } else {
      console.log(
        `❌ FAIL (${durationMs}ms)`
      );

      for (const check of evaluation.checks) {
        if (!check.pass) {
          console.log(
            `   ↳ ${check.name}`
          );

          console.log(
            `      expected:`,
            check.expected
          );

          console.log(
            `      actual:`,
            check.actual
          );
        }
      }
    }
  } catch (error) {
    const durationMs =
      Date.now() - startedAt;

    console.log("💥 ERROR");

    console.log(error.message);

    runResults.push({
      id: test.id,
      category: test.category,
      question: test.question,
      pass: false,
      durationMs,
      error: error.message,
    });
  }

  console.log("");
}

const passedTests =
  runResults.filter(
    (result) => result.pass
  ).length;

const failedTests =
  runResults.length - passedTests;

const passRate =
  runResults.length === 0
    ? 0
    : (
        (passedTests / runResults.length) *
        100
      ).toFixed(1);

const averageDuration =
  runResults.length === 0
    ? 0
    : Math.round(
        runResults.reduce(
          (sum, result) =>
            sum +
            (result.durationMs ?? 0),
          0
        ) / runResults.length
      );

const summary = {
  generatedAt:
    new Date().toISOString(),

  totalTests:
    runResults.length,

  passedTests,

  failedTests,

  passRate:
    Number(passRate),

  averageDurationMs:
    averageDuration,

  results:
    runResults,
};

console.log("");
console.log("========================================");
console.log("              SUMMARY");
console.log("========================================");

console.log(
  `TOTAL: ${summary.totalTests}`
);

console.log(
  `PASS: ${summary.passedTests}`
);

console.log(
  `FAIL: ${summary.failedTests}`
);

console.log(
  `PASS RATE: ${summary.passRate}%`
);

console.log(
  `AVG TIME: ${summary.averageDurationMs}ms`
);

const currentPath =
  path.join(
    resultsDirectory,
    "current.json"
  );

await fs.writeFile(
  currentPath,
  JSON.stringify(summary, null, 2),
  "utf8"
);

console.log("");
console.log(
  "결과 저장:",
  currentPath
);

const timestamp =
  new Date()
    .toISOString()
    .replaceAll(":", "-");

const historyPath =
  path.join(
    resultsDirectory,
    `run-${timestamp}.json`
  );

await fs.writeFile(
  historyPath,
  JSON.stringify(summary, null, 2),
  "utf8"
);

if (saveBaseline) {
  const baselinePath =
    path.join(
      resultsDirectory,
      "baseline.json"
    );

  await fs.writeFile(
    baselinePath,
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  console.log("");
  console.log(
    "📌 현재 결과를 BASELINE으로 저장했습니다."
  );

  console.log(
    baselinePath
  );

  process.exit(0);
}

// ----------------------------------
// 기존 baseline과 비교
// ----------------------------------

const baselinePath =
  path.join(
    resultsDirectory,
    "baseline.json"
  );

try {
  const baselineRaw =
    await fs.readFile(
      baselinePath,
      "utf8"
    );

  const baseline =
    JSON.parse(baselineRaw);

  const oldMap =
    new Map(
      baseline.results.map(
        (result) => [
          result.id,
          result,
        ]
      )
    );

  const regressions = [];
  const improvements = [];

  for (const current of runResults) {
    const old =
      oldMap.get(current.id);

    if (!old) {
      continue;
    }

    if (
      old.pass === true &&
      current.pass === false
    ) {
      regressions.push({
        id: current.id,
        question:
          current.question,
      });
    }

    if (
      old.pass === false &&
      current.pass === true
    ) {
      improvements.push({
        id: current.id,
        question:
          current.question,
      });
    }
  }

  console.log("");
  console.log("========================================");
  console.log("       BASELINE COMPARISON");
  console.log("========================================");

  console.log(
    `기존 PASS RATE: ${baseline.passRate}%`
  );

  console.log(
    `현재 PASS RATE: ${summary.passRate}%`
  );

  console.log(
    `REGRESSIONS: ${regressions.length}`
  );

  console.log(
    `IMPROVEMENTS: ${improvements.length}`
  );

  if (regressions.length > 0) {
    console.log("");
    console.log(
      "❌ 새로 실패한 테스트"
    );

    for (const item of regressions) {
      console.log(
        `${item.id}: ${item.question}`
      );
    }
  }

  if (improvements.length > 0) {
    console.log("");
    console.log(
      "✅ 새로 통과한 테스트"
    );

    for (const item of improvements) {
      console.log(
        `${item.id}: ${item.question}`
      );
    }
  }

  if (
    regressions.length === 0 &&
    improvements.length === 0
  ) {
    console.log("");
    console.log(
      "변경된 PASS/FAIL 결과가 없습니다."
    );
  }
} catch {
  console.log("");
  console.log(
    "아직 baseline.json이 없습니다."
  );

  console.log(
    "전체 테스트가 정상이라면 다음 명령으로 기준점을 저장하세요:"
  );

  console.log(
    "node regression.mjs --save-baseline"
  );
}