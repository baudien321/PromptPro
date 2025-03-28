import '../styles/globals.css';
import Head from 'next/head';
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from '../components/ToastContainer';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>PromptPro - AI Prompt Management</title>
        </Head>
        <Component {...pageProps} />
      </ToastProvider>
    </SessionProvider>
  );
}

export default MyApp;
