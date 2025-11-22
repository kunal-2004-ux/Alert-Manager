import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, SignUp, RedirectToSignIn, UserButton, useAuth } from "@clerk/clerk-react";
import './App.css';
import { getSummary, getTopDrivers, getResolved, getTrends, getEvents, resolveAlert, setAuthToken } from './api';
import Leaderboard from './components/Leaderboard';
import ResolvedTable from './components/ResolvedTable';
import TrendGraph from './components/TrendGraph';
import EventsStream from './components/EventsStream';
import AlertModal from './components/AlertModal';
import SimulationPanel from './components/SimulationPanel';

function Dashboard() {
    const [summary, setSummary] = useState<any>(null);
    const [topDrivers, setTopDrivers] = useState<any[]>([]);
    const [resolved, setResolved] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<any>(null);
    const { getToken } = useAuth();

    const fetchData = async () => {
        try {
            const token = await getToken();
            setAuthToken(token); // Set token before requests

            const summaryData = await getSummary();
            setSummary(summaryData);

            const driversData = await getTopDrivers();
            // Handle new response format with drivers array and updatedAt
            setTopDrivers(driversData.drivers || driversData);

            const resolvedData = await getResolved();
            setResolved(resolvedData);

            const trendsData = await getTrends();
            setTrends(trendsData);

            const eventsData = await getEvents();
            setEvents(eventsData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const handleAlertClick = (alertId: string) => {
        // In a real app, fetch full details. For now, we might need a separate endpoint or just pass data if available.
        // Let's assume we fetch it or find it in a list. 
        // Since we don't have a full list in state, we might need to fetch details.
        // For this demo, we'll just set the ID and let the modal fetch or show a placeholder.
        // Ideally: const alert = await getAlertDetails(alertId);
        setSelectedAlertId(alertId);
        // Mocking the alert object for the modal for now, or fetching it if we had the endpoint ready in frontend
        setSelectedAlert({ id: alertId, status: 'OPEN', severity: 'HIGH', sourceType: 'sensor', timestamp: new Date(), history: [], metadata: {} });
    };

    const handleResolve = async (id: string) => {
        try {
            await resolveAlert(id);
            setSelectedAlertId(null);
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to resolve alert:", error);
            alert("Failed to resolve alert");
        }
    };

    return (
        <div className="dashboard">
            <header>
                <h1>Alert Management Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <UserButton />
                </div>
            </header>

            {summary && (
                <div className="summary-cards">
                    <div className="card open">
                        <h3>Open Alerts</h3>
                        <p>{summary.byStatus.OPEN || 0}</p>
                    </div>
                    <div className="card critical">
                        <h3>Critical</h3>
                        <p>{summary.bySeverity.CRITICAL || 0}</p>
                    </div>
                    <div className="card warning">
                        <h3>Warning</h3>
                        <p>{summary.bySeverity.WARNING || 0}</p>
                    </div>
                    <div className="card info">
                        <h3>Info</h3>
                        <p>{summary.bySeverity.INFO || 0}</p>
                    </div>
                    <div className="card auto-closed-card" style={{ backgroundColor: '#27ae60' }}>
                        <h3>Auto-Closed</h3>
                        <p>{summary.byStatus.AUTO_CLOSED || 0}</p>
                    </div>
                </div>
            )}

            <div className="grid">
                <div className="main-col">
                    <TrendGraph data={trends} />
                    <div style={{ marginTop: '20px' }}>
                        <Leaderboard drivers={topDrivers} onRowClick={(driverId) => console.log("Driver clicked:", driverId)} />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <ResolvedTable alerts={resolved} onRowClick={(id) => handleAlertClick(id)} />
                    </div>
                </div>
                <div className="side-col">
                    <SimulationPanel onAlertCreated={fetchData} />
                    <EventsStream events={events} onEventClick={handleAlertClick} isLoading={events.length === 0} />
                </div>
            </div>

            {selectedAlertId && (
                <AlertModal
                    alert={selectedAlert}
                    onClose={() => setSelectedAlertId(null)}
                    onResolve={handleResolve}
                />
            )}
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <SignedIn>
                                <Dashboard />
                            </SignedIn>
                            <SignedOut>
                                <RedirectToSignIn />
                            </SignedOut>
                        </>
                    }
                />
                <Route
                    path="/sign-in/*"
                    element={<SignIn routing="path" path="/sign-in" />}
                />
                <Route
                    path="/sign-up/*"
                    element={<SignUp routing="path" path="/sign-up" />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
