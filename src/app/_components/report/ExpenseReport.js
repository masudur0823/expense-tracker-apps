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
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import CATEGORIES from "@/app/staticData/category";

function ExpenseReport() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily"); // 'daily' or 'category'

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

  // 🔹 Category summary data
  const categoryData = useMemo(() => {
    const categoryMap = {};

    filteredExpenses.forEach((item) => {
      const category = item.category || "other";
      categoryMap[category] = (categoryMap[category] || 0) + item.amount;
    });

    return CATEGORIES.map((cat) => ({
      name: cat.label,
      value: categoryMap[cat.value] || 0,
      color: cat.color,
      icon: cat.icon,
      percentage: 0, // Will calculate below
    }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // 🔹 Calculate percentages
  const categoryDataWithPercentages = useMemo(() => {
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);
    return categoryData.map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }));
  }, [categoryData]);

  // 🔹 Daily bar chart data
  const dailyChartData = useMemo(() => {
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

  // 🔹 Category bar chart data (by date)
  const categoryByDateData = useMemo(() => {
    const dateMap = {};

    filteredExpenses.forEach((item) => {
      const dateKey = dayjs(item.date).format("DD MMM");
      const category = item.category || "other";

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey };
      }

      dateMap[dateKey][category] =
        (dateMap[dateKey][category] || 0) + item.amount;
      dateMap[dateKey].total = (dateMap[dateKey].total || 0) + item.amount;
    });

    return Object.values(dateMap).sort(
      (a, b) =>
        dayjs(a.date, "DD MMM").valueOf() - dayjs(b.date, "DD MMM").valueOf(),
    );
  }, [filteredExpenses]);

  // 🔹 Top expenses by category (table data)
  const topExpensesByCategory = useMemo(() => {
    const categoryMap = {};

    filteredExpenses.forEach((item) => {
      const category = item.category || "other";
      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          total: 0,
          count: 0,
          avg: 0,
          max: 0,
          maxExpenseName: "",
        };
      }

      categoryMap[category].total += item.amount;
      categoryMap[category].count += 1;

      if (item.amount > categoryMap[category].max) {
        categoryMap[category].max = item.amount;
        categoryMap[category].maxExpenseName = item.expenseName;
      }
    });

    // Calculate averages
    Object.values(categoryMap).forEach((cat) => {
      cat.avg = Math.round(cat.total / cat.count);
    });

    return Object.values(categoryMap)
      .sort((a, b) => b.total - a.total)
      .map((cat) => ({
        ...cat,
        categoryLabel:
          CATEGORIES.find((c) => c.value === cat.category)?.label || "Other",
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
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
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

      {/* 📊 View Mode Toggle */}
      <Stack direction="row" spacing={1} mb={3}>
        <Button
          variant={viewMode === "daily" ? "contained" : "outlined"}
          onClick={() => setViewMode("daily")}
          size="small"
        >
          Daily View
        </Button>
        <Button
          variant={viewMode === "category" ? "contained" : "outlined"}
          onClick={() => setViewMode("category")}
          size="small"
        >
          Category View
        </Button>
      </Stack>

      {/* 💰 Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Expense
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                ৳ {totalAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Categories
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {categoryData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Transactions
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {filteredExpenses.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Avg. Daily
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                ৳{" "}
                {filteredExpenses.length > 0
                  ? Math.round(
                      totalAmount / (dayjs(endDate).diff(startDate, "day") + 1),
                    )
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 📊 Charts Section */}
      {/* {viewMode === "daily" ? (
        <Grid container spacing={3} width={"100%"}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={500} mb={2}>
                Daily Expenses
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`৳ ${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar 
                      dataKey="total" 
                      radius={[6, 6, 0, 0]} 
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={500} mb={2}>
                Category Breakdown
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDataWithPercentages}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDataWithPercentages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`৳ ${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3} width={"100%"}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={500} mb={2}>
                Expenses by Category (Stacked)
              </Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryByDateData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`৳ ${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend />
                    {CATEGORIES.map((cat) => (
                      <Bar
                        key={cat.value}
                        dataKey={cat.value}
                        stackId="a"
                        fill={cat.color}
                        name={cat.label}
                        hide={categoryByDateData.every(d => !d[cat.value])}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={500} mb={2}>
                Category Summary
              </Typography>
              <Stack spacing={2}>
                {categoryDataWithPercentages.map((cat) => (
                  <Box key={cat.name}>
                    <Stack 
                      direction="row" 
                      justifyContent="space-between" 
                      alignItems="center"
                      mb={0.5}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: cat.color }}>
                          {cat.icon}
                        </Box>
                        <Typography variant="body2">
                          {cat.name}
                        </Typography>
                      </Stack>
                      <Typography fontWeight={600}>
                        ৳ {cat.value.toLocaleString()}
                      </Typography>
                    </Stack>
                    <Box 
                      sx={{ 
                        height: 8, 
                        bgcolor: 'grey.200', 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: `${cat.percentage}%`, 
                          height: '100%', 
                          bgcolor: cat.color,
                          borderRadius: 4
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {cat.percentage}% of total
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )} */}

      {/* 📋 Category Details Table */}
      <Paper sx={{ p: 2, mt: 3 }} width={"100%"}>
        <Typography fontWeight={500} mb={2}>
          Category Analysis
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="right">Transactions</TableCell>
                <TableCell align="right">Average</TableCell>
                <TableCell align="right">Largest Expense</TableCell>
                <TableCell align="right">% of Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topExpensesByCategory.map((row) => {
                const percentage =
                  totalAmount > 0
                    ? Math.round((row.total / totalAmount) * 100)
                    : 0;
                const categoryConfig = CATEGORIES.find(
                  (c) => c.value === row.category,
                );

                return (
                  <TableRow key={row.category}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={row.categoryLabel}
                          sx={{
                            bgcolor: categoryConfig?.color || "#6C757D",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        ৳ {row.total.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                    <TableCell align="right">
                      ৳ {row.avg.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {row.maxExpenseName}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ৳ {row.max.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={`${percentage}%`}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default ExpenseReport;
