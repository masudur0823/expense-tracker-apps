"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRef } from "react";
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
import Avatar from "@mui/material/Avatar";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import ReportIcon from "@mui/icons-material/Report";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useRouter } from "next/navigation";
import AddExpenseButton from "../_components/expense/AddExpenseButton";
import ExpenseDateCard from "../_components/expense/ExpenseDateCard";
import AddExpenseModal from "../_components/AddExpenseModal";
import { groupExpensesByDate } from "../_components/expense/groupByDate";
import Switch from "@mui/material/Switch";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const FILTER_KEY = "expense_filters";

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isHydrated = useRef(false);
  const [activeQuick, setActiveQuick] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Default to null or specific range if you prefer
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

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
 
    try {
      await axios.delete(`/api/expense/${item.id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };
  const handleEdit = async (id, values) => {
    await axios.put(`/api/expense/${id}`, values);
    fetchExpenses(); // refetch or mutate
  };
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) setDarkMode(savedTheme === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (saved) {
      const { search, fromDate, toDate } = JSON.parse(saved);
      setSearch(search || "");
      setFromDate(fromDate ? dayjs(fromDate) : null);
      setToDate(toDate ? dayjs(toDate) : null);
    }
    isHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!isHydrated.current) return;

    // If all filters are empty → remove storage
    if (!search && !fromDate && !toDate) {
      localStorage.removeItem(FILTER_KEY);
      return;
    }
  }, [search, fromDate, toDate]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleQuickRange = (range) => {
    const today = dayjs();
    setActiveQuick(range);
    if (range === "today") {
      setFromDate(today);
      setToDate(today);
    } else if (range === "yesterday") {
      const yesterday = today.subtract(1, "day");
      setFromDate(yesterday);
      setToDate(yesterday);
    } else if (range === "week") {
      setFromDate(today.subtract(7, "day"));
      setToDate(today);
    } else if (range === "month") {
      setFromDate(today.startOf("month"));
      setToDate(today.endOf("month"));
    } else if (range === "Lastmonth") {
      const lastMonth = today.subtract(1, "month");
      setFromDate(lastMonth.startOf("month"));
      setToDate(lastMonth.endOf("month"));
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.expenseName
      .toLowerCase()
      .includes(search.toLowerCase());
    const expenseDate = dayjs(e.date).startOf("day");
    const from = fromDate ? dayjs(fromDate).startOf("day") : null;
    const to = toDate ? dayjs(toDate).startOf("day") : null;

    const inDateRange =
      (!from || expenseDate.isSameOrAfter(from)) &&
      (!to || expenseDate.isSameOrBefore(to));

    return matchesSearch && inDateRange;
  });

  const groupedData = groupExpensesByDate(filteredExpenses);
  const sortedGroupedData = [...groupedData].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  );
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const handleResetFilters = () => {
    setSearch("");
    setFromDate(null);
    setToDate(null);
    localStorage.removeItem(FILTER_KEY);
    setFilterOpen(false);
  };
  const handleShowResults = () => {
    // Save filters to localStorage
    const filtersToSave = {
      search,
      fromDate: fromDate ? fromDate.toISOString() : null,
      toDate: toDate ? toDate.toISOString() : null,
    };
    localStorage.setItem(FILTER_KEY, JSON.stringify(filtersToSave));
    setFilterOpen(false);
  };

  // Helper to show the date range text
  const getFilterText = () => {
    if (!fromDate && !toDate && !search) return "All Records";
    let text = "";
    if (fromDate || toDate) {
      text += `${fromDate ? dayjs(fromDate).format("MMM DD") : "Start"} - ${
        toDate ? dayjs(toDate).format("MMM DD, YYYY") : "End"
      }`;
    }
    if (search) text += ` | Search: "${search}"`;
    return text;
  };

  const handleLogout = () => {
    localStorage.clear(); // or remove token only
    router.push("/login");
  };

  return (
    <>
      <Container maxWidth="md" sx={{ py: 2, pt: 0, px: { xs: 0, sm: 2 } }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton size="small" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" fontWeight="700" color="primary">
              Expenses
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems={"center"}>
            <IconButton
              size="small"
              onClick={() => setFilterOpen(true)}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                ml: "0 !important",
              }}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
            <AddExpenseButton onClick={() => setOpen(true)} />
          </Stack>
        </Box>

        {/* --- Filter Value Display (Top) --- */}
        <Box
          sx={{
            mt: 1,

            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
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
          <Typography align="center" color="text.secondary" sx={{ py: 5 }}>
            No expenses found.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {sortedGroupedData.map((group) => (
              <ExpenseDateCard
                key={group.date}
                data={group}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </Stack>
        )}

        {/* --- Filter & Stats Modal --- */}
        <Dialog
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Filters & Summary
            <IconButton onClick={() => setFilterOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={3}>
              {/* Quick Select Buttons */}
              <Box>
                <Typography variant="subtitle2" mb={1} fontWeight="600">
                  Quick Select
                </Typography>
                <Stack direction="row" gap={1} flexWrap={"wrap"}>
                  <Chip
                    label="Today"
                    clickable
                    onClick={() => handleQuickRange("today")}
                    color={activeQuick === "today" ? "primary" : "default"}
                  />

                  <Chip
                    label="Yesterday"
                    clickable
                    onClick={() => handleQuickRange("yesterday")}
                    color={activeQuick === "yesterday" ? "primary" : "default"}
                  />

                  <Chip
                    label="Last 7 Days"
                    clickable
                    onClick={() => handleQuickRange("week")}
                    color={activeQuick === "week" ? "primary" : "default"}
                  />

                  <Chip
                    label="This Month"
                    clickable
                    onClick={() => handleQuickRange("month")}
                    color={activeQuick === "month" ? "primary" : "default"}
                  />

                  <Chip
                    label="Last Month"
                    clickable
                    onClick={() => handleQuickRange("Lastmonth")}
                    color={activeQuick === "lastMonth" ? "primary" : "default"}
                  />
                </Stack>
              </Box>

              {/* Search */}
              <Box>
                <Typography variant="subtitle2" mb={1} fontWeight="600">
                  Search
                </Typography>
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
              </Box>

              {/* Date Range Picker */}
              <Box>
                <Typography variant="subtitle2" mb={1} fontWeight="600">
                  Date Range
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <DatePicker
                      label="From"
                      value={fromDate}
                      onChange={(newValue) => setFromDate(newValue)}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                    <DatePicker
                      label="To"
                      value={toDate}
                      onChange={(newValue) => setToDate(newValue)}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  </Stack>
                </LocalizationProvider>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button color="inherit" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button variant="contained" onClick={handleShowResults}>
              Show Results
            </Button>
          </DialogActions>
        </Dialog>

        <AddExpenseModal
          open={open}
          onClose={() => {
            setOpen(false);
            fetchExpenses();
          }}
        />
      </Container>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260 }}>
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>U</Avatar>
            <Box>
              <Typography fontWeight={600}>User Name</Typography>
              <Typography variant="caption" color="text.secondary">
                user@email.com
              </Typography>
            </Box>
          </Box>

          <Divider />

          <List>
            <ListItemButton
              onClick={() => {
                setDrawerOpen(false);
                router.push("/report");
              }}
            >
              <ListItemIcon>
                <ReportIcon />
              </ListItemIcon>
              <ListItemText primary="Report" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                setDrawerOpen(false);
                router.push("/settings");
              }}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <Brightness4Icon />
              </ListItemIcon>
              <ListItemText primary="Dark Mode" />
              <Switch
                edge="end"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ color: "error" }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
