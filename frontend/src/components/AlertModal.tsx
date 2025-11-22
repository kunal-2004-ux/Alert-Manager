import React from 'react';
import './AlertModal.css';

interface AlertModalProps {
    alert: any;
    onClose: () => void;
    onResolve: (id: string) => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ alert, onClose, onResolve }) => {
    if (!alert) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Alert Details</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p><strong>ID:</strong> {alert.id}</p>
                    <p><strong>Source:</strong> {alert.sourceType}</p>
                    <p><strong>Category:</strong> {alert.category || 'N/A'}</p>
                    <p><strong>Severity:</strong> <span className={`severity-${alert.severity?.toLowerCase()}`}>{alert.severity}</span></p>
                    <p><strong>Status:</strong> {alert.status}</p>
                    <p><strong>Time:</strong> {new Date(alert.timestamp).toLocaleString()}</p>

                    {alert.metadata && (
                        <div className="metadata-section">
                            <h4>Metadata</h4>
                            <pre>{JSON.stringify(alert.metadata, null, 2)}</pre>
                        </div>
                    )}

                    {alert.history && alert.history.length > 0 && (
                        <div className="history-section">
                            <h4>History</h4>
                            <ul>
                                {alert.history.map((entry: any, index: number) => (
                                    <li key={index}>
                                        {new Date(entry.timestamp).toLocaleString()} - {entry.from} &rarr; {entry.to}
                                        {entry.reason && ` (${entry.reason})`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    {alert.status !== 'RESOLVED' && alert.status !== 'AUTO_CLOSED' && (
                        <button className="resolve-button" onClick={() => onResolve(alert.id)}>
                            Resolve Alert
                        </button>
                    )}
                    <button className="cancel-button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
