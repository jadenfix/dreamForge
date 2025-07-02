import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        {/* Preconnect for Google Fonts if you add any later */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body className="bg-white text-gray-900 dark:bg-black dark:text-gray-200 antialiased selection:bg-fuchsia-500/80 selection:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 