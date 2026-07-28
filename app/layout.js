export const metadata = {
  title: "Panel Jadwal Pertandingan",
  description: "Generate jadwal pertandingan otomatis dari API-Football",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
