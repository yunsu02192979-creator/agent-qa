import ollama from "ollama";

// --------------------
// 가짜 주문 데이터베이스
// --------------------
const orders = {
  "1001": {
    customer: "김민수",
    product: "검은색 운동화",
    status: "배송 중",
  },
  "1002": {
    customer: "이서준",
    product: "단백질 보충제",
    status: "배송 완료",
  },
  "1003": {
    customer: "박지훈",
    product: "무선 마우스",
    status: "주문 확인",
  },
};

// --------------------
// 실제로 실행될 도구
// --------------------
function getOrderStatus({ orderId }) {
  console.log("\n========== TOOL EXECUTION ==========");
  console.log("도구 이름: get_order_status");
  console.log("전달받은 주문번호:", orderId);

  const order = orders[orderId];

  if (!order) {
    return {
      success: false,
      error: "주문을 찾을 수 없습니다.",
    };
  }

  return {
    success: true,
    orderId,
    ...order,
  };
}

// --------------------
// AI에게 알려줄 도구 설명
// --------------------
const tools = [
  {
    type: "function",
    function: {
      name: "get_order_status",
      description:
        "주문번호를 이용해서 고객의 상품과 현재 배송 상태를 조회한다.",
      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description: "조회할 주문번호. 예: 1001",
          },
        },
        required: ["orderId"],
      },
    },
  },
];

// --------------------
// 사용자의 질문
// --------------------
const userQuestion =
  process.argv.slice(2).join(" ") || "1001번 주문 상태 알려줘.";

const messages = [
  {
    role: "system",
    content:
      "너는 쇼핑몰 고객지원 AI다. 주문 상태에 관한 질문에는 반드시 제공된 도구를 사용한다. 주문 정보를 추측하거나 지어내면 안 된다.",
  },
  {
    role: "user",
    content: userQuestion,
  },
];

console.log("\n========== USER ==========");
console.log(userQuestion);

// --------------------
// 1차 AI 판단
// --------------------
const firstResponse = await ollama.chat({
  model: "qwen3:8b",
  messages,
  tools,
  think: false,
});

messages.push(firstResponse.message);

console.log("\n========== AI DECISION ==========");

if (
  firstResponse.message.tool_calls &&
  firstResponse.message.tool_calls.length > 0
) {
  for (const toolCall of firstResponse.message.tool_calls) {
    console.log("선택한 도구:", toolCall.function.name);
    console.log("도구 인자:", toolCall.function.arguments);

    let toolResult;

    if (toolCall.function.name === "get_order_status") {
      toolResult = getOrderStatus(toolCall.function.arguments);
    } else {
      toolResult = {
        success: false,
        error: "알 수 없는 도구입니다.",
      };
    }

    console.log("\n========== TOOL RESULT ==========");
    console.log(toolResult);

    messages.push({
      role: "tool",
      tool_name: toolCall.function.name,
      content: JSON.stringify(toolResult),
    });
  }

  // --------------------
  // 도구 결과를 보고 최종 답변
  // --------------------
  const finalResponse = await ollama.chat({
    model: "qwen3:8b",
    messages,
    think: false,
  });

  console.log("\n========== FINAL ANSWER ==========");
  console.log(finalResponse.message.content);
} else {
  console.log("AI가 도구를 선택하지 않았습니다.");
  console.log("AI 답변:", firstResponse.message.content);
}