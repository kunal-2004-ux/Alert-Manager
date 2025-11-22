import React from 'react';

interface Alert {
    id: string;
    sourceType: string;
    status: string;
    timestamp: string;
    history: any[];
}

interface ResolvedProps {
    alerts: Alert[];
    onRowClick?: (alertId: string) => void;
}

const ResolvedTable: React.FC<ResolvedProps> = ({ alerts, onRowClick }) => {
    return (
        <div className="resolved-alerts">
            <h2>Resolved Alerts</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {alerts.map((alert) => {
                        const closedEntry = alert.history.find((h: any) => h.to === 'AUTO_CLOSED');
                        const resolvedEntry = alert.history.find((h: any) => h.to === 'RESOLVED');
                        const reason = closedEntry?.triggerEvent || closedEntry?.reason ||
                            (resolvedEntry?.action === 'manual_resolve' ? 'Manual' : 'N/A');

                        return (
                            <tr key={alert.id} onClick={() => onRowClick && onRowClick(alert.id)} style={{ cursor: 'pointer' }}>
                                <td style={{ color: '#333', fontWeight: '500' }}>{alert.id.substring(0, 8)}...</td>
                                <td style={{ color: '#333', fontWeight: '500' }}>{alert.sourceType}</td>
                                <td style={{
                                    color: alert.status === 'AUTO_CLOSED' ? '#27ae60' : '#3498db',
                                    fontWeight: '600'
                                }}>
                                    {alert.status === 'AUTO_CLOSED' ? 'Auto-Closed' : 'Resolved'}
                                </td>
                                <td style={{ color: '#333', fontWeight: '500' }}>{new Date(alert.timestamp).toLocaleString()}</td>
                                <td style={{ color: '#333', fontWeight: '500' }}>{reason}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ResolvedTable;
