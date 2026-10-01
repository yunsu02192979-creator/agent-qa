import ollama from "ollama";

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

function getOrderStatus({ orderId }) {
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

function normalizeArguments(args) {
  if (typeof args === "string") {
    try {
      return JSON.parse(args);
    } catch {
      return {};
    }
  }

  return args ?? {};
}

export async function runAgent(question, model = "qwen3:8b") {
  const messages = [
    {
  role: "system",
  content: `
너는 쇼핑몰 고객지원 AI다.

반드시 다음 규칙을 따른다.

1. 사용자가 주문번호처럼 보이는 숫자를 제시하고
   상태, 조회, 확인, 배송, 위치, 어디 있는지,
   상품이 어디 있는지 등을 묻는 경우
   반드시 get_order_status 도구를 사용한다.

2. 특히 "9999 상태가 뭐야?", "9999 상태 조회",
   "9999번 상품 어디 있어?"처럼 짧게 말하더라도
   주문번호 조회 요청으로 처리한다.

3. 주문번호가 존재하는지 AI가 추측하면 안 된다.
   존재 여부도 반드시 get_order_status 도구로 확인한다.

4. get_order_status 결과의 success가 true이면
   최종 답변에 도구가 반환한 status 값을
   글자를 바꾸거나 생략하지 말고 그대로 포함한다.

5. success가 false이면 존재하지 않는 주문이라고 답한다.
   임의의 상품명, 고객명, 배송 상태를 만들어내면 안 된다.

6. 주문이나 배송과 전혀 관계없는 질문에서는
   get_order_status 도구를 사용하지 않는다.
`,
},
    {
      role: "user",
      content: question,
    },
  ];

  const firstResponse = await ollama.chat({
    model,
    messages,
    tools,
    think: false,
    options: {
      temperature: 0,
    },
  });

  messages.push(firstResponse.message);

  const toolCalls = firstResponse.message.tool_calls ?? [];
  const toolResults = [];

  for (const toolCall of toolCalls) {
    const toolName = toolCall.function.name;
    const args = normalizeArguments(toolCall.function.arguments);

    let result;

    if (toolName === "get_order_status") {
      result = getOrderStatus(args);
    } else {
      result = {
        success: false,
        error: "알 수 없는 도구입니다.",
      };
    }

    toolResults.push({
      name: toolName,
      arguments: args,
      result,
    });

    messages.push({
      role: "tool",
      tool_name: toolName,
      content: JSON.stringify(result),
    });
  }

  let finalAnswer;

  if (toolCalls.length > 0) {
    const finalResponse = await ollama.chat({
      model,
      messages,
      think: false,
      options: {
        temperature: 0,
      },
    });

    finalAnswer = finalResponse.message.content;
  } else {
    finalAnswer = firstResponse.message.content;
  }

  return {
    question,
    toolCalls: toolResults,
    finalAnswer,
  };
}