import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../../services/api';
import './Upload.css';

// Drug types with their codes
const DRUG_TYPES = [
    { code: 'M01AB', name: 'Anti-inflammatory and antirheumatic products (Acetic acid derivatives)' },
    { code: 'M01AE', name: 'Anti-inflammatory and antirheumatic products (Propionic acid derivatives)' },
    { code: 'N02BA', name: 'Other analgesics and antipyretics (Salicylic acid derivatives)' },
    { code: 'N02BE/B', name: 'Other analgesics and antipyretics (Pyrazolones and Anilides)' },
    { code: 'N05B', name: 'Psycholeptics drugs (Anxiolytic)' },
    { code: 'N05C', name: 'Psycholeptics drugs (Hypnotics and sedatives)' },
    { code: 'R03', name: 'Drugs for obstructive airway diseases' },
    { code: 'R06', name: 'Antihistamines for systemic use' }
];

const Upload = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        drugName: '',
        drugType: '',
        quantity: '',
        price: '',
        supplier: '',
        expiryDate: '',
        batchNumber: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Generate a random batch number if not provided
            if (!formData.batchNumber) {
                formData.batchNumber = `BATCH-${Date.now().toString().slice(-6)}`;
            }
            
            // Find the selected drug type object
            const selectedDrugType = DRUG_TYPES.find(drug => drug.code === formData.drugType);
            
            // Convert quantity and price to numbers and include the full drug type name
            const formattedData = {
                ...formData,
                quantity: Number(formData.quantity),
                price: Number(formData.price),
                drugType: selectedDrugType ? selectedDrugType.name : formData.drugType
            };
            
            await inventoryAPI.create(formattedData);
            navigate('/inventory', { state: { message: 'Drug added successfully!' } });
        } catch (error) {
            console.error('Error adding drug:', error);
            setError(error.response?.data?.message || 'Failed to add drug. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-container">
            <h1>Add New Drug</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-group">
                    <label htmlFor="drugName">Drug Name</label>
                    <input
                        type="text"
                        id="drugName"
                        name="drugName"
                        value={formData.drugName}
                        onChange={handleInputChange}
                        placeholder="Enter drug name"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="drugType">Drug Type</label>
                    <select
                        id="drugType"
                        name="drugType"
                        value={formData.drugType}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select a drug type...</option>
                        {DRUG_TYPES.map((type) => (
                            <option key={type.code} value={type.code}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="Enter quantity"
                        min="1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="supplier">Supplier</label>
                    <input
                        type="text"
                        id="supplier"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        placeholder="Enter supplier name"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                        type="date"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="batchNumber">Batch Number (Optional)</label>
                    <input
                        type="text"
                        id="batchNumber"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleInputChange}
                        placeholder="Auto-generated if left empty"
                    />
                </div>
                <div className="form-group full-width">
                    <label htmlFor="description">Description (Optional)</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter additional details about the drug"
                        rows="3"
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Adding Drug...' : 'Add Drug'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Upload; 