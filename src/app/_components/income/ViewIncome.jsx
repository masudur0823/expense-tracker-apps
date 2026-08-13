import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Stack,
  Chip,
  Pagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InboxIcon from "@mui/icons-material/Inbox";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import axios from "axios";
import dayjs from "dayjs";

const ITEMS_PER_PAGE = 10;
const API_BASE = "/api/income"; // adjust to your actual endpoint

function ViewIncome() {
  const [incomeData, setIncomeData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [notFound, setNotFound] = React.useState(false);

  const [expanded, setExpanded] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const [editItem, setEditItem] = React.useState(null); // item being edited
  const [editForm, setEditForm] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  console.log(editForm);

  const [deleteItem, setDeleteItem] = React.useState(null); // item pending delete confirmation
  const [deleting, setDeleting] = React.useState(false);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ---- Fetch data ----
  const fetchIncome = async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await axios.get(API_BASE, {
        validateStatus: (status) => status < 500, // let 404/204 fall through to our own handling
      });

      if (res.status === 404) {
        setNotFound(true);
        setIncomeData([]);
        return;
      }

      if (res.status === 204) {
        setIncomeData([]);
        return;
      }

      if (res.status >= 400) throw new Error("Failed to fetch income data");

      // Handle common API response shapes: a bare array, or an array
      // nested under a wrapper key like { data: [...] } / { income: [...] }.
      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.income)
            ? payload.income
            : Array.isArray(payload?.result)
              ? payload.result
              : [];

      setIncomeData(list);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchIncome();
  }, []);

  // ---- Accordion ----
  const handleChange = (id) => (event, isExpanded) => {
    setExpanded(isExpanded ? id : false);
  };

  // ---- Pagination ----
  const pageCount = Math.ceil(incomeData.length / ITEMS_PER_PAGE);
  const paginatedData = incomeData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    setExpanded(false);
  };

  // ---- Edit ----
  const openEdit = (item, e) => {
    e.stopPropagation(); // don't toggle accordion
    setEditItem(item);
    setEditForm({ ...item, date: dayjs(item.date).format("YYYY-MM-DD") }); // format date for input[type=date]
  };

  const closeEdit = () => {
    setEditItem(null);
    setEditForm({});
  };

  const handleEditFieldChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/${editItem.id}`, editForm);
      const updated = res.data;

      setIncomeData((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSnackbar({
        open: true,
        message: "Income updated",
        severity: "success",
      });
      closeEdit();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to update income",
        severity: "error",
      });
    } finally {
      fetchIncome(); // refresh data after edit
      setSaving(false);
    }
  };

  // ---- Delete ----
  const openDeleteConfirm = (item, e) => {
    e.stopPropagation();
    setDeleteItem(item);
  };

  const closeDeleteConfirm = () => {
    setDeleteItem(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/${deleteItem.id}`);

      setIncomeData((prev) => prev.filter((item) => item.id !== deleteItem.id));
      setSnackbar({
        open: true,
        message: "Income deleted",
        severity: "success",
      });

      // if the deleted item leaves the current page empty, step back a page
      const remaining = incomeData.length - 1;
      const newPageCount = Math.ceil(remaining / ITEMS_PER_PAGE);
      if (page > newPageCount && newPageCount > 0) {
        setPage(newPageCount);
      }
      setExpanded(false);
      closeDeleteConfirm();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete income",
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ---- Render states ----
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchIncome}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (notFound) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 600 }}>
          Income Details
        </Typography>
        <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
          <SearchOffIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          <Typography color="text.secondary">Income data not found.</Typography>
          <Button size="small" onClick={fetchIncome}>
            Refresh
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box id="view-income" sx={{ maxWidth: 700, mx: "auto" }}>
      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 600 }}>
        Income Details
      </Typography>

      {incomeData.length === 0 ? (
        <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
          <InboxIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          <Typography color="text.secondary">No income records yet.</Typography>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          {paginatedData.map((item) => (
            <Accordion
              key={item.id}
              expanded={expanded === item.id}
              onChange={handleChange(item.id)}
              disableGutters
              elevation={0}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px !important",
                overflow: "hidden",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 2,
                  "& .MuiAccordionSummary-content": {
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr auto",
                    alignItems: "center",
                    gap: 1,
                  },
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {item.incomeName}
                </Typography>
                <Typography sx={{ color: "success.main", fontWeight: 500 }}>
                  {item.amount} ( {dayjs(item.date).format("DD MMM YYYY")})
                </Typography>
              </AccordionSummary>

              <AccordionDetails
                sx={{ borderTop: "1px solid #eee", px: 2, py: 1.5 }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Chip label={item.category} size="small" />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "right" }}>
                      {item.notes}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => openEdit(item, e)}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => openDeleteConfirm(item, e)}
                      aria-label="delete"
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {pageCount > 1 && (
        <Stack alignItems="center" sx={{ mt: 2.5 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editItem} onClose={closeEdit} fullWidth maxWidth="xs">
        <DialogTitle>Edit income</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Income name"
              value={editForm.incomeName || ""}
              onChange={handleEditFieldChange("incomeName")}
              fullWidth
            />
            <TextField
              label="Amount"
              value={editForm.amount || ""}
              onChange={handleEditFieldChange("amount")}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={editForm.date || ""}
              onChange={handleEditFieldChange("date")}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Category"
              value={editForm.category || ""}
              onChange={handleEditFieldChange("category")}
              fullWidth
            />
            <TextField
              label="Notes"
              value={editForm.notes || ""}
              onChange={handleEditFieldChange("notes")}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={saveEdit} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteItem}
        onClose={closeDeleteConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete income record?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete <strong>{deleteItem?.name}</strong> (
            {deleteItem?.amount} on {deleteItem?.date}). This action can&apos;t
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ViewIncome;
