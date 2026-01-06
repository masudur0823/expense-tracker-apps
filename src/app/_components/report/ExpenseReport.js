"use client";

import axios from "@/app/_lib/api/axios";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function ExpenseReport() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📅 Date range
  const [startDate, setStartDate] = useState(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    axios.get("/api/expense").then((res) => {
      setExpenses(res.data.result || []);
      setLoading(false);
    });
  }, []);

  // 🔹 Quick filters
  const applyQuickFilter = (type) => {
    const now = dayjs();

    if (type === "today") {
      setStartDate(now.startOf("day"));
      setEndDate(now.endOf("day"));
    }

    if (type === "7days") {
      setStartDate(now.subtract(6, "day").startOf("day"));
      setEndDate(now.endOf("day"));
    }

    if (type === "month") {
      setStartDate(now.startOf("month"));
      setEndDate(now.endOf("month"));
    }

    if (type === "year") {
      setStartDate(now.startOf("year"));
      setEndDate(now.endOf("year"));
    }
  };

  // 🔹 Filtered data
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const d = dayjs(item.date);
      return (
        d.isAfter(startDate.subtract(1, "ms")) &&
        d.isBefore(endDate.add(1, "ms"))
      );
    });
  }, [expenses, startDate, endDate]);

  // 🔹 Bar chart data
  const chartData = useMemo(() => {
    const map = {};

    filteredExpenses.forEach((item) => {
      const key = dayjs(item.date).format("DD MMM");
      map[key] = (map[key] || 0) + item.amount;
    });

    return Object.entries(map).map(([date, total]) => ({
      date,
      total,
    }));
  }, [filteredExpenses]);

  // 🔹 Total summary
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  if (loading) {
    return (
      <Box mt={5} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Expense Report
      </Typography>

      {/* ⚡ Quick Filters */}
      <Stack
        direction="row"
        spacing={1}
        mb={2}
        flexWrap="wrap"
        useFlexGap
      >
        <Button size="small" onClick={() => applyQuickFilter("today")}>
          Today
        </Button>
        <Button size="small" onClick={() => applyQuickFilter("7days")}>
          Last 7 Days
        </Button>
        <Button size="small" onClick={() => applyQuickFilter("month")}>
          This Month
        </Button>
        <Button size="small" onClick={() => applyQuickFilter("year")}>
          This Year
        </Button>
      </Stack>

      {/* 📅 Custom Date Range */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(v) => setStartDate(v)}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(v) => setEndDate(v)}
          />
        </Stack>
      </LocalizationProvider>

      {/* 💰 Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography color="text.secondary">
            Total Expense
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            ৳ {totalAmount.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      {/* 📊 Bar Chart */}
      <Box height={320}>
        <Typography fontWeight={500} mb={1}>
          Expense by Date
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default ExpenseReport;
