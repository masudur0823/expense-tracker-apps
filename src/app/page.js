"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  CircularProgress,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Stack,
  Divider,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddExpenseButton from "./_components/expense/AddExpenseButton";
import ExpenseDateCard from "./_components/expense/ExpenseDateCard";
import AddExpenseModal from "./_components/AddExpenseModal";
import { groupExpensesByDate } from "./_components/expense/groupByDate";
import dayjs from "dayjs";

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("/api/expense");
      setExpenses(res.data.result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`/api/expense/${item.id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.expenseName.toLowerCase().includes(search.toLowerCase());
    const expenseDate = dayjs(e.date);
    const from = fromDate ? dayjs(fromDate) : null;
    const to = toDate ? dayjs(toDate) : null;

    const inDateRange =
      (!from || expenseDate.isAfter(from.subtract(1, "day"))) &&
      (!to || expenseDate.isBefore(to.add(1, "day")));

    return matchesSearch && inDateRange;
  });

  const groupedData = groupExpensesByDate(filteredExpenses);
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="700" color="primary">
            Expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track your daily spending
          </Typography>
        </Box>
        <AddExpenseButton onClick={() => setOpen(true)} />
      </Box>

      {/* Summary Stat Card */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: "primary.main", color: "white", borderRadius: 3 }}>
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          Total Filtered Expense
        </Typography>
        <Typography variant="h3" fontWeight="bold">
          {totalAmount.toLocaleString()}tk
        </Typography>
      </Paper>

      {/* Filter Section */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Search expense..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            type="date"
            size="small"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            sx={{ minWidth: 150 }}
          />
          <TextField
            type="date"
            size="small"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            sx={{ minWidth: 150 }}
          />
          <Button
            variant="text"
            color="inherit"
            onClick={() => {
              setFromDate("");
              setToDate("");
              setSearch("");
            }}
          >
            Reset
          </Button>
        </Stack>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {/* Content Area */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : groupedData.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography color="text.secondary">No expenses found for this period.</Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {groupedData.map((group) => (
            <ExpenseDateCard key={group.date} data={group} onDelete={handleDelete} />
          ))}
        </Stack>
      )}

      {/* Modal */}
      <AddExpenseModal
        open={open}
        onClose={() => {
          setOpen(false);
          fetchExpenses();
        }}
      />
    </Container>
  );
}