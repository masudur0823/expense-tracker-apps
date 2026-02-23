"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        bgcolor: "background.default",
      }}
    >
      <CircularProgress size={48} thickness={4} />

      <Typography
        variant="subtitle1"
        color="text.secondary"
        fontWeight={500}
      >
        Loading, please wait…
      </Typography>
    </Box>
  );
}
