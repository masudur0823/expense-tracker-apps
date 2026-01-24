import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import SchoolIcon from "@mui/icons-material/School";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from '@mui/icons-material/Business';
import TapasIcon from '@mui/icons-material/Tapas';

const CATEGORIES = [
  {
    value: "food",
    label: "Food & Dining",
    color: "#FF6B6B",
    icon: <RestaurantIcon />,
  },
  {
    value: "snacks",
    label: "Snacks",
    color: "#416b1a",
    icon: <TapasIcon />,
  },
  {
    value: "office",
    label: "Office",
    color: "#0c3342",
    icon: <BusinessIcon />,
  },
  {
    value: "transport",
    label: "Transportation",
    color: "#4ECDC4",
    icon: <DirectionsCarIcon />,
  },
  {
    value: "shopping",
    label: "Shopping",
    color: "#FFD166",
    icon: <ShoppingCartIcon />,
  },
  {
    value: "entertainment",
    label: "Entertainment",
    color: "#06D6A0",
    icon: <LocalActivityIcon />,
  },
  {
    value: "bills",
    label: "Bills & Utilities",
    color: "#118AB2",
    icon: <ReceiptIcon />,
  },
  {
    value: "health",
    label: "Health & Medical",
    color: "#EF476F",
    icon: <MedicalServicesIcon />,
  },
  {
    value: "education",
    label: "Education",
    color: "#7209B7",
    icon: <SchoolIcon />,
  },
  { value: "other", label: "Other", color: "#6C757D", icon: <CategoryIcon /> },
];

export default CATEGORIES;