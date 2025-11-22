import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendGraphProps {
    data: any[];
}

const TrendGraph: React.FC<TrendGraphProps> = ({ data }) => {
    // Transform data for recharts if needed, or assume API returns compatible format
    // API returns: [{ date: '...', status: 'OPEN', count: 10 }, ...]
    // We need to pivot this to: [{ date: '...', OPEN: 10, ESCALATED: 5, ... }]

    const processedData = React.useMemo(() => {
        const map = new Map<string, any>();
        data.forEach((item: any) => {
            const date = new Date(item.date).toLocaleDateString();
            if (!map.has(date)) {
                map.set(date, { date });
            }
            const entry = map.get(date);
            entry[item.status] = item.count;
        });
        return Array.from(map.values());
    }, [data]);

    return (
        <div className="trend-graph">
            <h3>Alert Trends (Last 7 Days)</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="OPEN" stroke="#8884d8" />
                        <Line type="monotone" dataKey="ESCALATED" stroke="#ff7300" />
                        <Line type="monotone" dataKey="AUTO_CLOSED" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="RESOLVED" stroke="#0088fe" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendGraph;
