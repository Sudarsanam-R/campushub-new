import React, { useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './storybook-embed.module.css';

// This component will only be rendered in the browser
const StorybookEmbed = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { siteConfig } = useDocusaurusContext();
  
  useEffect(() => {
    // Handle messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      // Verify the origin if needed
      // if (event.origin !== 'http://localhost:6006') return;
      
      if (event.data.type === 'set-iframe-height') {
        if (iframeRef.current) {
          iframeRef.current.style.height = `${event.data.height}px`;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <Layout title="Storybook" description="Interactive component playground">
      <div className={styles.container}>
        <BrowserOnly>
          {() => (
            <iframe
              ref={iframeRef}
              src="http://localhost:6006/"
              title="Storybook"
              className={styles.iframe}
              style={{
                width: '100%',
                minHeight: '100vh',
                border: 'none',
              }}
            />
          )}
        </BrowserOnly>
      </div>
    </Layout>
  );
};

export default StorybookEmbed;
