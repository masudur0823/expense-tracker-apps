"use client";

import { Typography } from "@mui/material";

export default function TrashPage() {
  return (
    <>
      <Typography variant="h6" fontWeight={600} mb={1}>
        Trash
      </Typography>
      <Typography color="text.secondary">
        Deleted expenses will appear here.
      </Typography>
    </>
  );
}
