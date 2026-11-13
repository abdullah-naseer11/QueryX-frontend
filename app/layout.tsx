import "./globals.css";
export const metadata = {
  title: "QueryX AI — Autonomous Database Intelligence",
  description: "A new command experience for intelligent database operations."
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
