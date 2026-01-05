"use client";

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonIcon from "@mui/icons-material/Person";
import TuneIcon from "@mui/icons-material/Tune";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <List>
      <ListItemButton onClick={() => router.push("/settings/profile")}>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItemButton>

      <Divider />

      <ListItemButton onClick={() => router.push("/settings/trash")}>
        <ListItemIcon>
          <DeleteOutlineIcon />
        </ListItemIcon>
        <ListItemText primary="Trash" />
      </ListItemButton>

      <Divider />

      <ListItemButton onClick={() => router.push("/settings/preferences")}>
        <ListItemIcon>
          <TuneIcon />
        </ListItemIcon>
        <ListItemText primary="Preferences" />
      </ListItemButton>
    </List>
  );
}
