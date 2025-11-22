import React, { useState } from 'react';
import './EventsStream.css';

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
    isLoading?: boolean;
}

const EventsStream: React.FC<EventsStreamProps> = ({ events, onEventClick, isLoading }) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopyJson = (e: React.MouseEvent, event: Event) => {
        e.stopPropagation();
        navigator.clipboard.writeText(JSON.stringify(event, null, 2));
        setCopiedId(event.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleResolve = (e: React.MouseEvent, alertId: string) => {
        e.stopPropagation();
        if (onEventClick) onEventClick(alertId);
    };

    const getStatusClass = (action: string, details: any) => {
        if (action === 'STATUS_CHANGED') {
            if (details.to === 'ESCALATED') return 'escalated';
            if (details.to === 'RESOLVED') return 'resolved';
            if (details.to === 'AUTO_CLOSED') return 'auto_closed';
        }
        return '';
    };

    const getActionLabel = (event: Event) => {
        if (event.action === 'STATUS_CHANGED') {
            return (
                <>
                    Status changed to <span className={`status-pill ${event.details.to.toLowerCase()}`}>{event.details.to}</span>
                </>
            );
        }
        if (event.action === 'RULE_TRIGGERED') {
            return `Rule Triggered: ${event.details.rule || 'Unknown'}`;
        }
        return event.action;
    };

    return (
        <div className="events-stream">
            <h3>
                Recent Activity
                {!isLoading && <div className="live-indicator"><div className="spinner"></div> Live</div>}
            </h3>

            <ul className="events-list">
                {isLoading && events.length === 0 ? (
                    // Skeleton Loaders
                    Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="skeleton-row">
                            <div className="skeleton-line medium"></div>
                            <div className="skeleton-line short"></div>
                        </li>
                    ))
                ) : (
                    events.map((event) => {
                        const statusClass = getStatusClass(event.action, event.details);
                        const isTransition = event.action === 'STATUS_CHANGED' || event.action === 'RULE_TRIGGERED';

                        return (
                            <li
                                key={event.id}
                                className={`event-row ${isTransition ? 'accent-border' : ''} ${statusClass}`}
                                onClick={() => onEventClick && onEventClick(event.alertId)}
                            >
                                <div className="event-header">
                                    <span className="event-title">Alert {event.alertId.substring(0, 8)}</span>
                                    <span className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                </div>

                                <div className="event-meta">
                                    {getActionLabel(event)}
                                    {(event.details.to === 'RESOLVED' || event.details.to === 'AUTO_CLOSED') && (
                                        <span className="resolved-by">
                                            {event.details.to === 'AUTO_CLOSED' ? 'System' : 'User'}
                                        </span>
                                    )}
                                </div>

                                <div className="event-actor">
                                    {event.action === 'CREATED' && 'System generated'}
                                    {event.action === 'RULE_TRIGGERED' && `Threshold: ${event.details.threshold}`}
                                    {event.action === 'STATUS_CHANGED' && `Reason: ${event.details.reason || 'State transition'}`}
                                </div>

                                <div className="quick-actions">
                                    <button className="action-btn resolve" onClick={(e) => handleResolve(e, event.alertId)}>
                                        Resolve
                                    </button>
                                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); /* Add Note logic */ }}>
                                        Add Note
                                    </button>
                                    <button className="action-btn" onClick={(e) => handleCopyJson(e, event)}>
                                        {copiedId === event.id ? 'Copied!' : 'JSON'}
                                    </button>
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
};

export default EventsStream;
