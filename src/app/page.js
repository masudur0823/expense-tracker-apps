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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import AddExpenseButton from "./_components/expense/AddExpenseButton";
import ExpenseDateCard from "./_components/expense/ExpenseDateCard";
import AddExpenseModal from "./_components/AddExpenseModal";
import { groupExpensesByDate } from "./_components/expense/groupByDate";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Default to null or specific range if you prefer
  const [fromDate, setFromDate] = useState(null); 
  const [toDate, setToDate] = useState(null);

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

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleQuickRange = (range) => {
    const today = dayjs();
    if (range === "today") {
      setFromDate(today);
      setToDate(today);
    } else if (range === "week") {
      setFromDate(today.subtract(7, "day"));
      setToDate(today);
    } else if (range === "month") {
      setFromDate(today.startOf("month"));
      setToDate(today.endOf("month"));
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.expenseName.toLowerCase().includes(search.toLowerCase());
    const expenseDate = dayjs(e.date).startOf("day");
    const from = fromDate ? dayjs(fromDate).startOf("day") : null;
    const to = toDate ? dayjs(toDate).startOf("day") : null;

    const inDateRange =
      (!from || expenseDate.isSameOrAfter(from)) &&
      (!to || expenseDate.isSameOrBefore(to));

    return matchesSearch && inDateRange;
  });

  const groupedData = groupExpensesByDate(filteredExpenses);
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Helper to show the date range text
  const getFilterText = () => {
    if (!fromDate && !toDate && !search) return "All Records";
    let text = "";
    if (fromDate || toDate) {
      text += `${fromDate ? dayjs(fromDate).format("MMM DD") : "Start"} - ${toDate ? dayjs(toDate).format("MMM DD, YYYY") : "End"}`;
    }
    if (search) text += ` | Search: "${search}"`;
    return text;
  };

  return (
    <Container maxWidth="md" sx={{ py: 2, pt: 0 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Box>
          <Typography variant="h6" fontWeight="700" color="primary">
            Expenses
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <IconButton
            size="small"
            onClick={() => setFilterOpen(true)}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
          <AddExpenseButton onClick={() => setOpen(true)} />
        </Stack>
      </Box>

      {/* --- Filter Value Display (Top) --- */}
      <Box sx={{ mt: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {getFilterText()}
        </Typography>
        <Typography variant="subtitle2" fontWeight="bold" color="primary">
          Total: {totalAmount.toLocaleString()}tk
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />

      {/* Main List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : groupedData.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 5 }}>No expenses found.</Typography>
      ) : (
        <Stack spacing={3}>
          {groupedData.map((group) => (
            <ExpenseDateCard
              key={group.date}
              data={group}
              onDelete={fetchExpenses}
            />
          ))}
        </Stack>
      )}

      {/* --- Filter & Stats Modal --- */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Filters & Summary
          <IconButton onClick={() => setFilterOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Quick Select Buttons */}
            <Box>
              <Typography variant="subtitle2" mb={1} fontWeight="600">Quick Select</Typography>
              <Stack direction="row" spacing={1}>
                <Chip label="Today" onClick={() => handleQuickRange("today")} clickable color={fromDate?.isSame(dayjs(), 'day') ? "primary" : "default"} />
                <Chip label="Last 7 Days" onClick={() => handleQuickRange("week")} clickable />
                <Chip label="This Month" onClick={() => handleQuickRange("month")} clickable />
              </Stack>
            </Box>

            {/* Search */}
            <Box>
              <Typography variant="subtitle2" mb={1} fontWeight="600">Search</Typography>
              <TextField
                fullWidth size="small" placeholder="Search expense..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
              />
            </Box>

            {/* Date Range Picker */}
            <Box>
              <Typography variant="subtitle2" mb={1} fontWeight="600">Date Range</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <DatePicker
                    label="From"
                    value={fromDate}
                    onChange={(newValue) => setFromDate(newValue)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                  <DatePicker
                    label="To"
                    value={toDate}
                    onChange={(newValue) => setToDate(newValue)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                </Stack>
              </LocalizationProvider>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button color="inherit" onClick={() => { setFromDate(null); setToDate(null); setSearch(""); }}>
            Reset Filters
          </Button>
          <Button variant="contained" onClick={() => setFilterOpen(false)}>Show Results</Button>
        </DialogActions>
      </Dialog>

      <AddExpenseModal open={open} onClose={() => { setOpen(false); fetchExpenses(); }} />
    </Container>
  );
}