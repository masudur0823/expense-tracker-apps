import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { IconButton, Tooltip } from "@mui/material";

export default function AddExpenseButton({ onClick }) {
  return (
    <Tooltip title="Add Expense">
      <IconButton color="primary" onClick={onClick}  sx={{ ml: "0 !important" }}>
        <AddCircleOutlineIcon fontSize="large" />
      </IconButton>
    </Tooltip>
  );
}
