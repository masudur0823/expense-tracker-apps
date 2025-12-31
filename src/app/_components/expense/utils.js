export const parseExpenses = (text) => {
  const lines = text.split("\n");
  const expenses = [];
  const errors = [];

  lines.forEach((line, index) => {
    const clean = line.trim().replace(/,$/, "");
    if (!clean) return;

    if (!clean.includes("-")) {
      errors.push({ line: index + 1, error: "Missing '-'" });
      return;
    }

    const [name, amount] = clean.split("-");

    if (!name?.trim()) {
      errors.push({ line: index + 1, error: "Empty expense name" });
      return;
    }

    const num = Number(amount?.trim());
    if (isNaN(num) || num <= 0) {
      errors.push({ line: index + 1, error: "Invalid amount" });
      return;
    }

    expenses.push({
      expenseName: name.trim(),
      amount: num,
    });
  });

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, errors, totalAmount };
};
