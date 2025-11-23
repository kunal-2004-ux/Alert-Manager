import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendGraphProps {
    data: any[];
    range: '24h' | '7d';
    onRangeChange: (range: '24h' | '7d') => void;
}

const TrendGraph: React.FC<TrendGraphProps> = ({ data, range, onRangeChange }) => {
    // Transform data for recharts
    const processedData = React.useMemo(() => {
        const map = new Map<string, any>();
        data.forEach((item: any) => {
            let dateLabel = '';
            const dateObj = new Date(item.date);

            if (range === '24h') {
                // Format as "2:00 PM"
                dateLabel = dateObj.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric'
                });
            } else {
                // Format as "Nov 23"
                dateLabel = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            }

            if (!map.has(dateLabel)) {
                map.set(dateLabel, { date: dateLabel, originalDate: dateObj });
            }
            const entry = map.get(dateLabel);
            entry[item.status] = item.count;
        });

        // Sort by date
        return Array.from(map.values()).sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
    }, [data, range]);

    return (
        <div className="trend-graph">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Alert Trends</h3>
                <div className="range-selector">
                    <button
                        className={`range-btn ${range === '24h' ? 'active' : ''}`}
                        onClick={() => onRangeChange('24h')}
                        style={{
                            padding: '4px 8px',
                            marginRight: '5px',
                            background: range === '24h' ? '#3498db' : '#f0f0f0',
                            color: range === '24h' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        24h
                    </button>
                    <button
                        className={`range-btn ${range === '7d' ? 'active' : ''}`}
                        onClick={() => onRangeChange('7d')}
                        style={{
                            padding: '4px 8px',
                            background: range === '7d' ? '#3498db' : '#f0f0f0',
                            color: range === '7d' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        7d
                    </button>
                </div>
            </div>
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
