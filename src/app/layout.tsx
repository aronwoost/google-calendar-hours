import type { Metadata } from 'next';
import Script from 'next/script';

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
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-4BZFZ94R2D" />
      <Script>
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        gtag('js', new Date());
    
        gtag('config', 'G-4BZFZ94R2D');
        `}
      </Script>
      <Script>
        {`
        var _gaq = [
          ['_setAccount', 'UA-344954-14'],
          ['_trackPageview'],
          ['_trackPageLoadTime'],
        ];
        (function (d, t) {
          var g = d.createElement(t),
            s = d.getElementsByTagName(t)[0];
          g.src =
            ('https:' == location.protocol ? '//ssl' : '//www') +
            '.google-analytics.com/ga.js';
          s.parentNode.insertBefore(g, s);
        })(document, 'script');
        `}
      </Script>
      <Script
        src="https://js.sentry-cdn.com/72dc5f435c6c4bf8a7c455a11ad94e89.min.js"
        crossOrigin="anonymous"
      />
    </html>
  );
}
