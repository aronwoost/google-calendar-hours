import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google Calendar Hours',
  description: '',
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
