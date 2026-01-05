"use client";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Stack,
  Checkbox,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { useState, useMemo } from "react";

export default function ExpenseDateCard({ data, onDelete, onEdit }) {
  const [showActions, setShowActions] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // 1. Initialize selection state
  const [selectedIds, setSelectedIds] = useState([]);

  const [editValues, setEditValues] = useState({
    expenseName: "",
    amount: "",
  });
  const [saving, setSaving] = useState(false);

  const formattedDate = dayjs(data.date).format("ddd, MMM D, YYYY");

  const sortedItems = useMemo(() => {
    return [...(data.items || [])].sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    );
  }, [data.items]);

  // 2. Logic to calculate sum of only selected rows
  const selectedTotal = useMemo(() => {
    return sortedItems
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [selectedIds, sortedItems]);

  // 3. Robust Toggle Function
  const handleSelectRow = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ expenseName: item.expenseName, amount: item.amount });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ expenseName: "", amount: "" });
  };

  const saveEdit = async (item) => {
    setSaving(true);
    await onEdit(item.id, editValues);
    setSaving(false);
    cancelEdit();
  };

  return (
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
            const isEditing = editingId === item.id;
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
                  bgcolor: isSelected ? "primary.50" : "transparent", // Highlight background
                  borderBottom:
                    index !== sortedItems.length - 1 ? "1px dashed" : "none",
                  borderColor: "grey.100",
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
                  {isEditing ? (
                    <TextField
                      size="small"
                      fullWidth
                      value={editValues.expenseName}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          expenseName: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <Typography
                      fontSize={14}
                      fontWeight={isSelected ? 700 : 500}
                      color={isSelected ? "primary.dark" : "text.primary"}
                    >
                      {item.expenseName}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  {isEditing ? (
                    <TextField
                      size="small"
                      type="number"
                      sx={{ width: 80 }}
                      value={editValues.amount}
                      onChange={(e) =>
                        setEditValues({ ...editValues, amount: e.target.value })
                      }
                    />
                  ) : (
                    <Typography fontSize={14} fontWeight={800}>
                      {item.amount}tk
                    </Typography>
                  )}

                  {showActions && (
                    <Stack direction="row">
                      {isEditing ? (
                        <>
                          <IconButton
                            size="small"
                            disabled={saving}
                            onClick={() => saveEdit(item)}
                          >
                            {saving ? (
                              <CircularProgress size={16} />
                            ) : (
                              <SaveIcon color="success" fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton size="small" onClick={cancelEdit}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => startEdit(item)}
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
                        </>
                      )}
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
  );
}
