import React, { useEffect, useState } from 'react';
import api from './api';
import SummaryCards from './components/SummaryCards';
import Leaderboard from './components/Leaderboard';
import AutoClosedTable from './components/AutoClosedTable';
import './App.css';

const App: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [autoClosed, setAutoClosed] = useState<any[]>([]);
    const [filter, setFilter] = useState('24h');

    const fetchData = async () => {
        try {
            const [summaryRes, driversRes, autoClosedRes] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/dashboard/top-drivers'),
                api.get(`/dashboard/auto-closed?last=${filter}`),
            ]);

            setSummary(summaryRes.data);
            setDrivers(driversRes.data);
            setAutoClosed(autoClosedRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [filter]);

    return (
        <div className="dashboard">
            <header>
                <h1>Alert Dashboard</h1>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                </select>
            </header>

            {summary && <SummaryCards data={summary} />}

            <div className="grid">
                <Leaderboard drivers={drivers} />
                <AutoClosedTable alerts={autoClosed} />
            </div>
        </div>
    );
};

export default App;
