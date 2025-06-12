import React, { useState, useEffect } from 'react';
import { salesAPI } from '../../services/api';
import { getDrugTypeByCode } from '../../config/drugTypes';
import './Tracking.css';

const Tracking = () => {
    const [trackingData, setTrackingData] = useState([]);
    const [deliveredShipments, setDeliveredShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchTrackingData = async () => {
        try {
            setLoading(true);
            const response = await salesAPI.getAll();

            if (response.data) {
                // Process sales data into tracking format
                const processedData = response.data.map(sale => {
                    const drugType = getDrugTypeByCode(sale.drugCode);
                    return {
                        id: sale._id,
                        drugCode: sale.drugCode,
                        drugName: drugType ? `${drugType.name} - ${drugType.category}` : sale.drugName,
                        quantity: sale.quantity,
                        status: sale.status || 'Processing',
                        saleDate: new Date(sale.transactionDate).toLocaleDateString(),
                        amount: sale.totalAmount.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0
                        })
                    };
                });

                // Separate current shipments from delivered ones
                const current = processedData.filter(item => item.status !== 'Delivered');
                const delivered = processedData.filter(item => item.status === 'Delivered');

                setTrackingData(current);
                setDeliveredShipments(delivered);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching tracking data:', error);
            setError('Failed to fetch tracking data. Please try again later.');
            setTrackingData([]);
            setDeliveredShipments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setUpdatingId(id);
            await salesAPI.updateStatus(id, newStatus);
            await fetchTrackingData();
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update status. Please try again.');
        } finally {
            setUpdatingId(null);
        }
    };

    useEffect(() => {
        fetchTrackingData();
        // Refresh data every 30 seconds
        const interval = setInterval(fetchTrackingData, 30000);
        return () => clearInterval(interval);
    }, []);

    const renderShipmentCard = (shipment) => (
        <div key={shipment.id} className="shipment-card">
            <div className="shipment-header">
                <h3>{shipment.drugName}</h3>
                <span className={`status-badge status-${shipment.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {shipment.status}
                </span>
            </div>
            <div className="shipment-details">
                <p>
                    <strong>Order ID:</strong>
                    <span>{shipment.id}</span>
                </p>
                <p>
                    <strong>Quantity:</strong>
                    <span>{shipment.quantity} units</span>
                </p>
                <p>
                    <strong>Amount:</strong>
                    <span>{shipment.amount}</span>
                </p>
                <p>
                    <strong>Sale Date:</strong>
                    <span>{shipment.saleDate}</span>
                </p>
            </div>
            {shipment.status !== 'Delivered' && (
                <div className="shipment-actions">
                    <select
                        value={shipment.status}
                        onChange={(e) => handleStatusChange(shipment.id, e.target.value)}
                        disabled={updatingId === shipment.id}
                        className={`status-select ${updatingId === shipment.id ? 'updating' : ''}`}
                    >
                        <option value="Processing">Processing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>
            )}
        </div>
    );

    if (loading) {
        return <div className="loading">Loading tracking data...</div>;
    }

    return (
        <div className="tracking-container">
            <div className="tracking-header">
                <h1>Shipment Tracking</h1>
                <p className="tracking-subtitle">Monitor your drug shipments in real-time</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="tracking-content">
                <div className="current-shipments">
                    <h2>Active Shipments</h2>
                    {trackingData.length === 0 ? (
                        <div className="no-data">No active shipments found</div>
                    ) : (
                        <div className="shipments-grid">
                            {trackingData.map(renderShipmentCard)}
                        </div>
                    )}
                </div>

                <div className="delivery-history">
                    <h2>Delivery History</h2>
                    {deliveredShipments.length === 0 ? (
                        <div className="no-data">No completed deliveries found</div>
                    ) : (
                        <div className="shipments-grid">
                            {deliveredShipments.map(renderShipmentCard)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tracking; 