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

    // Extract category from the name (format: @category)
    let expenseName = name.trim();
    let category = null;
    
    // Check for @category in the name
    const categoryMatch = expenseName.match(/@(\w+)/);
    if (categoryMatch) {
      category = categoryMatch[1]; // Extract the category value
      // Remove the @category from the expense name
      expenseName = expenseName.replace(/@\w+\s*/, '').trim();
      
      // If after removing @category, the name is empty, use a default
      if (!expenseName) {
        expenseName = "Expense";
      }
    }

    expenses.push({
      expenseName: expenseName,
      amount: num,
      ...(category && { category }), // Only add category if it exists
    });
  });

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, errors, totalAmount };
};