import React, { useState, useEffect, useRef } from 'react';
import logo from '../../assets/logo.png'
import './Navbar.css'
import { Link, useNavigate } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Mock inventory data for search
    const mockInventory = [
        { id: 1, name: "Paracetamol", supplier: "PharmaCorp" },
        { id: 2, name: "Amoxicillin", supplier: "MediSupply" },
        { id: 3, name: "Metformin", supplier: "HealthDrugs" },
        { id: 4, name: "Aspirin", supplier: "PharmaCorp" },
        { id: 5, name: "Ibuprofen", supplier: "MediSupply" },
        { id: 6, name: "Omeprazole", supplier: "HealthDrugs" },
        { id: 7, name: "Cetirizine", supplier: "PharmaCorp" }
    ];

    useEffect(() => {
        // Close suggestions when clicking outside
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim() === '') {
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = mockInventory.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.supplier.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults(filtered);
        setShowSuggestions(true);
    };

    const handleSelectDrug = (drug) => {
        setSearchQuery('');
        setShowSuggestions(false);
        navigate('/inventory', { state: { searchTerm: drug.name } });
    };

    return (
        <div className='navbar'>
            <Link to="/" className="nav-logo-container">
                <img className='nav-logo' src={logo} alt="logo" />
                <h1 className='nav-title'>Pharmacy</h1>
            </Link>

            <div className="nav-search" ref={searchRef}>
                <div className="search-input-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search drugs..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => searchQuery && setShowSuggestions(true)}
                    />
                </div>

                {showSuggestions && searchResults.length > 0 && (
                    <div className="search-suggestions">
                        {searchResults.map(drug => (
                            <div
                                key={drug.id}
                                className="suggestion-item"
                                onClick={() => handleSelectDrug(drug)}
                            >
                                <span className="drug-name">{drug.name}</span>
                                <span className="drug-supplier">{drug.supplier}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar