import React from 'react';

interface Driver {
    driverId: string;
    count: number;
}

interface LeaderboardProps {
    drivers: Driver[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ drivers }) => {
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
                    {drivers.map((driver) => (
                        <tr key={driver.driverId}>
                            <td>{driver.driverId}</td>
                            <td>{driver.count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
