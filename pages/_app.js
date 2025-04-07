import '../styles/globals.css';
import Head from 'next/head';
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from '../components/ToastContainer';
import { TeamProvider } from '../context/TeamContext';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <TeamProvider>
        <ToastProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>PromptPro - AI Prompt Management</title>
          </Head>
          <Component {...pageProps} />
        </ToastProvider>
      </TeamProvider>
    </SessionProvider>
  );
}

export default MyApp;
