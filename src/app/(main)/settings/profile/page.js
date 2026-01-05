"use client";

import { Typography } from "@mui/material";

export default function ProfilePage() {
  return (
    <>
      <Typography variant="h6" fontWeight={600} mb={1}>
        Profile
      </Typography>
      <Typography color="text.secondary">
        Manage your profile information.
      </Typography>
    </>
  );
}
