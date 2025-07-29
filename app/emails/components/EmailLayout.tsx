import * as React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  children,
  previewText,
}) => {
  return (
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CampusHub</title>
        {previewText && (
          <meta name="description" content={previewText} />
        )}
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.5;
              color: #1a202c;
              background-color: #f7fafc;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 24px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 16px;
              border-bottom: 1px solid #e2e8f0;
              margin-bottom: 24px;
            }
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: #4f46e5;
              text-decoration: none;
            }
            .content {
              margin-bottom: 24px;
            }
            .footer {
              text-align: center;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
              color: #718096;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4f46e5;
              color: #ffffff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 500;
            }
            .event-card {
              background-color: #f8fafc;
              border-radius: 6px;
              padding: 16px;
              margin: 16px 0;
              border-left: 4px solid #4f46e5;
            }
            .event-title {
              font-size: 18px;
              font-weight: 600;
              margin: 0 0 8px 0;
            }
            .event-detail {
              margin: 4px 0;
              display: flex;
              align-items: center;
            }
            .event-detail svg {
              margin-right: 8px;
              color: #64748b;
            }
            .qr-code {
              text-align: center;
              margin: 24px 0;
            }
            .qr-code img {
              max-width: 200px;
              height: auto;
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <a href={process.env.NEXT_PUBLIC_APP_URL} className="logo">
              CampusHub
            </a>
          </div>
          <div className="content">
            {children}
          </div>
          <div className="footer">
            <p>© {new Date().getFullYear()} CampusHub. All rights reserved.</p>
            <p>
              <a 
                href={`${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`}
                style={{ color: '#64748b', textDecoration: 'underline' }}
              >
                Manage email preferences
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default EmailLayout;
