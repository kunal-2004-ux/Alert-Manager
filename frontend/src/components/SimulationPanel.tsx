import React, { useState } from 'react';
import api from '../api';
import SimulationForm from './SimulationForm';

interface SimulationConfig {
    type: string;
    title: string;
    sourceType: string;
    category?: string;
    severity: string;
    defaultMetadata?: any;
}

interface SimulationPanelProps {
    onAlertCreated?: () => void;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ onAlertCreated }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [activeSimulation, setActiveSimulation] = useState<SimulationConfig | null>(null);

    const handleSimulationClick = (config: SimulationConfig) => {
        setActiveSimulation(config);
    };

    const handleFormSubmit = async (data: { driverId: string; metadata: any }) => {
        if (!activeSimulation) return;

        setLoading(true);
        setMessage('');
        try {
            const payload = {
                sourceType: activeSimulation.sourceType,
                category: activeSimulation.category,
                severity: activeSimulation.severity,
                timestamp: new Date().toISOString(),
                metadata: {
                    driverId: data.driverId,
                    ...activeSimulation.defaultMetadata,
                    ...data.metadata
                }
            };

            await api.post('/alerts', payload);
            setMessage(`Simulated ${activeSimulation.title} alert sent!`);

            // Trigger immediate refresh of dashboard data
            if (onAlertCreated) {
                onAlertCreated();
            }
        } catch (error) {
            console.error('Simulation failed:', error);
            setMessage('Failed to send alert');
        } finally {
            setLoading(false);
            setActiveSimulation(null);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const renderButton = (label: string, config: SimulationConfig, color: string) => (
        <button
            onClick={() => handleSimulationClick(config)}
            disabled={loading}
            style={{
                padding: '8px 12px',
                backgroundColor: color,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                flex: '1 0 45%'
            }}
        >
            {label}
        </button>
    );

    return (
        <div className="simulation-panel" style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#343a40' }}>Simulation Panel</h3>

            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '1rem' }}>🛡️ Safety Module</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {renderButton('Overspeeding', { type: 'overspeed', title: 'Overspeeding', sourceType: 'safety', category: 'overspeed', severity: 'warning', defaultMetadata: { speed: 95, limit: 60 } }, '#ff9800')}
                    {renderButton('Harsh Accel/Brake', { type: 'harsh_event', title: 'Harsh Event', sourceType: 'safety', category: 'harsh_acceleration', severity: 'warning', defaultMetadata: { gForce: 0.8 } }, '#ff5722')}
                    {renderButton('Sharp Turn', { type: 'sharp_turn', title: 'Sharp Turn', sourceType: 'safety', category: 'sharp_turn', severity: 'warning', defaultMetadata: { angle: 45 } }, '#f44336')}
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '1rem' }}>📋 Compliance Module</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {renderButton('Expiring Docs', { type: 'expiring_docs', title: 'Expiring Documents', sourceType: 'compliance', category: 'expiring_documents', severity: 'info', defaultMetadata: { docType: 'license', daysRemaining: 5 } }, '#2196f3')}
                    {renderButton('Pending Service', { type: 'pending_service', title: 'Pending Service', sourceType: 'compliance', category: 'pending_service', severity: 'info', defaultMetadata: { lastService: '2023-01-01' } }, '#03a9f4')}
                    {renderButton('✅ Doc Renewed', { type: 'document_renewed', title: 'Document Renewed', sourceType: 'compliance', category: 'document_renewed', severity: 'info', defaultMetadata: { docType: 'license', renewedDate: new Date().toISOString().split('T')[0] } }, '#4caf50')}
                    {renderButton('✅ Service Done', { type: 'service_completed', title: 'Service Completed', sourceType: 'compliance', category: 'service_completed', severity: 'info', defaultMetadata: { serviceDate: new Date().toISOString().split('T')[0] } }, '#8bc34a')}
                </div>
            </div>

            <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '1rem' }}>⭐ Feedback Module</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {renderButton('Good Review', { type: 'good_review', title: 'Good Review', sourceType: 'feedback', category: 'good_review', severity: 'info', defaultMetadata: { rating: 5, comment: 'Great ride!' } }, '#4caf50')}
                    {renderButton('Bad Review', { type: 'bad_review', title: 'Bad Review', sourceType: 'feedback', category: 'bad_review', severity: 'warning', defaultMetadata: { rating: 1, comment: 'Rude driver' } }, '#795548')}
                </div>
            </div>

            {message && (
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: message.includes('Failed') ? '#ffebee' : '#e8f5e9',
                    color: message.includes('Failed') ? '#c62828' : '#2e7d32',
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            <SimulationForm
                isOpen={!!activeSimulation}
                onClose={() => setActiveSimulation(null)}
                onSubmit={handleFormSubmit}
                title={`Simulate ${activeSimulation?.title}`}
                defaultDriverId="D-SIM-01"
            />
        </div>
    );
};

export default SimulationPanel;
