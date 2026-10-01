import { runAgent } from "./agent-core.mjs";

const tests = [
  {
    name: "정상 주문 1001",
    question: "1001번 주문 상태 알려줘",
    expectTool: true,
    expectedToolName: "get_order_status",
    expectedOrderId: "1001",
    expectedSuccess: true,
    expectedStatus: "배송 중",
  },

  {
    name: "정상 주문 1002",
    question: "1002 주문 어디까지 왔어?",
    expectTool: true,
    expectedToolName: "get_order_status",
    expectedOrderId: "1002",
    expectedSuccess: true,
    expectedStatus: "배송 완료",
  },

  {
    name: "존재하지 않는 주문",
    question: "9999번 주문 상태 알려줘",
    expectTool: true,
    expectedToolName: "get_order_status",
    expectedOrderId: "9999",
    expectedSuccess: false,
  },

  {
    name: "주문과 관계없는 질문",
    question: "오늘 기분이 어때?",
    expectTool: false,
  },
];

function check(label, condition) {
  if (condition) {
    console.log(`✅ ${label} PASS`);
    return 1;
  }

  console.log(`❌ ${label} FAIL`);
  return 0;
}

let totalChecks = 0;
let passedChecks = 0;

console.log("\n=================================");
console.log("      AI AGENT QA TEST START");
console.log("=================================\n");

for (let i = 0; i < tests.length; i++) {
  const test = tests[i];

  console.log("\n---------------------------------");
  console.log(`[TEST ${i + 1}] ${test.name}`);
  console.log("---------------------------------");

  console.log("질문:", test.question);

  try {
    const result = await runAgent(test.question);

    const toolWasCalled = result.toolCalls.length > 0;

    totalChecks++;
    passedChecks += check(
      "도구 호출 여부",
      toolWasCalled === test.expectTool
    );

    if (test.expectTool) {
      const call = result.toolCalls[0];

      totalChecks++;
      passedChecks += check(
        "도구 이름",
        call?.name === test.expectedToolName
      );

      totalChecks++;
      passedChecks += check(
        "주문번호",
        String(call?.arguments?.orderId) === test.expectedOrderId
      );

      totalChecks++;
      passedChecks += check(
        "도구 실행 결과",
        call?.result?.success === test.expectedSuccess
      );

      if (test.expectedStatus) {
        totalChecks++;
        passedChecks += check(
          "주문 상태",
          call?.result?.status === test.expectedStatus
        );

        totalChecks++;
        passedChecks += check(
          "최종답변 상태 포함",
          result.finalAnswer.includes(test.expectedStatus)
        );
      }
    }

    console.log("\nAI 최종답변:");
    console.log(result.finalAnswer);
  } catch (error) {
    console.log("❌ 테스트 실행 자체가 실패했습니다.");
    console.error(error);
  }
}

console.log("\n=================================");
console.log("          QA SUMMARY");
console.log("=================================");

console.log(`PASS: ${passedChecks}`);
console.log(`TOTAL: ${totalChecks}`);
console.log(
  `PASS RATE: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`
);

if (passedChecks === totalChecks) {
  console.log("\n🎉 모든 테스트 통과");
} else {
  console.log(
    `\n⚠️ ${totalChecks - passedChecks}개의 검사 항목이 실패했습니다.`
  );
}