import React, { useState, useEffect } from 'react';

interface SimulationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { driverId: string; metadata: any }) => void;
    title: string;
    defaultDriverId?: string;
}

const SimulationForm: React.FC<SimulationFormProps> = ({ isOpen, onClose, onSubmit, title, defaultDriverId = '' }) => {
    const [driverId, setDriverId] = useState(defaultDriverId);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDriverId(defaultDriverId);
            setError('');
        }
    }, [isOpen, defaultDriverId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!driverId.trim()) {
            setError('Driver ID is required');
            return;
        }

        onSubmit({ driverId, metadata: {} });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '400px',
                maxWidth: '90%'
            }}>
                <h3>{title}</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Driver ID *</label>
                        <input
                            type="text"
                            value={driverId}
                            onChange={(e) => setDriverId(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            placeholder="Enter Driver ID"
                        />
                    </div>
                    {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '8px 16px',
                            backgroundColor: '#ccc',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>Cancel</button>
                        <button type="submit" style={{
                            padding: '8px 16px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>Simulate</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SimulationForm;
