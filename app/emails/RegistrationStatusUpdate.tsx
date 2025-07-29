import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

export interface RegistrationStatusUpdateProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  status: string;
}

export const RegistrationStatusUpdate: React.FC<RegistrationStatusUpdateProps> = ({
  userName,
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  status,
}) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'CONFIRMED':
        return 'Your registration has been confirmed!';
      case 'WAITLISTED':
        return 'You have been added to the waitlist.';
      case 'CANCELLED':
        return 'Your registration has been cancelled.';
      case 'REJECTED':
        return 'Your registration has been rejected.';
      default:
        return `Your registration status has been updated to: ${status}`;
    }
  };

  const getActionMessage = () => {
    switch (status) {
      case 'CONFIRMED':
        return 'Your spot is confirmed! We look forward to seeing you at the event.';
      case 'WAITLISTED':
        return 'If a spot becomes available, we will notify you immediately. In the meantime, please keep an eye on your email.';
      case 'CANCELLED':
        return 'If this was a mistake or you have any questions, please contact the event organizer.';
      case 'REJECTED':
        return 'If you believe this was a mistake, please contact the event organizer for assistance.';
      default:
        return 'If you have any questions, please contact the event organizer.';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'WAITLISTED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  return (
    <EmailLayout previewText={`Update: Your registration status for ${eventName} has changed`}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-block', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
          {getStatusIcon()}
        </div>
      </div>
      
      <h1 style={{ textAlign: 'center', marginBottom: '16px' }}>
        {status === 'CONFIRMED' ? 'Registration Confirmed!' : 'Registration Update'}
      </h1>
      
      <p>Hello {userName || 'there'},</p>
      
      <div style={{
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderLeft: '4px solid #10B981',
        padding: '16px',
        margin: '16px 0',
        borderRadius: '0 4px 4px 0',
      }}>
        <p style={{ margin: '0', fontWeight: '500' }}>{getStatusMessage()}</p>
      </div>
      
      <p>{getActionMessage()}</p>
      
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
      
      {status === 'CONFIRMED' && (
        <div style={{ margin: '24px 0', textAlign: 'center' }}>
          <a 
            href={`${process.env.NEXT_PUBLIC_APP_URL}/events/${eventName.toLowerCase().replace(/\s+/g, '-')}`}
            className="button"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500',
            }}
          >
            View Event Details
          </a>
        </div>
      )}
      
      <p>
        If you have any questions about your registration, please don't hesitate to 
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

export default RegistrationStatusUpdate;
