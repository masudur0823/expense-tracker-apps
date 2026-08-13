"use client";
import {
  Typography,
  Box,
  Stack,
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
  Collapse,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import CATEGORIES from "../../staticData/category";

export default function ExpenseDateCard({ data, onDelete, onEdit, index }) {
  const [showActions, setShowActions] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({
    expenseName: "",
    amount: "",
    category: "",
    date: "",
  });
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [expanded, setExpanded] = useState(true);

  const isToday = dayjs(data.date).isSame(dayjs(), "day");
  const isYesterday = dayjs(data.date).isSame(dayjs().subtract(1, "day"), "day");

  const dateLabel = isToday
    ? "Today"
    : isYesterday
    ? "Yesterday"
    : dayjs(data.date).format("ddd, MMM D");

  const dateSubLabel =
    isToday || isYesterday
      ? dayjs(data.date).format("MMM D, YYYY")
      : dayjs(data.date).format("YYYY");

  const sortedItems = useMemo(
    () =>
      [...(data.items || [])].sort(
        (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
      ),
    [data.items]
  );

  const selectedTotal = useMemo(
    () =>
      sortedItems
        .filter((i) => selectedIds.includes(i.id))
        .reduce((s, i) => s + Number(i.amount || 0), 0),
    [selectedIds, sortedItems]
  );

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditValues({
      expenseName: item.expenseName,
      amount: item.amount,
      category: item.category || "",
      // Use the item's own date if available, otherwise fall back to the card's date
      date: dayjs(item.date ?? data.date).format("YYYY-MM-DD"),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setEditValues({ expenseName: "", amount: "", category: "", date: "" });
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    setSaving(true);
    await onEdit(editingItem.id, editValues);
    setSaving(false);
    closeModal();
  };

  const getCategoryMeta = (value) =>
    CATEGORIES.find((c) => c.value === value) || { label: value, color: "#888" };

  return (
    <>
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #ECEAE4",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* ── Card Header ── */}
        <Box
          sx={{
            px: { xs: 0, sm: 2 },
            py: 1.4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: expanded ? "1px solid #F2F0EB" : "none",
            cursor: "pointer",
            "&:hover": { bgcolor: "#FAFAF8" },
            transition: "background 0.12s",
          }}
          onClick={() => setExpanded((p) => !p)}
        >
          {/* Left: date + selection badge */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                color: "#bbb",
                display: "flex",
                alignItems: "center",
                transition: "transform 0.2s",
                transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            >
              <KeyboardArrowDownIcon sx={{ fontSize: 17 }} />
            </Box>

            <Box display="flex" alignItems="baseline" gap={0.75}>
              <Typography
                sx={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.95rem",
                  fontWeight: 400,
                  color: "#1A1A2E",
                  letterSpacing: "-0.01em",
                }}
              >
                {/* {dateLabel} */}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#bbb", fontWeight: 400 }}>
                {dayjs(data.date).format("DD/MM/YY")}
              </Typography>

              {selectedIds.length > 0 && (
                <Box
                  sx={{
                    ml: 0.5,
                    bgcolor: "#1A1A2E",
                    color: "#fff",
                    borderRadius: "5px",
                    px: "7px",
                    py: "2px",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                  }}
                >
                  {/* {selectedIds.length} ·  */}
                  {selectedTotal.toLocaleString()}
                </Box>
              )}
            </Box>
          </Box>

          {/* Right: total + item count + action buttons */}
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            onClick={(e) => e.stopPropagation()}
          >
            <Box display="flex" alignItems="baseline" gap={0.5}>
              <Typography
                sx={{
                  fontFamily: "Georgia, serif",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#1A1A2E",
                  letterSpacing: "-0.02em",
                }}
              >
                {data.total.toLocaleString()}
              </Typography>
              {/* <Typography sx={{ fontSize: "0.62rem", color: "#bbb", fontWeight: 400 }}>
                BDT
              </Typography> */}
              {/* <Typography
                sx={{ fontSize: "0.62rem", color: "#ccc", fontWeight: 400, ml: 0.25 }}
              >
                · {sortedItems.length} item{sortedItems.length !== 1 ? "s" : ""}
              </Typography> */}
            </Box>

            {selectedIds.length > 0 && (
              <Button
                size="small"
                onClick={() => setSelectedIds([])}
                sx={{
                  color: "#aaa",
                  textTransform: "none",
                  fontSize: "0.68rem",
                  minWidth: 0,
                  p: "2px 6px",
                  "&:hover": { bgcolor: "#F0EDE6" },
                }}
              >
                Clear
              </Button>
            )}

            <IconButton
              size="small"
              onClick={() => setShowActions((p) => !p)}
              sx={{
                color: showActions ? "#1A1A2E" : "#bbb",
                bgcolor: showActions ? "#F0EDE6" : "transparent",
                borderRadius: "7px",
                p: "4px",
                "&:hover": { bgcolor: "#F0EDE6", color: "#1A1A2E" },
              }}
            >
              <MoreHorizIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* ── Row list (collapsible) ── */}
        <Collapse in={expanded}>
          <Box>
            {sortedItems.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);
              const cat = getCategoryMeta(item.category);
              const isLast = index === sortedItems.length - 1;

              return (
                <Box
                  key={item.id}
                  onClick={() => !showActions && handleSelectRow(item.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 1.1,
                    gap: 1.25,
                    cursor: showActions ? "default" : "pointer",
                    bgcolor: isSelected ? "#F5F3EF" : "transparent",
                    borderBottom: isLast ? "none" : "1px solid #F7F5F2",
                    transition: "background 0.12s",
                    "&:hover": { bgcolor: isSelected ? "#F0EDE6" : "#FAFAF8" },
                  }}
                >
                  <Box
                    sx={{
                      width: 3,
                      height: 28,
                      borderRadius: "2px",
                      bgcolor: isSelected ? "#1A1A2E" : "transparent",
                      flexShrink: 0,
                      transition: "background 0.12s",
                    }}
                  />

                  {/* <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "7px",
                      bgcolor: `${cat.color}18`,
                      border: `1px solid ${cat.color}30`,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cat.icon ? (
                      <Box
                        sx={{
                          fontSize: 13,
                          lineHeight: 1,
                          "& svg": { fontSize: "13px !important" },
                        }}
                      >
                        {cat.icon}
                      </Box>
                    ) : (
                      <Box
                        sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: cat.color }}
                      />
                    )}
                  </Box> */}

                  <Box flex={1} minWidth={0}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "0.845rem",
                        fontWeight: isSelected ? 600 : 500,
                        color: "#1A1A2E",
                      }}
                    >
                      {item.expenseName}
                    </Typography>
                    {item.category && (
                      <Typography
                        sx={{ fontSize: "0.65rem", color: cat.color, fontWeight: 500, mt: 0.1 }}
                      >
                        {cat.label}
                      </Typography>
                    )}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "#1A1A2E",
                      fontFamily: "Georgia, serif",
                      letterSpacing: "-0.02em",
                      flexShrink: 0,
                    }}
                  >
                    {Number(item.amount).toLocaleString()}
                  </Typography>

                  {showActions && (
                    <Box display="flex" gap={0.25} flexShrink={0}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}
                        sx={{
                          color: "#aaa",
                          borderRadius: "7px",
                          p: "4px",
                          "&:hover": { bgcolor: "#F0EDE6", color: "#1A1A2E" },
                        }}
                      >
                        <EditOutlinedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setDeletingId(item.id);
                          await onDelete(item);
                          setDeletingId(null);
                        }}
                        sx={{
                          color: "#E24B4A",
                          borderRadius: "7px",
                          p: "4px",
                          "&:hover": { bgcolor: "#FCEBEB" },
                        }}
                      >
                        {deletingId === item.id ? (
                          <CircularProgress size={13} sx={{ color: "#E24B4A" }} />
                        ) : (
                          <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                        )}
                      </IconButton>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </Box>

      {/* ── Edit Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "14px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            px: 3,
            pt: 2.5,
            pb: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "Georgia, serif",
                fontSize: "1.05rem",
                fontWeight: 400,
                color: "#1A1A2E",
              }}
            >
              Edit expense
            </Typography>
            {editingItem && (
              <Typography sx={{ fontSize: "0.7rem", color: "#bbb", mt: 0.25 }}>
                Added {dayjs(editingItem.createdAt).format("MMM D, YYYY [at] h:mm A")}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={closeModal}
            sx={{
              color: "#bbb",
              "&:hover": { bgcolor: "#F0EDE6" },
              borderRadius: "7px",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ px: 3, pb: 2, borderTop: "1px solid #ECEAE4", pt: "20px !important" }}
        >
          <Stack spacing={2} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && saveEdit()}>
            <TextField
              autoFocus
              label="Expense name"
              fullWidth
              size="small"
              value={editValues.expenseName}
              onChange={(e) => setEditValues({ ...editValues, expenseName: e.target.value })}
              InputProps={{ sx: { borderRadius: "8px" } }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={editValues.category}
                onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                label="Category"
                sx={{ borderRadius: "8px" }}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "3px",
                          bgcolor: cat.color,
                          flexShrink: 0,
                        }}
                      />
                      {cat.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ── Date field (new) ── */}
            <TextField
              label="Date"
              type="date"
              fullWidth
              size="small"
              value={editValues.date}
              onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: dayjs().format("YYYY-MM-DD") }}
              InputProps={{ sx: { borderRadius: "8px" } }}
            />

            <TextField
              label="Amount"
              type="number"
              fullWidth
              size="small"
              value={editValues.amount}
              onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 0.75, color: "#aaa", fontSize: "0.88rem" }}>
                    ৳
                  </Typography>
                ),
                sx: { borderRadius: "8px" },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: "1px solid #ECEAE4" }}>
          <Button
            onClick={closeModal}
            disabled={saving}
            sx={{
              color: "#888",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 500,
              borderRadius: "8px",
              px: 2,
              "&:hover": { bgcolor: "#F0EDE6" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveEdit}
            variant="contained"
            disabled={saving || !editValues.expenseName || !editValues.amount || !editValues.date}
            startIcon={
              saving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : null
            }
            sx={{
              bgcolor: "#1A1A2E",
              color: "#fff",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 500,
              borderRadius: "8px",
              px: 3,
              boxShadow: "none",
              "&:hover": { bgcolor: "#2E2E4A", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "#ccc", color: "#fff" },
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}