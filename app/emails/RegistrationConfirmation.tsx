import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

export interface RegistrationConfirmationProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  qrCodeUrl: string;
}

export const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({
  userName,
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  qrCodeUrl,
}) => {
  return (
    <EmailLayout previewText={`Your registration for ${eventName} is confirmed!`}>
      <h1>Registration Confirmed!</h1>
      <p>Hello {userName || 'there'},</p>
      
      <p>Your registration for <strong>{eventName}</strong> has been confirmed. We're excited to have you join us!</p>
      
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
      
      <h3>Your Ticket</h3>
      <p>Please show this QR code at the event check-in:</p>
      
      <div className="qr-code">
        <img src={qrCodeUrl} alt="Registration QR Code" />
      </div>
      
      <p>Add this event to your calendar:</p>
      <p>
        <a 
          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventName)}&dates=${eventDate.replace(/-/g, '')}/${eventDate.replace(/-/g, '')}&details=Your registration for ${encodeURIComponent(eventName)} is confirmed!&location=${encodeURIComponent(eventLocation)}`}
          className="button"
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Google Calendar
        </a>
      </p>
      
      <p>We look forward to seeing you there!</p>
      
      <p>Best regards,<br />The CampusHub Team</p>
    </EmailLayout>
  );
};

export default RegistrationConfirmation;
