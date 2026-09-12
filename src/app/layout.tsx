import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Domain Hunter · Absolute Asia Travel',
  description: 'Bản đồ săn tên miền du lịch cao cấp và theo dõi rụng tên miền tự động',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
