import dayjs from "dayjs";

export const groupExpensesByDate = (expenses) => {
  const grouped = {};

  expenses.forEach((item) => {
    const dateKey = dayjs(item?.date).format("DD MMM YYYY");

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        items: [],
        total: 0,
      };
    }

    grouped[dateKey].items.push(item);
    grouped[dateKey].total += item.amount;
  });

  return Object.values(grouped);
};
