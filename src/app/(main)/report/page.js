"use client";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import ExpenseReport from "@/app/_components/report/ExpenseReport";

function Report() {
  const router = useRouter();
  return (
    <>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          Report
        </Typography>
      </Box>
      <ExpenseReport />
    </>
  );
}

export default Report;
