const express = require('express');
const router = express.Router();
const axios = require('axios');

const PREDICTION_API_URL = 'http://localhost:5002';

router.get('/model-info', async (req, res) => {
    try {
        const response = await axios.get(`${PREDICTION_API_URL}/api/health`);
        res.json(response.data);
    } catch (error) {
        console.error('Error getting model info:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/forecast', async (req, res) => {
    try {
        const { drug_type, month, stock_level, days = 30 } = req.body;

        if (!drug_type || !month || stock_level === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        // Validate drug type
        const validDrugTypes = ['analgesic', 'anti-inflammatory', 'painkiller', 'antipyretic', 
                              'sedative', 'antipsychotic', 'respiratory', 'antihistamine'];
        if (!validDrugTypes.includes(drug_type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid drug type'
            });
        }

        // Validate stock level
        if (isNaN(stock_level) || stock_level < 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid stock level'
            });
        }

        // Validate days
        if (isNaN(days) || days < 1 || days > 90) {
            return res.status(400).json({
                success: false,
                error: 'Days must be between 1 and 90'
            });
        }

        const response = await axios.post(`${PREDICTION_API_URL}/api/predict`, {
            drug_type,
            month,
            stock_level: parseFloat(stock_level),
            days: parseInt(days)
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Error generating forecast:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate forecast'
        });
    }
});

module.exports = router; 