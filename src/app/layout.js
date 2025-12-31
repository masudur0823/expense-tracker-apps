import "./globals.css";

export const metadata = {
  title: "Expense Tracker",
  description: "Daily Expense Tracker Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        {children}
      </body>
    </html>
  );
}
