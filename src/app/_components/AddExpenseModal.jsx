"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  useMediaQuery,
  Slide,
  Paper,
  Alert,
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import TapasIcon from "@mui/icons-material/Tapas";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BusinessIcon from "@mui/icons-material/Business";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HomeIcon from "@mui/icons-material/Home";
import SpaIcon from "@mui/icons-material/Spa";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import SchoolIcon from "@mui/icons-material/School";
import CategoryIcon from "@mui/icons-material/Category";
import { useTheme } from "@mui/material/styles";
import { parseExpenses } from "./expense/utils";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const CATEGORIES = [
  {
    value: "food",
    label: "Food & Dining",
    color: "#FF6B6B",
    icon: <RestaurantIcon />,
  },
  {
    value: "snacks",
    label: "Snacks",
    color: "#416b1a",
    icon: <TapasIcon />,
  },
  {
    value: "transport",
    label: "Transportation",
    color: "#4ECDC4",
    icon: <DirectionsCarIcon />,
  },
  {
    value: "office",
    label: "Office",
    color: "#0c3342",
    icon: <BusinessIcon />,
  },
  {
    value: "health",
    label: "Health & Medical",
    color: "#EF476F",
    icon: <MedicalServicesIcon />,
  },
  {
    value: "shopping",
    label: "Shopping",
    color: "#FFD166",
    icon: <ShoppingCartIcon />,
  },
  {
    value: "bills",
    label: "Bills & Utilities",
    color: "#118AB2",
    icon: <ReceiptIcon />,
  },
  {
    value: "bari",
    label: "Kazi Bari",
    color: "#1d5a4a",
    icon: <HomeIcon />,
  },
  {
    value: "care",
    label: "Personal Care",
    color: "#01467e",
    icon: <SpaIcon />,
  },
  {
    value: "entertainment",
    label: "Entertainment",
    color: "#06D6A0",
    icon: <LocalActivityIcon />,
  },
  {
    value: "education",
    label: "Education",
    color: "#7209B7",
    icon: <SchoolIcon />,
  },
  { value: "other", label: "Other", color: "#6C757D", icon: <CategoryIcon /> },
];

const Transition = (props) => <Slide direction="up" {...props} />;

export default function AddExpenseModal({ open, onClose }) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(dayjs());
  
  // Category popup state
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

  // Handle text selection and @ detection
  const handleTextChange = (e) => {
    const newText = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    
    // Check if we should show category popup
    const textBeforeCursor = newText.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if we're in the middle of typing a category after @
      const afterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Don't show popup if there's a space after @ (unless it's part of category name)
      if (afterAt.includes(' ') && !afterAt.includes('@')) {
        setShowCategoryPopup(false);
      } else {
        // Filter categories based on what's typed after @
        const searchTerm = afterAt.toLowerCase();
        const filtered = CATEGORIES.filter(cat => 
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

  // Handle category selection
  const handleCategorySelect = (category) => {
    const beforeAt = text.substring(0, cursorPosition);
    const afterAt = text.substring(cursorPosition);
    
    // Find where @ is and replace everything after it until space or end with category
    const lastAtIndex = beforeAt.lastIndexOf('@');
    const newText = text.substring(0, lastAtIndex) + '@' + category.value + ' ' + afterAt;
    
    setText(newText);
    setShowCategoryPopup(false);
    
    // Focus back on text field after selection
    if (textFieldRef.current) {
      const newCursorPos = lastAtIndex + category.value.length + 2; // +2 for @ and space
      textFieldRef.current.focus();
      textFieldRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
    
    handleChange(newText);
  };

  // Handle keyboard navigation in category popup
  const handleKeyDown = (e) => {
    if (showCategoryPopup) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedCategoryIndex((prev) => 
            prev < filteredCategories.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedCategoryIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCategories.length > 0) {
            handleCategorySelect(filteredCategories[selectedCategoryIndex]);
          }
          break;
        case 'Escape':
          setShowCategoryPopup(false);
          break;
      }
    }
  };

  // Close popup when clicking outside
  const handleClickAway = () => {
    setShowCategoryPopup(false);
  };

  const handleSubmit = async () => {
    const { expenses, errors: parseErrors } = parseExpenses(text);

    if (parseErrors.length > 0) return;

    const payload =
      expenses.length === 0
        ? {
            date: date.format("YYYY-MM-DD"),
            expensesName: "No Expense",
            amount: 0,
          }
        : {
            expenses: expenses.map((exp) => ({
              ...exp,
              date: date.format("YYYY-MM-DD"),
            })),
          };

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 3, bgcolor: "#fcfcfc" },
      }}
    >
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onClose}
            size="small"
            sx={{ mr: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
            Quick Add Expenses
          </Typography>
          {!isMobile && (
            <Button
              variant="contained"
              disableElevation
              onClick={handleSubmit}
              disabled={errors.length > 0 || loading}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save"
              )}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <DialogContent sx={{ p: isMobile ? 2 : 4 }}>
        <Stack spacing={3}>
          {/* Date Picker Section */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              TRANSACTION DATE
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={date}
                format="DD-MM-YYYY"
                onChange={(newValue) => setDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: { bgcolor: "white" },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Input Section with Category Popup */}
          <Box ref={popupAnchorRef}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
              >
                EXPENSE DETAILS
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ color: "primary.main", cursor: "pointer" }}
              >
                <HelpOutlineIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" fontWeight={600}>
                  Format Guide
                </Typography>
              </Box>
            </Box>

            <Box sx={{ position: "relative" }}>
              <TextField
                multiline
                rows={isMobile ? 12 : 8}
                fullWidth
                autoFocus
                value={text}
                inputRef={textFieldRef}
                placeholder={`Example:\nLunch at Subway - 15\nGrocery - 45.50\nTaxi - 10\n\nTip: Type @ to add category`}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onClick={(e) => {
                  setCursorPosition(e.target.selectionStart);
                }}
                onSelect={(e) => {
                  setCursorPosition(e.target.selectionStart);
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "white",
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                    borderRadius: 2,
                  },
                }}
              />
              
              {/* Category Popup */}
              <Popper
                open={showCategoryPopup && filteredCategories.length > 0}
                anchorEl={popupAnchorRef.current}
                placement="bottom-start"
                transition
                style={{ zIndex: 1300, width: 250 }}
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 8],
                    },
                  },
                ]}
              >
                {({ TransitionProps }) => (
                  <Grow {...TransitionProps} timeout={350}>
                    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <ClickAwayListener onClickAway={handleClickAway}>
                        <MenuList>
                          {filteredCategories.map((category, index) => (
                            <MenuItem
                              key={category.value}
                              onClick={() => handleCategorySelect(category)}
                              selected={index === selectedCategoryIndex}
                              sx={{
                                '&:hover': {
                                  bgcolor: `${category.color}15`,
                                },
                                '&.Mui-selected': {
                                  bgcolor: `${category.color}25`,
                                  '&:hover': {
                                    bgcolor: `${category.color}35`,
                                  },
                                },
                              }}
                            >
                              <ListItemIcon sx={{ color: category.color, minWidth: 36 }}>
                                {category.icon}
                              </ListItemIcon>
                              <ListItemText primary={category.label} />
                            </MenuItem>
                          ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Leave empty and save to mark this date as “No Expense”
            </Typography>
          </Box>

          {/* Error Display */}
          {errors.length > 0 && (
            <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="caption" fontWeight={600}>
                Please fix {errors.length} formatting issues:
              </Typography>
              {errors.slice(0, 3).map((e) => (
                <Typography key={e.line} variant="caption" display="block">
                  • Line {e.line}: {e.error}
                </Typography>
              ))}
            </Alert>
          )}

          {/* Total Preview Paper */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              bgcolor: "primary.dark",
              color: "primary.contrastText",
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Estimated Total
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}tk
            </Typography>
          </Paper>
        </Stack>
      </DialogContent>

      {/* Mobile Action */}
      {isMobile && (
        <Box p={2} borderTop="1px solid" borderColor="divider" bgcolor="white">
          <Button
            fullWidth
            size="large"
            variant="contained"
            disableElevation
            onClick={handleSubmit}
            disabled={errors.length > 0 || loading}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={26} color="inherit" />
            ) : total > 0 ? (
              `Save ${total}tk`
            ) : (
              "Save (No Expense)"
            )}
          </Button>
        </Box>
      )}
    </Dialog>
  );
}