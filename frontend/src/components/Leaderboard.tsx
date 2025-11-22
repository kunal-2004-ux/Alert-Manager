import React from 'react';

interface Driver {
    driverId: string;
    openAlerts: number;
    escalatedAlerts: number;
    totalAlerts: number;
}

interface LeaderboardProps {
    drivers: Driver[];
    onRowClick?: (driverId: string) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ drivers, onRowClick }) => {
    return (
        <div className="leaderboard">
            <h2>Top Offenders (Top 5 Drivers)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Driver ID</th>
                        <th>Open Alerts</th>
                        <th>Escalated Alerts</th>
                        <th>Total Alerts</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.map((driver, index) => (
                        <tr key={driver.driverId || index} onClick={() => onRowClick && onRowClick(driver.driverId)} style={{ cursor: 'pointer' }}>
                            <td style={{ color: '#333', fontWeight: '500' }}>{driver.driverId}</td>
                            <td style={{ color: '#f39c12', fontWeight: '600' }}>{driver.openAlerts}</td>
                            <td style={{ color: '#e74c3c', fontWeight: '600' }}>{driver.escalatedAlerts}</td>
                            <td style={{ color: '#333', fontWeight: '700' }}>{driver.totalAlerts}</td>
                        </tr>
                    ))}
                    {drivers.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center', color: '#999' }}>
                                No drivers with open alerts
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
