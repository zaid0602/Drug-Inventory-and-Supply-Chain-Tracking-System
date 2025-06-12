import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { inventoryAPI } from '../../services/api';
import { FaSearch } from 'react-icons/fa';
import './Inventory.css';

const Inventory = () => {
    const location = useLocation();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [drugTypes, setDrugTypes] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        drugType: ''
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'drugName',
        direction: 'ascending'
    });

    useEffect(() => {
        if (location.state?.searchTerm) {
            setFilters(prev => ({ ...prev, searchTerm: location.state.searchTerm }));
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [inventoryResponse, drugTypesResponse] = await Promise.all([
                    inventoryAPI.getAll(),
                    inventoryAPI.getDrugTypes()
                ]);

                if (inventoryResponse && inventoryResponse.data) {
                    setInventory(inventoryResponse.data);
                } else {
                    throw new Error('Invalid inventory response format');
                }

                if (drugTypesResponse) {
                    setDrugTypes(drugTypesResponse);
                } else {
                    throw new Error('Invalid drug types response format');
                }

                setError(null);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again later.');
                setInventory([]);
                setDrugTypes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location.state]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.drugName.toLowerCase().includes(filters.search.toLowerCase());
        const matchesType = !filters.drugType || item.drugType.code === filters.drugType;
        return matchesSearch && matchesType;
    });

    const sortedInventory = [...filteredInventory].sort((a, b) => {
        const order = sortConfig.direction === 'ascending' ? 1 : -1;
        switch (sortConfig.key) {
            case 'drugName':
                return order * a.drugName.localeCompare(b.drugName);
            case 'quantity':
                return order * (a.quantity - b.quantity);
            case 'expiryDate':
                return order * (new Date(a.expiryDate) - new Date(b.expiryDate));
            default:
                return 0;
        }
    });

    const requestSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
        });
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '↑' : '↓';
        }
        return null;
    };

    if (loading) {
        return <div className="loading">Loading inventory...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="inventory-container">
            <h1>Drug Inventory</h1>
            
            <div className="filters">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        name="search"
                        className="search-input"
                        placeholder="Search by drug name..."
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                </div>
                <select
                    name="drugType"
                    className="drug-type-select"
                    value={filters.drugType}
                    onChange={handleFilterChange}
                >
                    <option value="">All Drug Types</option>
                    {drugTypes.map(type => (
                        <option key={type.code} value={type.code}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="inventory-table-container">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('drugName')} className={`sortable ${sortConfig.key === 'drugName' ? sortConfig.direction : ''}`}>
                                Drug Name
                            </th>
                            <th onClick={() => requestSort('drugType')} className={`sortable ${sortConfig.key === 'drugType' ? sortConfig.direction : ''}`}>
                                Drug Type
                            </th>
                            <th onClick={() => requestSort('quantity')} className={`sortable ${sortConfig.key === 'quantity' ? sortConfig.direction : ''}`}>
                                Quantity
                            </th>
                            <th onClick={() => requestSort('price')} className={`sortable ${sortConfig.key === 'price' ? sortConfig.direction : ''}`}>
                                Price
                            </th>
                            <th onClick={() => requestSort('supplier')} className={`sortable ${sortConfig.key === 'supplier' ? sortConfig.direction : ''}`}>
                                Supplier
                            </th>
                            <th onClick={() => requestSort('expiryDate')} className={`sortable ${sortConfig.key === 'expiryDate' ? sortConfig.direction : ''}`}>
                                Expiry Date
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedInventory.length > 0 ? (
                            sortedInventory.map(item => (
                                <tr key={item._id}>
                                    <td>{item.drugName}</td>
                                    <td>{item.drugType.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{item.price.toLocaleString('en-IN')}</td>
                                    <td>{item.supplier}</td>
                                    <td>{new Date(item.expiryDate).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    No drugs found matching your criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getStatus = (item) => {
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 30) return 'low';
    return 'active';
};

export default Inventory;