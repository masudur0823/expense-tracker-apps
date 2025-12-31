import { Card, CardContent, Typography, Box } from "@mui/material";
import dayjs from "dayjs";

export default function MonthlySummaryCard({ expenses }) {
  const currentMonth = dayjs().format("MMMM YYYY");

  const monthlyTotal = expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {currentMonth}
        </Typography>

        <Box mt={1}>
          <Typography variant="h6">
            Total Expense
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {monthlyTotal}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
