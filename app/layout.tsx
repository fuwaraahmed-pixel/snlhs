import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল | Shahera Nayeb Laboratory High School',
  description: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল - শিক্ষা, শৃঙ্খলা ও চরিত্র গঠনের বিশ্বস্ত প্রতিষ্ঠান।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>
        {children}
      </body>
    </html>
  );
}
