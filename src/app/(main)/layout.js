import "@/app/globals.css";
import Header from "../_components/Header";

export const metadata = {
  title: "Expense Tracker",
  description: "Daily Expense Tracker Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <Header />
        {children}
      </body>
    </html>
  );
}
