"use client";

import { Typography } from "@mui/material";

export default function PreferencesPage() {
  return (
    <>
      <Typography variant="h6" fontWeight={600} mb={1}>
        Preferences
      </Typography>
      <Typography color="text.secondary">
        App preferences and behavior.
      </Typography>
    </>
  );
}
