"use client";
import { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useTheme } from "@mui/material/styles";
import { parseExpenses } from "./expense/utils";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const Transition = (props) => <Slide direction="up" {...props} />;

export default function AddExpenseModal({ open, onClose }) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(dayjs());

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (value) => {
    setText(value);
    const { errors, totalAmount } = parseExpenses(value);
    setErrors(errors);
    setTotal(totalAmount);
  };

  const handleSubmit = async () => {
    const { expenses, errors: parseErrors } = parseExpenses(text);
    if (parseErrors.length > 0 || expenses.length === 0) return;

    const expensesWithDate = expenses.map((exp) => ({
      ...exp,
      date: date.format("YYYY-MM-DD"),
    }));

    try {
      setLoading(true);
      await axios.post("/api/expense", { expenses: expensesWithDate });
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
          color: "text.primary" 
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={onClose} size="small" sx={{ mr: 1 }}>
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
              disabled={errors.length > 0 || loading || !text.trim()}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <DialogContent sx={{ p: isMobile ? 2 : 4 }}>
        <Stack spacing={3}>
          {/* Date Picker Section */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
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
                        sx: { bgcolor: 'white' }
                    } 
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Input Section */}
          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                EXPENSE DETAILS
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'primary.main', cursor: 'pointer' }}>
                <HelpOutlineIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" fontWeight={600}>Format Guide</Typography>
              </Box>
            </Box>
            
            <TextField
              multiline
              rows={isMobile ? 12 : 8}
              fullWidth
              autoFocus
              value={text}
              placeholder={`Example:\nLunch at Subway - 15\nGrocery - 45.50\nTaxi - 10`}
              onChange={(e) => handleChange(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  borderRadius: 2
                }
              }}
            />
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
              p: 2, 
              bgcolor: 'primary.dark', 
              color: 'primary.contrastText', 
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Estimated Total</Typography>
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
            disabled={errors.length > 0 || loading || !text.trim()}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : `Save $${total}`}
          </Button>
        </Box>
      )}
    </Dialog>
  );
}