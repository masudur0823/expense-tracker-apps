"use client";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Stack,
  Checkbox,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import dayjs from "dayjs";
import { useState, useMemo } from "react";

// Define your categories - you might want to move this to a config file
const CATEGORIES = [
  { value: "food", label: "Food" },
  { value: "transport", label: "Transportation" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "bills", label: "Bills & Utilities" },
  { value: "health", label: "Health & Medical" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

export default function ExpenseDateCard({ data, onDelete, onEdit }) {
  const [showActions, setShowActions] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({
    expenseName: "",
    amount: "",
    category: "",
  });
  const [saving, setSaving] = useState(false);

  // Initialize selection state
  const [selectedIds, setSelectedIds] = useState([]);

  const formattedDate = dayjs(data.date).format("ddd, MMM D, YYYY");

  const sortedItems = useMemo(() => {
    return [...(data.items || [])].sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    );
  }, [data.items]);

  // Logic to calculate sum of only selected rows
  const selectedTotal = useMemo(() => {
    return sortedItems
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [selectedIds, sortedItems]);

  // Robust Toggle Function
  const handleSelectRow = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditValues({ 
      expenseName: item.expenseName, 
      amount: item.amount,
      category: item.category || "" // Use existing category or empty string
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setEditValues({ expenseName: "", amount: "", category: "" });
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    
    setSaving(true);
    await onEdit(editingItem.id, editValues);
    setSaving(false);
    closeModal();
  };

  // Handle key press for modal (Enter to save, Escape to cancel)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          mb: 2,
        }}
      >
        {/* Header */}
        <Stack
          sx={{ bgcolor: "grey.50", px: 1.5, py: 1 }}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>
              {formattedDate}
            </Typography>

            {/* Display sum of selected items next to date */}
            {selectedIds.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  px: 1,
                  py: 0.3,
                  borderRadius: 1,
                  fontWeight: 700,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    display: { xs: "none", sm: "inline-block" },
                  }}
                >
                  Selected:
                </Typography>
                {selectedTotal.toLocaleString()}tk
              </Typography>
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "inline-block" } }}
            >
              Actions
            </Typography>
            <Checkbox
              size="small"
              checked={showActions}
              onChange={(e) => setShowActions(e.target.checked)}
            />
          </Stack>
        </Stack>

        <CardContent sx={{ px: 1, pt: 1, pb: "8px !important" }}>
          <Stack spacing={0.5}>
            {sortedItems.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    py: 0.5,
                    px: 0.5,
                    borderRadius: 1,
                    bgcolor: isSelected ? "primary.50" : "transparent",
                    borderBottom:
                      index !== sortedItems.length - 1 ? "1px dashed" : "none",
                    borderColor: "grey.100",
                    "&:hover": {
                      bgcolor: isSelected ? "primary.100" : "grey.50",
                    },
                  }}
                >
                  {/* Checkbox for Row Selection */}
                  {!showActions && (
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => handleSelectRow(item.id)}
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                  )}

                  <Box flex={1} mr={1}>
                    <Typography
                      fontSize={14}
                      fontWeight={isSelected ? 700 : 500}
                      color={isSelected ? "primary.dark" : "text.primary"}
                    >
                      {item.expenseName}
                    </Typography>
                    {item.category && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "inline-block",
                          bgcolor: "grey.100",
                          px: 1,
                          py: 0.2,
                          borderRadius: 12,
                          mt: 0.2,
                          fontSize: 9,
                        }}
                      >
                        {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontSize={14} fontWeight={800}>
                      {item.amount}tk
                    </Typography>

                    {showActions && (
                      <Stack direction="row">
                        <IconButton
                          size="small"
                          onClick={() => openEditModal(item)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={async () => {
                            setDeletingId(item.id);
                            await onDelete(item);
                            setDeletingId(null);
                          }}
                        >
                          {deletingId === item.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <DeleteOutlineIcon
                              color="error"
                              fontSize="small"
                            />
                          )}
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={12} fontWeight={600} color="text.secondary">
              DAILY TOTAL
            </Typography>
            <Typography fontSize={16} fontWeight={800} color="primary.main">
              {data.total.toLocaleString()}tk
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Expense
          {editingItem && (
            <Typography variant="caption" color="text.secondary" display="block">
              {dayjs(editingItem.createdAt).format('MMM D, YYYY h:mm A')}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }} onKeyDown={handleKeyPress}>
            <TextField
              autoFocus
              label="Expense Name"
              fullWidth
              value={editValues.expenseName}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  expenseName: e.target.value,
                })
              }
              variant="outlined"
            />
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editValues.category}
                onChange={(e) =>
                  setEditValues({
                    ...editValues,
                    category: e.target.value,
                  })
                }
                label="Category"
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Amount (tk)"
              type="number"
              fullWidth
              value={editValues.amount}
              onChange={(e) =>
                setEditValues({ ...editValues, amount: e.target.value })
              }
              variant="outlined"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>৳</Typography>,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={saveEdit} 
            variant="contained" 
            disabled={saving || !editValues.expenseName || !editValues.amount}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}