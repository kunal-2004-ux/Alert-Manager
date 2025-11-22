import React from 'react';

interface Event {
    id: string;
    action: string;
    details: any;
    timestamp: string;
    alertId: string;
}

interface EventsStreamProps {
    events: Event[];
    onEventClick?: (alertId: string) => void;
}

const EventsStream: React.FC<EventsStreamProps> = ({ events, onEventClick }) => {
    return (
        <div className="events-stream">
            <h3>Recent Activity</h3>
            <ul className="events-list">
                {events.map((event) => (
                    <li
                        key={event.id}
                        className="event-item"
                        onClick={() => onEventClick && onEventClick(event.alertId)}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
                        <span className="event-action">{event.action}</span>
                        <span className="event-details">
                            Alert {event.alertId.substring(0, 8)}...
                            {event.details && ` - ${JSON.stringify(event.details)}`}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventsStream;
