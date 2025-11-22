import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import SummaryCards from './components/SummaryCards';
import Leaderboard from './components/Leaderboard';
import AutoClosedTable from './components/AutoClosedTable';
import TrendGraph from './components/TrendGraph';
import EventsStream from './components/EventsStream';
import AlertModal from './components/AlertModal';
import SimulationPanel from './components/SimulationPanel';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [autoClosed, setAutoClosed] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [filter, setFilter] = useState('24h');
    const [selectedAlert, setSelectedAlert] = useState<any>(null);
    const { logout } = useAuth();

    const fetchData = async () => {
        try {
            const [summaryRes, driversRes, autoClosedRes, trendsRes, eventsRes] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/dashboard/top-drivers'),
                api.get(`/dashboard/auto-closed?last=${filter}`),
                api.get('/dashboard/trends'),
                api.get('/dashboard/events'),
            ]);

            setSummary(summaryRes.data);
            setDrivers(driversRes.data);
            setAutoClosed(autoClosedRes.data);
            setTrends(trendsRes.data);
            setEvents(eventsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [filter]);

    const handleAlertClick = async (id: string) => {
        try {
            const res = await api.get(`/dashboard/alert/${id}`);
            setSelectedAlert(res.data);
        } catch (error) {
            console.error('Error fetching alert details:', error);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await api.patch(`/alerts/${id}/resolve`);
            fetchData();
            setSelectedAlert(null);
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    };

    return (
        <div className="dashboard">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Alert Dashboard</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                    </select>
                    <button onClick={logout} style={{ padding: '8px 16px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                </div>
            </header>

            {summary && <SummaryCards data={summary} />}

            <SimulationPanel />

            <div className="grid">
                <div className="main-col">
                    <TrendGraph data={trends} />
                    <Leaderboard drivers={drivers} onRowClick={(driverId) => console.log(driverId)} />
                    <AutoClosedTable alerts={autoClosed} onRowClick={handleAlertClick} />
                </div>
                <div className="side-col">
                    <EventsStream events={events} />
                </div>
            </div>

            {selectedAlert && (
                <AlertModal
                    alert={selectedAlert}
                    onClose={() => setSelectedAlert(null)}
                    onResolve={handleResolve}
                />
            )}
        </div>
    );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

import SignupPage from './pages/SignupPage';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
