/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import App from 'next/app';

// Global styles (if needed)
import '../styles/globals.css';

function MyApp({ Component, pageProps }: any) {
  useEffect(() => {
    // Initialize any global configurations
    console.log('AI Bro Backend initialized');
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;