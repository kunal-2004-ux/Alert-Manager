import React from 'react';

interface SummaryProps {
    data: {
        byStatus: Record<string, number>;
        bySeverity: Record<string, number>;
    };
}

const SummaryCards: React.FC<SummaryProps> = ({ data }) => {
    return (
        <div className="summary-cards">
            <div className="card critical">
                <h3>Critical</h3>
                <p>{data.bySeverity.CRITICAL || 0}</p>
            </div>
            <div className="card warning">
                <h3>Warning</h3>
                <p>{data.bySeverity.WARNING || 0}</p>
            </div>
            <div className="card info">
                <h3>Info</h3>
                <p>{data.bySeverity.INFO || 0}</p>
            </div>
            <div className="card open">
                <h3>Total Open</h3>
                <p>{data.byStatus.OPEN || 0}</p>
            </div>
        </div>
    );
};

export default SummaryCards;
