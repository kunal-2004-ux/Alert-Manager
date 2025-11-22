import React from 'react';

interface Driver {
    driverId: string;
    count: number;
}

interface LeaderboardProps {
    drivers: Driver[];
    onRowClick?: (driverId: string) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ drivers, onRowClick }) => {
    return (
        <div className="leaderboard">
            <h2>Top Drivers (Open Alerts)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Driver ID</th>
                        <th>Alert Count</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.map((driver, index) => (
                        <tr key={driver.driverId || index} onClick={() => onRowClick && onRowClick(driver.driverId)} style={{ cursor: 'pointer' }}>
                            <td style={{ color: '#333', fontWeight: '500' }}>{driver.driverId}</td>
                            <td style={{ color: '#333', fontWeight: '500' }}>{driver.count}</td>
                        </tr>
                    ))}
                    {drivers.length === 0 && (
                        <tr>
                            <td colSpan={2} style={{ textAlign: 'center', color: '#999' }}>
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
