import React from 'react';
import './Help.css';

const Help = () => {
    return (
        <div className="help-container">
            <div className="help-header">
                <h1>Help & Support</h1>
                <p className="help-subtitle">Get assistance with using the Drug Inventory Management System</p>
            </div>

            <div className="help-content">
                <div className="help-section">
                    <h2>Getting Started</h2>
                    <div className="help-card">
                        <h3>Welcome to the System</h3>
                        <p>This comprehensive drug inventory management system helps you track inventory, manage sales, monitor shipments, and predict future stock requirements.</p>
                        <ul>
                            <li>Use the navigation menu to access different features</li>
                            <li>Each section has its own dedicated dashboard</li>
                            <li>Data is automatically synchronized across all modules</li>
                        </ul>
                    </div>
                </div>

                <div className="help-section">
                    <h2>Features Guide</h2>
                    <div className="help-grid">
                        <div className="help-card">
                            <h3>Inventory Management</h3>
                            <ul>
                                <li>Add new drugs to inventory</li>
                                <li>Update stock quantities</li>
                                <li>Track expiry dates</li>
                                <li>Monitor batch numbers</li>
                            </ul>
                        </div>

                        <div className="help-card">
                            <h3>Sales Tracking</h3>
                            <ul>
                                <li>Record new sales</li>
                                <li>View sales history</li>
                                <li>Track revenue</li>
                                <li>Generate sales reports</li>
                            </ul>
                        </div>

                        <div className="help-card">
                            <h3>Shipment Tracking</h3>
                            <ul>
                                <li>Monitor shipment status</li>
                                <li>Update delivery status</li>
                                <li>Track estimated arrivals</li>
                                <li>View delivery history</li>
                            </ul>
                        </div>

                        <div className="help-card">
                            <h3>Predictions</h3>
                            <ul>
                                <li>View stock predictions</li>
                                <li>Get reorder recommendations</li>
                                <li>Analyze demand trends</li>
                                <li>Plan inventory levels</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="help-section">
                    <h2>Common Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-card">
                            <h3>How do I add a new drug?</h3>
                            <p>Go to the Inventory section and click the "Add New Drug" button. Fill in the required details including name, quantity, price, and expiry date.</p>
                        </div>

                        <div className="faq-card">
                            <h3>How do I record a sale?</h3>
                            <p>Navigate to the Sales section and use the "New Sale" form. Select the drug, enter quantity, and the system will automatically calculate the total amount.</p>
                        </div>

                        <div className="faq-card">
                            <h3>How do I track shipments?</h3>
                            <p>The Tracking section automatically shows all sales as shipments. You can update their status as they progress through the supply chain.</p>
                        </div>

                        <div className="faq-card">
                            <h3>How are predictions calculated?</h3>
                            <p>Predictions are based on historical sales data and current inventory levels. The system analyzes trends to forecast future stock requirements.</p>
                        </div>
                    </div>
                </div>

                <div className="help-section">
                    <h2>Need More Help?</h2>
                    <div className="contact-card">
                        <h3>Contact Support</h3>
                        <p>If you need additional assistance, please contact our support team:</p>
                        <ul>
                            <li>Email: support@druginventory.com</li>
                            <li>Phone: +1 (555) 123-4567</li>
                            <li>Hours: Monday - Friday, 9:00 AM - 5:00 PM EST</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help; 