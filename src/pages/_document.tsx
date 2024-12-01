import { Html, Head, Main, NextScript } from "next/document";
export default function Document() {
    const isProd = process.env.API_BASE_URL?.includes("dev")
      ? false
      : process.env.API_BASE_URL?.includes("stg")
        ? false
        : true;
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com"/>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="Admin Service of MSQ Pay" />
        {
          // Load the script from RelicScript.js only in production
          isProd && (
            <script src="/RelicScript.js" async></script>
          )
        }
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
