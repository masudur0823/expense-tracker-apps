"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { SketchPicker } from "react-color";

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    value: "",
    label: "",
    color: "#1976d2",
    icon: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      showSnackbar("Error fetching categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (mode, category = null) => {
    setDialogMode(mode);
    if (mode === "edit" && category) {
      setSelectedCategory(category);
      setFormData({
        value: category.value,
        label: category.label,
        color: category.color,
        icon: category.icon,
        isActive: category.isActive,
      });
    } else {
      setFormData({
        value: "",
        label: "",
        color: "#1976d2",
        icon: "",
        isActive: true,
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    setFormData({
      value: "",
      label: "",
      color: "#1976d2",
      icon: "",
      isActive: true,
    });
    setShowColorPicker(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === "isActive" ? checked : value,
    });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleColorChange = (color) => {
    setFormData({ ...formData, color: color.hex });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.value.trim()) {
      errors.value = "Value is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.value)) {
      errors.value = "Value can only contain lowercase letters, numbers, and hyphens";
    }
    if (!formData.label.trim()) {
      errors.label = "Label is required";
    }
    if (!formData.color) {
      errors.color = "Color is required";
    } else if (!/^#([0-9A-Fa-f]{6})$/.test(formData.color)) {
      errors.color = "Invalid color format";
    }
    if (!formData.icon.trim()) {
      errors.icon = "Icon name is required";
    }
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const url = dialogMode === "add" 
        ? "/api/categories" 
        : `/api/categories/${selectedCategory._id}`;
      const method = dialogMode === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save category");
      }

      showSnackbar(
        `Category ${dialogMode === "add" ? "added" : "updated"} successfully`
      );
      fetchCategories();
      handleCloseDialog();
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${categoryToDelete._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete category");
      }

      showSnackbar("Category deleted successfully");
      fetchCategories();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Available Material-UI icons (you can expand this list)
  const availableIcons = [
    "Work",
    "Home",
    "School",
    "ShoppingCart",
    "Restaurant",
    "DirectionsRun",
    "Movie",
    "MusicNote",
    "Flight",
    "Hotel",
    "LocalHospital",
    "SportsEsports",
  ];

  if (loading && categories.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Category Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("add")}
        >
          Add Category
        </Button>
      </Box>

      {/* Categories Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Value</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Icon</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>{category.value}</TableCell>
                <TableCell>{category.label}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: category.color,
                        borderRadius: 1,
                      }}
                    />
                    {category.color}
                  </Box>
                </TableCell>
                <TableCell>{category.icon}</TableCell>
                <TableCell>
                  <Chip
                    label={category.isActive ? "Active" : "Inactive"}
                    color={category.isActive ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog("edit", category)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(category)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === "add" ? "Add New Category" : "Edit Category"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="value"
              label="Value"
              value={formData.value}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.value}
              helperText={formErrors.value || "Lowercase letters, numbers, and hyphens only"}
              disabled={dialogMode === "edit"} // Value shouldn't be editable in edit mode
            />
            <TextField
              name="label"
              label="Label"
              value={formData.label}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.label}
              helperText={formErrors.label}
            />
            
            {/* Color Picker */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Color
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: formData.color,
                    borderRadius: 1,
                    cursor: "pointer",
                    border: "2px solid #ddd",
                  }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <TextField
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  size="small"
                  error={!!formErrors.color}
                  helperText={formErrors.color}
                />
              </Box>
              {showColorPicker && (
                <Box sx={{ mt: 2, position: "relative" }}>
                  <Box
                    sx={{
                      position: "absolute",
                      zIndex: 2,
                    }}
                  >
                    <Box
                      sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                      onClick={() => setShowColorPicker(false)}
                    />
                    <SketchPicker
                      color={formData.color}
                      onChange={handleColorChange}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Icon Selection */}
            <TextField
              name="icon"
              label="Icon Name"
              value={formData.icon}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.icon}
              helperText={formErrors.icon || "Enter Material-UI icon name (e.g., Work, Home)"}
            />
            
            {/* Icon Suggestions */}
            <Box>
              <Typography variant="caption" color="textSecondary" gutterBottom>
                Suggested Icons:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {availableIcons.map((icon) => (
                  <Chip
                    key={icon}
                    label={icon}
                    size="small"
                    onClick={() => setFormData({ ...formData, icon })}
                    color={formData.icon === icon ? "primary" : "default"}
                    variant={formData.icon === icon ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {dialogMode === "add" ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot; {categoryToDelete?.label} &quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CategoryManagement;