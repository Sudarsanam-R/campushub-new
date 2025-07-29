import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

export interface RegistrationCancellationProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  cancellationReason?: string;
}

export const RegistrationCancellation: React.FC<RegistrationCancellationProps> = ({
  userName,
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  cancellationReason,
}) => {
  return (
    <EmailLayout previewText={`Your registration for ${eventName} has been cancelled`}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ 
          display: 'inline-block', 
          padding: '16px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)' 
        }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#EF4444" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
      </div>
      
      <h1 style={{ textAlign: 'center', marginBottom: '16px' }}>Registration Cancelled</h1>
      
      <p>Hello {userName || 'there'},</p>
      
      <p>
        Your registration for <strong>{eventName}</strong> has been cancelled. 
        {cancellationReason ? (
          <span> The reason provided: <em>{cancellationReason}</em></span>
        ) : null}
      </p>
      
      <div className="event-card">
        <h2 className="event-title">{eventName}</h2>
        
        <div className="event-detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {eventDate}
        </div>
        
        <div className="event-detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {eventTime}
        </div>
        
        <div className="event-detail">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {eventLocation || 'Location to be announced'}
        </div>
      </div>
      
      {!cancellationReason && (
        <div style={{
          backgroundColor: 'rgba(254, 243, 199, 0.5)',
          borderLeft: '4px solid #F59E0B',
          padding: '16px',
          margin: '16px 0',
          borderRadius: '0 4px 4px 0',
        }}>
          <p style={{ margin: '0' }}>
            <strong>Note:</strong> If you didn't request this cancellation or believe it was made in error, 
            please contact the event organizer as soon as possible.
          </p>
        </div>
      )}
      
      <p>
        We're sorry to see you go! If you'd like to register for future events, please visit our 
        <a 
          href={`${process.env.NEXT_PUBLIC_APP_URL}/events`}
          style={{ color: '#4f46e5', textDecoration: 'none' }}
        >
          {' '}events page
        </a>.
      </p>
      
      <p>
        If you have any questions about this cancellation, please 
        <a 
          href={`mailto:${process.env.SUPPORT_EMAIL || 'support@campushub.app'}`}
          style={{ color: '#4f46e5', textDecoration: 'none' }}
        >
          {' '}contact our support team
        </a>.
      </p>
      
      <p>Best regards,<br />The CampusHub Team</p>
    </EmailLayout>
  );
};

export default RegistrationCancellation;
