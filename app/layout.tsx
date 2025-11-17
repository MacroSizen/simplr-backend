export const metadata = {
  title: 'Simplr API',
  description: 'Backend API for Simplr Mobile App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

