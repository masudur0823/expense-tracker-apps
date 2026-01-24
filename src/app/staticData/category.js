import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import SchoolIcon from "@mui/icons-material/School";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import TapasIcon from "@mui/icons-material/Tapas";
import HomeIcon from '@mui/icons-material/Home';
import SpaIcon from '@mui/icons-material/Spa';

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
    value: "transport",
    label: "Transportation",
    color: "#4ECDC4",
    icon: <DirectionsCarIcon />,
  },
  {
    value: "office",
    label: "Office",
    color: "#0c3342",
    icon: <BusinessIcon />,
  },

  {
    value: "health",
    label: "Health & Medical",
    color: "#EF476F",
    icon: <MedicalServicesIcon />,
  },
  {
    value: "shopping",
    label: "Shopping",
    color: "#FFD166",
    icon: <ShoppingCartIcon />,
  },
  
  {
    value: "bills",
    label: "Bills & Utilities",
    color: "#118AB2",
    icon: <ReceiptIcon />,
  },
  {
    value: "bari",
    label: "Kazi Bari",
    color: "#1d5a4a",
    icon: <HomeIcon />,
  },

  {
    value: "care",
    label: "Personal Care",
    color: "#01467e",
    icon: <SpaIcon />,
  },

  {
    value: "entertainment",
    label: "Entertainment",
    color: "#06D6A0",
    icon: <LocalActivityIcon />,
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
