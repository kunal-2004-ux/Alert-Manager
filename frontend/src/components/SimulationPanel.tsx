import React, { useState } from 'react';
import api from '../api';

const SimulationPanel: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const simulateAlert = async (type: string) => {
        setLoading(true);
        setMessage('');
        try {
            let payload: any = {};
            const timestamp = new Date().toISOString();

            if (type === 'overspeed') {
                payload = {
                    sourceType: 'overspeed',
                    severity: 'warning',
                    timestamp,
                    metadata: { driverId: 'D-SIM-01', speed: 95, limit: 60 }
                };
            } else if (type === 'compliance') {
                payload = {
                    sourceType: 'compliance',
                    severity: 'info',
                    timestamp,
                    metadata: { driverId: 'D-SIM-02', document_valid: true }
                };
            } else if (type === 'escalation') {
                // Send 3 alerts to trigger escalation
                const alerts = Array(3).fill(null).map((_, i) => ({
                    sourceType: 'overspeed',
                    severity: 'warning',
                    timestamp,
                    metadata: { driverId: 'D-ESC-01', speed: 100 + i }
                }));
                await api.post('/alerts/batch', alerts);
                setMessage('Triggered 3 overspeed alerts (Escalation Test)');
                setLoading(false);
                return;
            }

            await api.post('/alerts', payload);
            setMessage(`Simulated ${type} alert sent!`);
        } catch (error) {
            console.error('Simulation failed:', error);
            setMessage('Failed to send alert');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="simulation-panel" style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ddd'
        }}>
            <h3>Simulation Panel</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => simulateAlert('overspeed')}
                    disabled={loading}
                    style={{ padding: '8px 16px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    🚨 Overspeed
                </button>
                <button
                    onClick={() => simulateAlert('compliance')}
                    disabled={loading}
                    style={{ padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    📄 Document Valid (Auto-Close)
                </button>
                <button
                    onClick={() => simulateAlert('escalation')}
                    disabled={loading}
                    style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    🔥 Trigger Escalation (x3)
                </button>
            </div>
            {message && <p style={{ marginTop: '10px', color: '#333', fontWeight: 'bold' }}>{message}</p>}
        </div>
    );
};

export default SimulationPanel;
