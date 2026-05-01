"use client";

import axios from "@/app/_lib/api/axios";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

/* ─────────────────── Design tokens ─────────────────── */
const T = {
  bg:       "#0D0F1C",
  surface:  "#13162A",
  card:     "#181B30",
  border:   "#252845",
  borderHi: "#2E3260",
  gold:     "#C9A55A",
  goldDim:  "#A07E3A",
  cream:    "#EDE8DC",
  muted:    "#5A5F80",
  mutedHi:  "#7A80A8",
  text:     "#CDD0E8",
  white:    "#F0EEF8",
};

/* ─────────────────── Tiny helpers ─────────────────── */
const fmt = (n) => Number(n).toLocaleString();

const KpiCard = ({ label, value, sub }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 140,
      border: `1px solid ${T.border}`,
      borderRadius: "14px",
      p: "20px 22px",
      bgcolor: T.card,
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: `linear-gradient(90deg, ${T.gold}80, transparent)`,
      },
    }}
  >
    <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, mb: 1.2 }}>
      {label}
    </Typography>
    <Typography sx={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.85rem", fontWeight: 400, color: T.white, lineHeight: 1, letterSpacing: "-0.02em" }}>
      {value}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: "0.65rem", color: T.muted, mt: 0.8 }}>
        {sub}
      </Typography>
    )}
  </Box>
);

const FilterChip = ({ label, active, onClick }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      border: `1px solid ${active ? T.gold : T.border}`,
      bgcolor: active ? `${T.gold}14` : "transparent",
      color: active ? T.gold : T.mutedHi,
      borderRadius: "7px",
      px: "14px",
      py: "6px",
      fontSize: "0.72rem",
      fontWeight: 600,
      letterSpacing: "0.04em",
      cursor: "pointer",
      transition: "all 0.15s",
      fontFamily: "inherit",
      "&:hover": { borderColor: T.gold, color: T.gold, bgcolor: `${T.gold}0A` },
    }}
  >
    {label}
  </Box>
);

const SectionLabel = ({ children }) => (
  <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, mb: 2 }}>
    {children}
  </Typography>
);

/* ─── Custom Tooltip for charts ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", p: "10px 14px", boxShadow: "0 8px 24px #00000060" }}>
      <Typography sx={{ fontSize: "0.68rem", color: T.muted, mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} sx={{ fontSize: "0.82rem", fontFamily: "'DM Serif Display', serif", color: p.color || T.gold }}>
          ৳ {fmt(p.value)}
        </Typography>
      ))}
    </Box>
  );
};

/* ─────────────────── Main component ─────────────────── */
function ExpenseReport() {
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [viewMode, setViewMode]   = useState("daily");
  const [activeFilter, setActiveFilter] = useState("month");

  const [startDate, setStartDate] = useState(dayjs().startOf("month"));
  const [endDate, setEndDate]     = useState(dayjs());

  useEffect(() => {
    axios.get("/api/expense").then((res) => {
      setExpenses(res.data.result || []);
      setLoading(false);
    });
  }, []);

  const applyQuickFilter = (type) => {
    setActiveFilter(type);
    const now = dayjs();
    if (type === "today")     { setStartDate(now.startOf("day")); setEndDate(now.endOf("day")); }
    if (type === "7days")     { setStartDate(now.subtract(6,"day").startOf("day")); setEndDate(now.endOf("day")); }
    if (type === "15days")    { setStartDate(now.subtract(14,"day").startOf("day")); setEndDate(now.endOf("day")); }
    if (type === "month")     { setStartDate(now.startOf("month")); setEndDate(now.endOf("month")); }
    if (type === "lastmonth") { setStartDate(now.subtract(1,"month").startOf("month")); setEndDate(now.subtract(1,"month").endOf("month")); }
    if (type === "year")      { setStartDate(now.startOf("year")); setEndDate(now.endOf("year")); }
    // Monthly view requires full-year range by default
    if (type === "monthly")   { setViewMode("monthly"); setStartDate(now.startOf("year")); setEndDate(now.endOf("year")); return; }
    // Reset view mode away from monthly when a date filter is applied
    if (viewMode === "monthly") setViewMode("daily");
  };

  const filteredExpenses = useMemo(() =>
    expenses.filter((item) => {
      const d = dayjs(item.date);
      return d.isAfter(startDate.subtract(1,"ms")) && d.isBefore(endDate.add(1,"ms"));
    }), [expenses, startDate, endDate]);

  const categoryData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((item) => {
      const cat = item.category || "other";
      map[cat] = (map[cat] || 0) + item.amount;
    });
    return CATEGORIES.map((cat) => ({
      name: cat.label, value: map[cat.value] || 0, color: cat.color, icon: cat.icon,
    })).filter((i) => i.value > 0).sort((a,b) => b.value - a.value);
  }, [filteredExpenses]);

  const categoryDataWithPercentages = useMemo(() => {
    const total = categoryData.reduce((s,i) => s + i.value, 0);
    return categoryData.map((i) => ({ ...i, percentage: total > 0 ? Math.round((i.value/total)*100) : 0 }));
  }, [categoryData]);

  const dailyChartData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((item) => {
      const key = dayjs(item.date).format("DD MMM");
      map[key] = (map[key] || 0) + item.amount;
    });
    return Object.entries(map).map(([date, total]) => ({ date, total }));
  }, [filteredExpenses]);

  const categoryByDateData = useMemo(() => {
    const dateMap = {};
    filteredExpenses.forEach((item) => {
      const key = dayjs(item.date).format("DD MMM");
      const cat = item.category || "other";
      if (!dateMap[key]) dateMap[key] = { date: key };
      dateMap[key][cat] = (dateMap[key][cat] || 0) + item.amount;
      dateMap[key].total = (dateMap[key].total || 0) + item.amount;
    });
    return Object.values(dateMap).sort((a,b) => dayjs(a.date,"DD MMM").valueOf() - dayjs(b.date,"DD MMM").valueOf());
  }, [filteredExpenses]);

  const topExpensesByCategory = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((item) => {
      const cat = item.category || "other";
      if (!map[cat]) map[cat] = { category: cat, total: 0, count: 0, avg: 0, max: 0, maxExpenseName: "" };
      map[cat].total += item.amount;
      map[cat].count += 1;
      if (item.amount > map[cat].max) { map[cat].max = item.amount; map[cat].maxExpenseName = item.expenseName; }
    });
    Object.values(map).forEach((c) => { c.avg = Math.round(c.total / c.count); });
    return Object.values(map).sort((a,b) => b.total - a.total).map((cat) => ({
      ...cat,
      categoryLabel: CATEGORIES.find((c) => c.value === cat.category)?.label || "Other",
    }));
  }, [filteredExpenses]);

  // ── Month-wise aggregation (uses ALL expenses, not date-filtered) ──
  const monthlyChartData = useMemo(() => {
    const map = {};
    expenses.forEach((item) => {
      const key = dayjs(item.date).format("MMM YYYY");
      const sortKey = dayjs(item.date).format("YYYY-MM");
      if (!map[key]) map[key] = { month: key, sortKey, total: 0, count: 0 };
      map[key].total += item.amount;
      map[key].count += 1;
    });
    return Object.values(map).sort((a,b) => a.sortKey.localeCompare(b.sortKey));
  }, [expenses]);

  const monthlyTableData = useMemo(() => {
    const map = {};
    expenses.forEach((item) => {
      const key = dayjs(item.date).format("YYYY-MM");
      const label = dayjs(item.date).format("MMMM YYYY");
      const cat = item.category || "other";
      if (!map[key]) map[key] = { key, label, total: 0, count: 0, catMap: {}, topCat: "", topCatTotal: 0 };
      map[key].total += item.amount;
      map[key].count += 1;
      map[key].catMap[cat] = (map[key].catMap[cat] || 0) + item.amount;
    });
    Object.values(map).forEach((m) => {
      let max = 0;
      Object.entries(m.catMap).forEach(([cat, val]) => {
        if (val > max) { max = val; m.topCat = cat; m.topCatTotal = val; }
      });
      m.avgPerDay = Math.round(m.total / dayjs(m.key, "YYYY-MM").daysInMonth());
      delete m.catMap;
    });
    return Object.values(map).sort((a,b) => b.key.localeCompare(a.key));
  }, [expenses]);

  const totalAmount = useMemo(() => filteredExpenses.reduce((s,e) => s + e.amount, 0), [filteredExpenses]);
  const avgDaily    = useMemo(() => {
    const days = dayjs(endDate).diff(startDate, "day") + 1;
    return filteredExpenses.length > 0 ? Math.round(totalAmount / days) : 0;
  }, [filteredExpenses, totalAmount, startDate, endDate]);

  /* ── Google Fonts inject ── */
  useEffect(() => {
    if (document.getElementById("report-fonts")) return;
    const link = document.createElement("link");
    link.id = "report-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", bgcolor: T.bg }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: T.gold }} size={32} thickness={2} />
          <Typography sx={{ color: T.muted, fontSize: "0.72rem", mt: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Loading report
          </Typography>
        </Box>
      </Box>
    );
  }

  const datePicker_sx = {
    "& .MuiInputBase-root": {
      bgcolor: T.card, color: T.text, borderRadius: "10px", fontSize: "0.82rem",
      "& fieldset": { borderColor: T.border },
      "&:hover fieldset": { borderColor: T.borderHi },
      "&.Mui-focused fieldset": { borderColor: T.gold },
    },
    "& .MuiInputLabel-root": { color: T.muted, fontSize: "0.8rem" },
    "& .MuiSvgIcon-root": { color: T.muted },
  };

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: "100vh", p: { xs: 2, md: 3 }, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.gold, mb: 0.75 }}>
            Analytics
          </Typography>
          <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", fontWeight: 400, color: T.white, lineHeight: 1, letterSpacing: "-0.02em" }}>
            Expense Report
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: T.muted, mt: 0.75 }}>
            {dayjs(startDate).format("MMM D")} – {dayjs(endDate).format("MMM D, YYYY")}
          </Typography>
        </Box>

        {/* Quick filters */}
        <Stack direction="row" gap={1} flexWrap="wrap">
          {[
            { key: "today",     label: "Today"      },
            { key: "7days",     label: "7 Days"     },
            { key: "15days",    label: "15 Days"    },
            { key: "month",     label: "This Month" },
            { key: "lastmonth", label: "Last Month" },
            { key: "year",      label: "This Year"  },
          ].map((f) => (
            <FilterChip key={f.key} label={f.label} active={activeFilter === f.key} onClick={() => applyQuickFilter(f.key)} />
          ))}
        </Stack>
      </Box>

      {/* ── Date pickers ── */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2} mb={4}>
          <DatePicker label="Start Date" value={startDate} onChange={(v) => { setStartDate(v); setActiveFilter(null); }} sx={datePicker_sx} slotProps={{ textField: { size: "small" } }} />
          <DatePicker label="End Date"   value={endDate}   onChange={(v) => { setEndDate(v); setActiveFilter(null); }}   sx={datePicker_sx} slotProps={{ textField: { size: "small" } }} />
        </Stack>
      </LocalizationProvider>

      {/* ── KPI cards ── */}
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} mb={4} flexWrap="wrap">
        <KpiCard label="Total Spent"    value={`৳ ${fmt(totalAmount)}`}           sub={`across ${filteredExpenses.length} transactions`} />
        <KpiCard label="Daily Average"  value={`৳ ${fmt(avgDaily)}`}              sub="per day in period" />
        <KpiCard label="Transactions"   value={filteredExpenses.length}            sub={`${categoryData.length} categor${categoryData.length !== 1 ? "ies" : "y"}`} />
        <KpiCard label="Top Category"   value={categoryDataWithPercentages[0]?.name || "—"} sub={categoryDataWithPercentages[0] ? `৳ ${fmt(categoryDataWithPercentages[0].value)} · ${categoryDataWithPercentages[0].percentage}%` : ""} />
      </Stack>

      {/* ── View toggle ── */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {[
          { key: "daily",    label: "Daily View"   },
          { key: "category", label: "Category View" },
          { key: "monthly",  label: "Month-wise"   },
        ].map((mode) => (
          <Box
            key={mode.key}
            component="button"
            onClick={() => {
              setViewMode(mode.key);
              if (mode.key === "monthly") {
                setActiveFilter("monthly");
                const now = dayjs();
                setStartDate(now.startOf("year"));
                setEndDate(now.endOf("year"));
              }
            }}
            sx={{
              border: `1px solid ${viewMode === mode.key ? T.gold : T.border}`,
              bgcolor: viewMode === mode.key ? `${T.gold}10` : "transparent",
              color: viewMode === mode.key ? T.gold : T.mutedHi,
              borderRadius: "8px", px: "16px", py: "7px",
              fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              "&:hover": { borderColor: T.gold, color: T.gold },
            }}
          >
            {mode.label}
          </Box>
        ))}
      </Box>

      {/* ── Charts ── */}
      {viewMode === "monthly" ? (
        /* ── Monthly bar chart (full width) ── */
        <Box sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: "16px", p: "24px", mb: 4 }}>
          <SectionLabel>Month-wise Expenditure</SectionLabel>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} barSize={24}>
                <XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: `${T.gold}08` }} />
                <Bar dataKey="total" fill={T.gold} radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      ) : (
        /* ── Daily / Category charts ── */
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 380px" }, gap: 2, mb: 4 }}>
          {/* Main chart */}
          <Box sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: "16px", p: "24px" }}>
            <SectionLabel>{viewMode === "daily" ? "Daily Expenditure" : "Stacked by Category"}</SectionLabel>
            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === "daily" ? (
                  <BarChart data={dailyChartData} barSize={18}>
                    <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: `${T.gold}08` }} />
                    <Bar dataKey="total" fill={T.gold} radius={[5,5,0,0]} />
                  </BarChart>
                ) : (
                  <BarChart data={categoryByDateData} barSize={14}>
                    <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: `${T.gold}08` }} />
                    {CATEGORIES.map((cat) => (
                      <Bar key={cat.value} dataKey={cat.value} stackId="a" fill={cat.color} name={cat.label}
                        hide={categoryByDateData.every((d) => !d[cat.value])} radius={[0,0,0,0]} />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Side panel */}
          <Box sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: "16px", p: "24px" }}>
            {viewMode === "daily" ? (
              <>
                <SectionLabel>By Category</SectionLabel>
                <Box height={280} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryDataWithPercentages} cx="50%" cy="45%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                        {categoryDataWithPercentages.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend formatter={(value) => (<span style={{ color: T.mutedHi, fontSize: "0.68rem" }}>{value}</span>)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </>
            ) : (
              <>
                <SectionLabel>Category Breakdown</SectionLabel>
                <Stack spacing={2} sx={{ maxHeight: 280, overflowY: "auto", pr: 0.5 }}>
                  {categoryDataWithPercentages.map((cat) => (
                    <Box key={cat.name}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: cat.color, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: "0.73rem", color: T.text }}>{cat.name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.73rem", fontFamily: "'DM Serif Display', serif", color: T.white }}>
                          ৳ {fmt(cat.value)}
                        </Typography>
                      </Box>
                      <Box sx={{ height: 4, bgcolor: `${T.border}`, borderRadius: 4, overflow: "hidden" }}>
                        <Box sx={{ width: `${cat.percentage}%`, height: "100%", bgcolor: cat.color, borderRadius: 4, transition: "width 0.6s ease" }} />
                      </Box>
                      <Typography sx={{ fontSize: "0.6rem", color: T.muted, mt: 0.4 }}>{cat.percentage}%</Typography>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* ── Monthly summary table (only in monthly view) ── */}
      {viewMode === "monthly" && (
        <Box sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: "16px", overflow: "hidden", mb: 4 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
            <SectionLabel>Month-wise Summary</SectionLabel>
            <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.05rem", color: T.white, mt: -1 }}>
              All Time · {monthlyTableData.length} Month{monthlyTableData.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Month", "Total Spent", "Transactions", "Avg / Day", "Top Category", "Share"].map((h) => (
                    <TableCell key={h} align={h === "Month" ? "left" : "right"}
                      sx={{ borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", py: 1.5, px: 2 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const grandTotal = monthlyTableData.reduce((s,m) => s + m.total, 0);
                  return monthlyTableData.map((row) => {
                    const pct = grandTotal > 0 ? Math.round((row.total / grandTotal) * 100) : 0;
                    const topCfg = CATEGORIES.find((c) => c.value === row.topCat);
                    const isCurrentMonth = row.key === dayjs().format("YYYY-MM");
                    return (
                      <TableRow key={row.key} sx={{
                        bgcolor: isCurrentMonth ? `${T.gold}06` : "transparent",
                        "&:hover": { bgcolor: `${T.borderHi}30` },
                        "& td": { borderBottom: `1px solid ${T.border}44`, py: 1.6, px: 2 },
                        "&:last-child td": { borderBottom: "none" },
                      }}>
                        {/* Month label */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "0.9rem", color: T.white }}>
                              {row.label}
                            </Typography>
                            {isCurrentMonth && (
                              <Box sx={{ bgcolor: `${T.gold}20`, border: `1px solid ${T.gold}40`, color: T.gold, fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", px: "6px", py: "2px", borderRadius: "4px", textTransform: "uppercase" }}>
                                Current
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        {/* Total */}
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "0.95rem", color: T.white }}>
                            ৳ {fmt(row.total)}
                          </Typography>
                        </TableCell>
                        {/* Transactions */}
                        <TableCell align="right">
                          <Typography sx={{ fontSize: "0.82rem", color: T.mutedHi }}>{row.count}</Typography>
                        </TableCell>
                        {/* Avg per day */}
                        <TableCell align="right">
                          <Typography sx={{ fontSize: "0.82rem", color: T.mutedHi }}>৳ {fmt(row.avgPerDay)}</Typography>
                        </TableCell>
                        {/* Top category */}
                        <TableCell align="right">
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, justifyContent: "flex-end" }}>
                            {topCfg?.icon && (
                              <Box sx={{ fontSize: 11, color: topCfg?.color, lineHeight: 1 }}>{topCfg.icon}</Box>
                            )}
                            <Box>
                              <Typography sx={{ fontSize: "0.75rem", color: T.text }}>{topCfg?.label || row.topCat}</Typography>
                              <Typography sx={{ fontSize: "0.65rem", color: T.muted }}>৳ {fmt(row.topCatTotal)}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {/* Share */}
                        <TableCell align="right">
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 40, height: 4, bgcolor: T.border, borderRadius: 4, overflow: "hidden" }}>
                              <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: T.gold, borderRadius: 4 }} />
                            </Box>
                            <Typography sx={{ fontSize: "0.72rem", color: T.mutedHi, fontWeight: 600, minWidth: 28, textAlign: "right" }}>
                              {pct}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ── Category analysis table ── */}
      <Box sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: "16px", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
          <SectionLabel>Category Analysis</SectionLabel>
          <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.05rem", color: T.white, mt: -1 }}>
            All Spending Categories
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Category", "Total", "Transactions", "Avg. Spend", "Largest", "Share"].map((h) => (
                  <TableCell key={h} align={h === "Category" ? "left" : "right"} sx={{ borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", py: 1.5, px: 2 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {topExpensesByCategory.map((row, idx) => {
                const pct = totalAmount > 0 ? Math.round((row.total / totalAmount) * 100) : 0;
                const cfg = CATEGORIES.find((c) => c.value === row.category);
                return (
                  <TableRow
                    key={row.category}
                    sx={{
                      "&:hover": { bgcolor: `${T.borderHi}30` },
                      "& td": { borderBottom: `1px solid ${T.border}44`, py: 1.6, px: 2 },
                      "&:last-child td": { borderBottom: "none" },
                    }}
                  >
                    {/* Category */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: `${cfg?.color || "#888"}18`, border: `1px solid ${cfg?.color || "#888"}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Box sx={{ fontSize: 12, color: cfg?.color }}>{cfg?.icon || "•"}</Box>
                        </Box>
                        <Typography sx={{ fontSize: "0.82rem", color: T.text, fontWeight: 500 }}>
                          {row.categoryLabel}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Total */}
                    <TableCell align="right">
                      <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: "0.95rem", color: T.white }}>
                        ৳ {fmt(row.total)}
                      </Typography>
                    </TableCell>

                    {/* Count */}
                    <TableCell align="right">
                      <Typography sx={{ fontSize: "0.82rem", color: T.mutedHi }}>
                        {row.count}
                      </Typography>
                    </TableCell>

                    {/* Avg */}
                    <TableCell align="right">
                      <Typography sx={{ fontSize: "0.82rem", color: T.mutedHi }}>
                        ৳ {fmt(row.avg)}
                      </Typography>
                    </TableCell>

                    {/* Largest */}
                    <TableCell align="right">
                      <Typography sx={{ fontSize: "0.72rem", color: T.muted, maxWidth: 130, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {row.maxExpenseName}
                      </Typography>
                      <Typography sx={{ fontSize: "0.78rem", color: T.text, fontWeight: 500 }}>
                        ৳ {fmt(row.max)}
                      </Typography>
                    </TableCell>

                    {/* Share */}
                    <TableCell align="right">
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 40, height: 4, bgcolor: T.border, borderRadius: 4, overflow: "hidden" }}>
                          <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: cfg?.color || T.gold, borderRadius: 4 }} />
                        </Box>
                        <Typography sx={{ fontSize: "0.72rem", color: T.mutedHi, fontWeight: 600, minWidth: 28, textAlign: "right" }}>
                          {pct}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

              {topExpensesByCategory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5, borderBottom: "none" }}>
                    <Typography sx={{ color: T.muted, fontSize: "0.78rem" }}>No expense data for this period</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

    </Box>
  );
}

export default ExpenseReport;