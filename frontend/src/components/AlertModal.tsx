import React, { useState } from 'react';
import './AlertModal.css';

interface AlertModalProps {
    alert: any;
    onClose: () => void;
    onResolve: (id: string, comment?: string) => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ alert, onClose, onResolve }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!alert) return null;

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return '#e74c3c';
            case 'warning': return '#f39c12';
            case 'info': return '#3498db';
            default: return '#95a5a6';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return '#f39c12';
            case 'ESCALATED': return '#e74c3c';
            case 'AUTO_CLOSED': return '#27ae60';
            case 'RESOLVED': return '#95a5a6';
            default: return '#95a5a6';
        }
    };

    const handleResolve = async () => {
        setLoading(true);
        try {
            await onResolve(alert.id, comment || undefined);
            setShowConfirm(false);
            setComment('');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-enhanced" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                {/* Header */}
                <div className="modal-header-enhanced">
                    <div>
                        <h2>Alert Details</h2>
                        <div className="alert-id-section">
                            <span className="alert-id">{alert.id.substring(0, 8)}...</span>
                            <button
                                className="copy-btn"
                                onClick={() => copyToClipboard(alert.id)}
                                title="Copy Alert ID"
                            >
                                📋
                            </button>
                        </div>
                    </div>
                    <div className="header-badges">
                        <span
                            className="severity-badge"
                            style={{ backgroundColor: getSeverityColor(alert.severity) }}
                        >
                            {alert.severity}
                        </span>
                        <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(alert.status) }}
                        >
                            {alert.status}
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="modal-content-enhanced">
                    {/* Left Column */}
                    <div className="left-column">
                        <div className="info-section">
                            <h3>Primary Information</h3>
                            <div className="info-row">
                                <span className="label">Driver ID:</span>
                                <span className="value">{alert.driverId || alert.metadata?.driverId || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Source Type:</span>
                                <span className="value">{alert.sourceType}</span>
                            </div>
                            {alert.category && (
                                <div className="info-row">
                                    <span className="label">Category:</span>
                                    <span className="value">{alert.category}</span>
                                </div>
                            )}
                            <div className="info-row">
                                <span className="label">Timestamp:</span>
                                <span className="value">{new Date(alert.timestamp).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="metadata-section">
                            <h3>Metadata</h3>
                            <div className="metadata-grid">
                                {Object.entries(alert.metadata || {}).map(([key, value]) => (
                                    <div key={key} className="metadata-item">
                                        <span className="metadata-key">{key}:</span>
                                        <span className="metadata-value">
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="right-column">
                        {/* Event Count & Rule Info */}
                        {(alert.eventCount > 0 || alert.ruleTriggered) && (
                            <div className="rule-section">
                                <h3>Rule Information</h3>
                                {alert.eventCount > 0 && (
                                    <div className="event-count">
                                        <span className="count-badge">{alert.eventCount}</span>
                                        <span>events in rule window</span>
                                    </div>
                                )}
                                {alert.ruleTriggered && (
                                    <div className="rule-details">
                                        <p><strong>Rule:</strong> {alert.ruleTriggered.id}</p>
                                        <p className="rule-description">{alert.ruleTriggered.description}</p>
                                        <div className="rule-params">
                                            <span>Count: {alert.ruleTriggered.params.count}</span>
                                            <span>Window: {alert.ruleTriggered.params.window_mins} mins</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        {alert.status !== 'RESOLVED' && alert.status !== 'AUTO_CLOSED' && (
                            <div className="actions-section">
                                <button
                                    className="resolve-btn"
                                    onClick={() => setShowConfirm(true)}
                                >
                                    Manual Resolve
                                </button>
                            </div>
                        )}

                        {/* History Timeline */}
                        <div className="history-section">
                            <h3>History Timeline</h3>
                            <div className="timeline">
                                {alert.history && alert.history.length > 0 ? (
                                    alert.history.map((entry: any, idx: number) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-time">
                                                    {new Date(entry.timestamp).toLocaleString()}
                                                </div>
                                                <div className="timeline-change">
                                                    {entry.from && <span className="from-status">{entry.from}</span>}
                                                    {entry.from && <span className="arrow">→</span>}
                                                    <span className="to-status">{entry.to}</span>
                                                </div>
                                                {entry.reason && (
                                                    <div className="timeline-reason">
                                                        Reason: {entry.reason}
                                                    </div>
                                                )}
                                                {entry.triggerEvent && (
                                                    <div className="timeline-reason">
                                                        Trigger: {entry.triggerEvent}
                                                    </div>
                                                )}
                                                {entry.resolvedBy && (
                                                    <div className="timeline-reason">
                                                        Resolved by: {entry.resolvedBy}
                                                    </div>
                                                )}
                                                {entry.comment && (
                                                    <div className="timeline-comment">
                                                        "{entry.comment}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-history">No history available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                {showConfirm && (
                    <div className="confirm-overlay">
                        <div className="confirm-modal">
                            <h3>Resolve Alert</h3>
                            <p>Are you sure you want to resolve this alert?</p>
                            <textarea
                                className="comment-input"
                                placeholder="Add a comment (optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                            />
                            <div className="confirm-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowConfirm(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="confirm-btn"
                                    onClick={handleResolve}
                                    disabled={loading}
                                >
                                    {loading ? 'Resolving...' : 'Confirm Resolve'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertModal;
