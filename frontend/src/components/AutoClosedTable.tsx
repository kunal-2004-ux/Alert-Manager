import React from 'react';

interface Alert {
    id: string;
    sourceType: string;
    timestamp: string;
    history: any[];
}

interface AutoClosedProps {
    alerts: Alert[];
    onRowClick?: (alertId: string) => void;
}

const AutoClosedTable: React.FC<AutoClosedProps> = ({ alerts, onRowClick }) => {
    return (
        <div className="auto-closed">
            <h2>Recently Auto-Closed</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Source</th>
                        <th>Time</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {alerts.map((alert) => {
                        const closedEntry = alert.history.find((h: any) => h.to === 'AUTO_CLOSED');
                        return (
                            <tr key={alert.id} onClick={() => onRowClick && onRowClick(alert.id)} style={{ cursor: 'pointer' }}>
                                <td style={{ color: '#333', fontWeight: '500' }}>{alert.id.substring(0, 8)}...</td>
                                <td style={{ color: '#333', fontWeight: '500' }}>{alert.sourceType}</td>
                                <td style={{ color: '#333', fontWeight: '500' }}>{new Date(alert.timestamp).toLocaleString()}</td>
                                <td style={{ color: '#333', fontWeight: '500' }}>{closedEntry?.reason || 'N/A'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AutoClosedTable;
