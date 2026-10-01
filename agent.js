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

function getOrderStatus(orderId) {
  console.log("\n[TOOL CALL]");
  console.log("도구: get_order_status");
  console.log("입력:", orderId);

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

const result = getOrderStatus("1001");

console.log("\n[TOOL RESULT]");
console.log(result);