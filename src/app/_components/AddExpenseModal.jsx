"use client";
import { useState, useRef } from "react";
import axios from "axios";
import {
  Dialog,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  useMediaQuery,
  Slide,
  Paper,
  Stack,
  CircularProgress,
  DialogContent,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useTheme } from "@mui/material/styles";
import { parseExpenses } from "./expense/utils";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CATEGORIES from "../staticData/category";

const Transition = (props) => <Slide direction="up" {...props} />;

const FORMAT_EXAMPLES = [
  { text: "Lunch at Subway - 150", note: "name — amount" },
  { text: "Grocery - 450 @food", note: "with category" },
  { text: "Taxi - 80 @transport", note: "" },
];

export default function AddExpenseModal({ open, onClose }) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [showGuide, setShowGuide] = useState(false);

  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [filteredCategories, setFilteredCategories] = useState(CATEGORIES);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const textFieldRef = useRef(null);
  const popupAnchorRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (value) => {
    setText(value);
    const { errors, totalAmount } = parseExpenses(value);
    setErrors(errors);
    setTotal(totalAmount);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    const textBeforeCursor = newText.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (afterAt.includes(" ") && !afterAt.includes("@")) {
        setShowCategoryPopup(false);
      } else {
        const searchTerm = afterAt.toLowerCase();
        const filtered = CATEGORIES.filter(
          (cat) =>
            cat.label.toLowerCase().includes(searchTerm) ||
            cat.value.toLowerCase().includes(searchTerm)
        );
        setFilteredCategories(filtered);
        setSelectedCategoryIndex(0);
        setShowCategoryPopup(true);
      }
    } else {
      setShowCategoryPopup(false);
    }
    handleChange(newText);
  };

  const handleCategorySelect = (category) => {
    const beforeAt = text.substring(0, cursorPosition);
    const afterAt = text.substring(cursorPosition);
    const lastAtIndex = beforeAt.lastIndexOf("@");
    const newText =
      text.substring(0, lastAtIndex) + "@" + category.value + " " + afterAt;
    setText(newText);
    setShowCategoryPopup(false);
    if (textFieldRef.current) {
      const newCursorPos = lastAtIndex + category.value.length + 2;
      textFieldRef.current.focus();
      textFieldRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
    handleChange(newText);
  };

  const handleKeyDown = (e) => {
    if (showCategoryPopup) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedCategoryIndex((prev) =>
            prev < filteredCategories.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedCategoryIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCategories.length > 0)
            handleCategorySelect(filteredCategories[selectedCategoryIndex]);
          break;
        case "Escape":
          setShowCategoryPopup(false);
          break;
      }
    }
  };

  const handleSubmit = async () => {
    const { expenses, errors: parseErrors } = parseExpenses(text);
    if (parseErrors.length > 0) return;
    const payload =
      expenses.length === 0
        ? { date: date.format("YYYY-MM-DD"), expensesName: "No Expense", amount: 0 }
        : { expenses: expenses.map((exp) => ({ ...exp, date: date.format("YYYY-MM-DD") })) };
    try {
      setLoading(true);
      await axios.post("/api/expense", payload);
      setText("");
      setErrors([]);
      setTotal(0);
      setDate(dayjs());
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save expenses");
    } finally {
      setLoading(false);
    }
  };

  const lineCount = text.split("\n").filter((l) => l.trim()).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : "16px",
          bgcolor: "#F8F7F4",
          boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
          overflow: "hidden",
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #ECEAE4",
          px: 2.5,
          py: 1.6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.25}>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "#aaa",
              borderRadius: "7px",
              p: "4px",
              "&:hover": { bgcolor: "#F0EDE6", color: "#1A1A2E" },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography
            sx={{
              fontFamily: "Georgia, serif",
              fontSize: "1rem",
              fontWeight: 400,
              color: "#1A1A2E",
              letterSpacing: "-0.01em",
            }}
          >
            Add expenses
          </Typography>
        </Box>

        {!isMobile && (
          <Button
            onClick={handleSubmit}
            disabled={errors.length > 0 || loading}
            sx={{
              bgcolor: "#1A1A2E",
              color: "#fff",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 500,
              borderRadius: "8px",
              px: 2.5,
              py: 0.7,
              boxShadow: "none",
              "&:hover": { bgcolor: "#2E2E4A", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "#D0CEC8", color: "#fff" },
            }}
          >
            {loading ? (
              <CircularProgress size={14} sx={{ color: "#fff" }} />
            ) : total > 0 ? (
              `Save · ${total.toLocaleString()} BDT`
            ) : (
              "Save"
            )}
          </Button>
        )}
      </Box>

      <DialogContent sx={{ p: isMobile ? 2 : 2.5, display: "flex", flexDirection: "column", gap: 2 }}>

        {/* ── Date row ── */}
        <Box
          sx={{
            bgcolor: "#fff",
            border: "1px solid #ECEAE4",
            borderRadius: "10px",
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.62rem",
              fontWeight: 700,
              color: "#bbb",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              mb: 1.25,
            }}
          >
            Transaction date
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={date}
              format="DD MMM YYYY"
              onChange={(v) => setDate(v)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#FAFAF8",
                      fontSize: "0.88rem",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        {/* ── Input section ── */}
        <Box
          sx={{
            bgcolor: "#fff",
            border: "1px solid #ECEAE4",
            borderRadius: "10px",
            p: 2,
            flex: 1,
          }}
        >
          {/* Section label row */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.25}>
            <Typography
              sx={{
                fontSize: "0.62rem",
                fontWeight: 700,
                color: "#bbb",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Expense details
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              onClick={() => setShowGuide((p) => !p)}
              sx={{ cursor: "pointer", color: showGuide ? "#1A1A2E" : "#bbb", "&:hover": { color: "#1A1A2E" } }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
                Format guide
              </Typography>
            </Box>
          </Box>

          {/* Format guide */}
          {showGuide && (
            <Box
              sx={{
                bgcolor: "#F8F7F4",
                border: "1px solid #ECEAE4",
                borderRadius: "8px",
                p: 1.5,
                mb: 1.5,
              }}
            >
              <Typography
                sx={{ fontSize: "0.68rem", color: "#999", mb: 1, fontWeight: 500 }}
              >
                One expense per line — <span style={{ fontFamily: "monospace" }}>name - amount @category</span>
              </Typography>
              {FORMAT_EXAMPLES.map((ex) => (
                <Box key={ex.text} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      color: "#1A1A2E",
                      bgcolor: "#ECEAE4",
                      px: 1,
                      py: 0.25,
                      borderRadius: "4px",
                    }}
                  >
                    {ex.text}
                  </Typography>
                  {ex.note && (
                    <Typography sx={{ fontSize: "0.65rem", color: "#bbb" }}>{ex.note}</Typography>
                  )}
                </Box>
              ))}
              <Typography sx={{ fontSize: "0.65rem", color: "#bbb", mt: 1 }}>
                Type <span style={{ fontFamily: "monospace", color: "#1A1A2E" }}>@</span> to pick a category
              </Typography>
            </Box>
          )}

          {/* Textarea + category popup */}
          <Box ref={popupAnchorRef} sx={{ position: "relative" }}>
            <TextField
              multiline
              rows={isMobile ? 10 : 7}
              fullWidth
              autoFocus
              value={text}
              inputRef={textFieldRef}
              placeholder={"Lunch - 150 @food\nGrocery - 450\nTaxi - 80 @transport"}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onClick={(e) => setCursorPosition(e.target.selectionStart)}
              onSelect={(e) => setCursorPosition(e.target.selectionStart)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#FAFAF8",
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  fontSize: "0.85rem",
                  lineHeight: 1.75,
                  borderRadius: "8px",
                  color: "#1A1A2E",
                  "& fieldset": { borderColor: "#ECEAE4" },
                  "&:hover fieldset": { borderColor: "#C8C5BE" },
                  "&.Mui-focused fieldset": { borderColor: "#1A1A2E", borderWidth: "1.5px" },
                },
              }}
            />

            {/* Category popup */}
            <Popper
              open={showCategoryPopup && filteredCategories.length > 0}
              anchorEl={popupAnchorRef.current}
              placement="bottom-start"
              transition
              style={{ zIndex: 1400, width: 220 }}
              modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
            >
              {({ TransitionProps }) => (
                <Grow {...TransitionProps} timeout={180}>
                  <Paper
                    elevation={0}
                    sx={{
                      border: "1px solid #ECEAE4",
                      borderRadius: "10px",
                      overflow: "hidden",
                      bgcolor: "#fff",
                    }}
                  >
                    <ClickAwayListener onClickAway={() => setShowCategoryPopup(false)}>
                      <Box>
                        <Box sx={{ px: 1.5, py: 0.75, borderBottom: "1px solid #F2F0EB" }}>
                          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#bbb", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Categories
                          </Typography>
                        </Box>
                        <MenuList dense sx={{ py: 0.5 }}>
                          {filteredCategories.map((cat, index) => (
                            <MenuItem
                              key={cat.value}
                              onClick={() => handleCategorySelect(cat)}
                              selected={index === selectedCategoryIndex}
                              sx={{
                                borderRadius: "6px",
                                mx: 0.5,
                                px: 1,
                                py: 0.6,
                                minHeight: 0,
                                "&:hover": { bgcolor: `${cat.color}12` },
                                "&.Mui-selected": {
                                  bgcolor: `${cat.color}20`,
                                  "&:hover": { bgcolor: `${cat.color}28` },
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  color: cat.color,
                                  minWidth: 28,
                                  "& svg": { fontSize: "14px !important" },
                                }}
                              >
                                {cat.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={cat.label}
                                primaryTypographyProps={{
                                  fontSize: "0.78rem",
                                  fontWeight: 500,
                                  color: "#1A1A2E",
                                }}
                                secondary={`@${cat.value}`}
                                secondaryTypographyProps={{
                                  fontSize: "0.62rem",
                                  color: "#bbb",
                                  fontFamily: "monospace",
                                }}
                              />
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Box>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Box>

          {/* Hint */}
          <Typography sx={{ fontSize: "0.65rem", color: "#bbb", mt: 1 }}>
            {text.trim()
              ? `${lineCount} line${lineCount !== 1 ? "s" : ""} · leave empty to mark as no expense`
              : "Leave empty to mark this date as no expense"}
          </Typography>
        </Box>

        {/* ── Errors ── */}
        {errors.length > 0 && (
          <Box
            sx={{
              bgcolor: "#FCEBEB",
              border: "1px solid #F7C1C1",
              borderRadius: "10px",
              p: 1.5,
            }}
          >
            <Box display="flex" alignItems="center" gap={0.75} mb={0.75}>
              <WarningAmberRoundedIcon sx={{ fontSize: 15, color: "#E24B4A" }} />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#A32D2D" }}>
                {errors.length} formatting issue{errors.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
            {errors.slice(0, 3).map((e) => (
              <Typography key={e.line} sx={{ fontSize: "0.72rem", color: "#A32D2D", ml: 2.75 }}>
                Line {e.line}: {e.error}
              </Typography>
            ))}
            {errors.length > 3 && (
              <Typography sx={{ fontSize: "0.68rem", color: "#C44", ml: 2.75, mt: 0.25 }}>
                +{errors.length - 3} more…
              </Typography>
            )}
          </Box>
        )}

        {/* ── Total bar ── */}
        {total > 0 && (
          <Box
            sx={{
              bgcolor: "#1A1A2E",
              borderRadius: "10px",
              px: 2,
              py: 1.4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                Estimated total
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", mt: 0.1 }}>
                {lineCount} item{lineCount !== 1 ? "s" : ""}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: "Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 400,
                color: "#fff",
                letterSpacing: "-0.03em",
              }}
            >
              {total.toLocaleString()}
              <Typography component="span" sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", ml: 0.75 }}>
                BDT
              </Typography>
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* ── Mobile footer ── */}
      {isMobile && (
        <Box
          sx={{
            px: 2,
            py: 1.75,
            borderTop: "1px solid #ECEAE4",
            bgcolor: "#fff",
          }}
        >
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={errors.length > 0 || loading}
            sx={{
              bgcolor: "#1A1A2E",
              color: "#fff",
              textTransform: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
              borderRadius: "10px",
              py: 1.4,
              boxShadow: "none",
              "&:hover": { bgcolor: "#2E2E4A", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "#D0CEC8", color: "#fff" },
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : total > 0 ? (
              `Save · ${total.toLocaleString()} BDT`
            ) : (
              "Save (no expense)"
            )}
          </Button>
        </Box>
      )}
    </Dialog>
  );
}