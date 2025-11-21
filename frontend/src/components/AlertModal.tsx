import React from 'react';

interface AlertModalProps {
    alert: any;
    onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ alert, onClose }) => {
    if (!alert) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="close-btn" onClick={onClose}>X</button>
                <h2>Alert Details</h2>
                <p><strong>ID:</strong> {alert.id}</p>
                <p><strong>Source:</strong> {alert.sourceType}</p>
                <p><strong>Status:</strong> {alert.status}</p>
                <p><strong>Severity:</strong> {alert.severity}</p>
                <p><strong>Time:</strong> {new Date(alert.timestamp).toLocaleString()}</p>

                <h3>History</h3>
                <ul>
                    {alert.history.map((entry: any, idx: number) => (
                        <li key={idx}>
                            {new Date(entry.timestamp).toLocaleString()} -
                            <strong> {entry.from}</strong> to <strong>{entry.to}</strong>
                            {entry.reason && <span> ({entry.reason})</span>}
                            {entry.action && <span> ({entry.action})</span>}
                        </li>
                    ))}
                </ul>

                <h3>Metadata</h3>
                <pre>{JSON.stringify(alert.metadata, null, 2)}</pre>
            </div>
        </div>
    );
};

export default AlertModal;
