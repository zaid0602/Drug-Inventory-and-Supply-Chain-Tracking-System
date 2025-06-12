const express = require('express');
const router = express.Router();

// Sample drug types - replace with actual data from your database
const DRUG_TYPES = [
    'Antibiotics',
    'Analgesics',
    'Antipyretics',
    'Antihistamines',
    'Antacids',
    'Vitamins',
    'Antidepressants',
    'Antihypertensives'
];

router.get('/types', (req, res) => {
    try {
        res.json(DRUG_TYPES);
    } catch (error) {
        console.error('Error fetching drug types:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 