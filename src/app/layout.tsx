import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google Calendar Hours',
  description: '',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta property="version" content={process.env.commit} />
      <body>{children}</body>
    </html>
  );
}
