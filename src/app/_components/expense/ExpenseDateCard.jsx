"use client";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Stack,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@mui/material/IconButton";
import dayjs from "dayjs";

export default function ExpenseDateCard({ data, onDelete }) {
  // Format the date to look more professional (e.g., "Wed, Oct 25, 2023")
  const formattedDate = dayjs(data.date).format("ddd, MMM D, YYYY");

  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 3, 
        border: "1px solid", 
        borderColor: "divider",
        transition: "0.2s",
        "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }
      }}
    >
      <Box sx={{ bgcolor: "grey.50", px: 3, py: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
          {formattedDate}
        </Typography>
      </Box>

      <CardContent sx={{ px: 3, pt: 1 }}>
        <Stack spacing={1}>
          {data.items.map((item, index) => (
            <Box
              key={item.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                group: "true",
                py: 1,
                // Add a divider between items but not after the last one
                borderBottom: index !== data.items.length - 1 ? "1px dashed" : "none",
                borderColor: "grey.100",
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {item.expenseName}
                </Typography>
                {/* <Typography variant="caption" color="text.secondary">
                  {item.category || "General"}
                </Typography> */}
              </Box>

              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body1" fontWeight={600} color="text.primary">
                  {item.amount.toLocaleString()}tk
                </Typography>
                
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    onClick={() => onDelete(item)}
                    sx={{ 
                      color: "text.disabled", 
                      "&:hover": { color: "error.main", bgcolor: "error.lighter" } 
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2, borderStyle: "solid" }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            DAILY TOTAL
          </Typography>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            {data.total.toLocaleString()}tk
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}