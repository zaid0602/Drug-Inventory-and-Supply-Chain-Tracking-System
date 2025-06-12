import React, { useState, useEffect } from 'react';
import { salesAPI, trackingAPI } from '../../services/api';
import './Sales.css';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewSaleForm, setShowNewSaleForm] = useState(false);
    const [newSale, setNewSale] = useState({
        drugName: '',
        quantity: '',
        price: '',
        customerName: '',
        customerPhone: ''
    });

    const fetchSalesData = async () => {
        try {
            const response = await salesAPI.getAll();
            const sales = response.data || [];
            
            // Calculate total sales and orders
            const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const totalOrders = sales.length;
            
            // Get recent transactions (last 5)
            const recentTransactions = sales
                .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
                .slice(0, 5);

            // Calculate top selling drugs
            const drugSales = sales.reduce((acc, sale) => {
                acc[sale.drugName] = (acc[sale.drugName] || 0) + sale.quantity;
                return acc;
            }, {});

            const topSellingDrugs = Object.entries(drugSales)
                .map(([name, quantity]) => ({ name, quantity }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

            setSales({
                totalSales,
                totalOrders,
                recentTransactions,
                topSellingDrugs
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sales data:', error);
            setError('Failed to load sales data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesData();
        // Refresh data every 30 seconds
        const interval = setInterval(fetchSalesData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleNewSaleChange = (e) => {
        const { name, value } = e.target;
        setNewSale(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNewSaleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!newSale.drugName || !newSale.quantity || !newSale.amount) {
                alert('Please fill in all required fields');
                return;
            }

            const saleData = {
                drugName: newSale.drugName,
                quantity: parseInt(newSale.quantity),
                totalAmount: parseFloat(newSale.amount),
                transactionDate: newSale.date ? new Date(newSale.date).toISOString() : new Date().toISOString()
            };

            console.log('Creating new sale:', saleData);
            const response = await salesAPI.create(saleData);
            
            if (response.data) {
                // Create tracking entry for the new sale
                const trackingData = {
                    saleId: response.data._id,
                    drugName: saleData.drugName,
                    currentLocation: 'Distribution Center',
                    status: 'Processing',
                    estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    temperature: '15-25°C',
                    quantity: saleData.quantity,
                    lastUpdated: saleData.transactionDate
                };

                try {
                    await trackingAPI.create(trackingData);
                } catch (trackingError) {
                    console.error('Error creating tracking entry:', trackingError);
                    // Don't show error to user since the sale was successful
                }

                setNewSale({
                    drugName: '',
                    quantity: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0]
                });
                setShowNewSaleForm(false);
                alert('Sale added successfully!');
                fetchSalesData(); // Refresh data after new sale
            }
        } catch (error) {
            console.error('Error creating sale:', error);
            alert(error.response?.data?.details || error.response?.data?.error || 'Failed to add sale');
        }
    };

    if (loading) return <div className="loading">Loading sales data...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="sales-container">
            <h1>Sales</h1>
            <p className="subtitle">Sales Dashboard - Monitor your sales performance and trends</p>
            
            {/* Statistics Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Sales</h3>
                    <p className="stat-value">₹{sales.totalSales.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <p className="stat-value">{sales.totalOrders}</p>
                </div>
                <button 
                    className="add-sale-button"
                    onClick={() => setShowNewSaleForm(!showNewSaleForm)}
                >
                    {showNewSaleForm ? 'Cancel' : 'Add New Sale'}
                </button>
            </div>

            {/* Recent Transactions */}
            <div className="section">
                <h2>Recent Transactions</h2>
                <div className="transactions-list">
                    {sales.recentTransactions.map((transaction, index) => (
                        <div key={index} className="transaction-card">
                            <div className="transaction-header">
                                <h3>{transaction.drugName}</h3>
                                <span className="status-completed">Completed</span>
                            </div>
                            <div className="transaction-details">
                                <p>Quantity: {transaction.quantity}</p>
                                <p>Amount: ₹{transaction.totalAmount}</p>
                                <p>Date: {new Date(transaction.transactionDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Selling Drugs */}
            <div className="section">
                <h2>Top Selling Drugs</h2>
                <div className="top-selling-list">
                    {sales.topSellingDrugs.map((drug, index) => (
                        <div key={index} className="top-selling-card">
                            <span className="rank">#{index + 1}</span>
                            <div className="drug-info">
                                <h3>{drug.name}</h3>
                                <p>{drug.quantity} units sold</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Sale Form */}
            {showNewSaleForm && (
                <form className="new-sale-form" onSubmit={handleNewSaleSubmit}>
                    <h2>Add New Sale</h2>
                    <div className="form-group">
                        <label htmlFor="drugName">Drug Name:</label>
                        <input
                            type="text"
                            id="drugName"
                            name="drugName"
                            value={newSale.drugName}
                            onChange={handleNewSaleChange}
                            required
                            placeholder="Enter drug name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="quantity">Quantity:</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={newSale.quantity}
                            onChange={handleNewSaleChange}
                            required
                            min="1"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="amount">Amount (₹):</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={newSale.amount}
                            onChange={handleNewSaleChange}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Date:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={newSale.date}
                            onChange={handleNewSaleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-sale-button">
                        Add Sale
                    </button>
                </form>
            )}
        </div>
    );
};

export default Sales; 