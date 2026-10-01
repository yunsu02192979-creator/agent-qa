const orderQuestions = {
  "1001": [
    "1001번 주문 상태 알려줘",
    "1001 주문 어디까지 왔어?",
    "주문번호 1001 조회해줘",
    "1001 배송 상황 알려줘",
    "1001번 지금 배송 중이야?",
    "1001 주문 확인해줘",
    "내 주문 1001 상태가 뭐야?",
    "1001번 상품은 어디쯤 왔어?",
    "1001 배송 완료됐어?",
    "1001번 주문 진행 상황 알려줘",
    "주문 1001 확인",
    "1001 상태 조회",
    "1001번 택배 상황 알려줘",
    "1001 주문 아직 안 왔어. 상태 확인해줘",
    "1001번 주문이 지금 어떤 상태야?",
    "1001 조회 가능해?",
    "1001 주문 배송됐는지 확인해줘",
    "1001번 주문 정보 부탁해",
    "1001 상태 좀 봐줘",
    "1001번 주문의 현재 배송 상태가 궁금해",
  ],

  "1002": [
    "1002번 주문 상태 알려줘",
    "1002 주문 어디까지 왔어?",
    "주문번호 1002 조회해줘",
    "1002 배송 상황 알려줘",
    "1002번 지금 배송됐어?",
    "1002 주문 확인해줘",
    "내 주문 1002 상태가 뭐야?",
    "1002번 상품은 어디쯤 왔어?",
    "1002 배송 완료됐어?",
    "1002번 주문 진행 상황 알려줘",
    "주문 1002 확인",
    "1002 상태 조회",
    "1002번 택배 상황 알려줘",
    "1002 주문 아직 안 왔어. 확인해줘",
    "1002번 주문이 지금 어떤 상태야?",
    "1002 조회 가능해?",
    "1002 주문 배송됐는지 확인해줘",
    "1002번 주문 정보 부탁해",
    "1002 상태 좀 봐줘",
    "1002번 주문의 현재 배송 상태가 궁금해",
  ],

  "1003": [
    "1003번 주문 상태 알려줘",
    "1003 주문 어디까지 왔어?",
    "주문번호 1003 조회해줘",
    "1003 배송 상황 알려줘",
    "1003번 지금 어떤 상태야?",
    "1003 주문 확인해줘",
    "내 주문 1003 상태가 뭐야?",
    "1003번 상품은 어디쯤 왔어?",
    "1003 주문 처리됐어?",
    "1003번 주문 진행 상황 알려줘",
    "주문 1003 확인",
    "1003 상태 조회",
    "1003번 주문 상황 알려줘",
    "1003 주문 확인 좀 해줘",
    "1003번 주문이 지금 어떤 상태야?",
    "1003 조회 가능해?",
    "1003 주문 처리 상황 확인해줘",
    "1003번 주문 정보 부탁해",
    "1003 상태 좀 봐줘",
    "1003번 주문 상태가 궁금해",
  ],
};

const invalidQuestions = [
  "9999번 주문 상태 알려줘",
  "9999 주문 어디까지 왔어?",
  "주문번호 9999 조회해줘",
  "9999 배송 상황 알려줘",
  "9999번 주문 확인해줘",
  "9999 상태가 뭐야?",
  "9999번 상품 어디 있어?",
  "9999 배송 완료됐어?",
  "9999번 주문 진행 상황 알려줘",
  "주문 9999 확인",
  "9999 상태 조회",
  "9999번 택배 상황 알려줘",
  "9999 주문이 안 보여. 확인해줘",
  "9999번 주문이 지금 어떤 상태야?",
  "9999 조회 가능해?",
  "9999 주문 배송 확인해줘",
  "9999번 주문 정보 부탁해",
  "9999 상태 좀 봐줘",
  "주문번호가 9999인데 조회해줘",
  "9999번 주문을 찾아줘",
];

const irrelevantQuestions = [
  "오늘 기분이 어때?",
  "서울 날씨 알려줘",
  "1 더하기 1은 뭐야?",
  "재미있는 이야기 해줘",
  "너는 누구야?",
  "고양이는 왜 귀여워?",
  "점심 뭐 먹을까?",
  "영어 공부 방법 알려줘",
  "운동 추천해줘",
  "안녕",
  "고마워",
  "오늘 무슨 요일이야?",
  "노래 추천해줘",
  "영화 추천해줘",
  "잠이 안 와",
  "컴퓨터가 뭐야?",
  "AI가 뭐야?",
  "축구 좋아해?",
  "한국의 수도가 어디야?",
  "짧은 농담 하나 해줘",
];

const tests = [];

let number = 1;

function addTest(test) {
  tests.push({
    id: `T${String(number).padStart(3, "0")}`,
    ...test,
  });

  number++;
}

for (const question of orderQuestions["1001"]) {
  addTest({
    category: "valid-order",
    question,
    expectTool: true,
    expectedToolName: "get_order_status",
    expectedOrderId: "1001",
    expectedSuccess: true,
    expectedStatus: "배송 중",
  });
}

for (const question of orderQuestions["1002"]) {
  addTest({
    category: "valid-order",
    question,
    expectTool: true,
    expectedToolName: "get_order_status",
    expectedOrderId: "1002",
    expectedSuccess: true,
    expectedStatus: "배송 완료",
  });
}

for (const question of orderQuestions["1003"]) {
  addTest({
    category: "valid-order",
    question,
    expectTool: true,
    expectedToolName: "get_order_status",
    expectedOrderId: "1003",
    expectedSuccess: true,
    expectedStatus: "주문 확인",
  });
}

for (const question of invalidQuestions) {
  addTest({
    category: "invalid-order",
    question,
    expectTool: true,
    expectedToolName: "get_order_status",
    expectedOrderId: "9999",
    expectedSuccess: false,
  });
}

for (const question of irrelevantQuestions) {
  addTest({
    category: "irrelevant",
    question,
    expectTool: false,
  });
}

export default tests;