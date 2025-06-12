const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();
const app = express();

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Configure multer for handling form data
const upload = multer();

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// MongoDB Connection Check Middleware
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        console.log('MongoDB not connected, attempting to reconnect...');
        try {
            await connectWithRetry();
            next();
        } catch (error) {
            console.error('MongoDB connection error:', error);
            return res.status(500).json({ 
                error: 'Database connection error',
                details: 'Unable to connect to database'
            });
        }
    } else {
        next();
    }
});

// Define Schemas
const drugTypeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String }
});

const drugSchema = new mongoose.Schema({
    drugName: {
        type: String,
        required: [true, 'Drug name is required'],
        trim: true
    },
    drugType: {
        code: {
            type: String,
            required: [true, 'Drug type code is required'],
            trim: true
        },
        name: {
            type: String,
            required: [true, 'Drug type name is required'],
            trim: true
        }
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    supplier: {
        type: String,
        required: [true, 'Supplier is required'],
        trim: true
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    batchNumber: {
        type: String,
        required: [true, 'Batch number is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'low-stock'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const saleSchema = new mongoose.Schema({
    drugName: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now },
    status: { type: String, default: 'completed' }
});

// Create models
const Drug = mongoose.model('Drug', drugSchema);
const DrugType = mongoose.model('DrugType', drugTypeSchema);
const Sale = mongoose.model('Sale', saleSchema);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drugstore';

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB Atlas');
        
        // Initialize drug types after successful connection
        await initializeDrugTypes();
        
        // Import and use prediction routes after successful connection
        const predictRoutes = require('./routes/predict_routes');
        app.use('/api/predict', predictRoutes);
        
        // Check if we have any drugs in the database
        const count = await Drug.countDocuments();
        if (count === 0) {
            // Add a test drug if the database is empty
            const testDrug = new Drug({
                drugName: "Paracetamol",
                drugType: {
                    code: "N02BE/B",
                    name: "Other analgesics and antipyretics (Pyrazolones and Anilides)"
                },
                quantity: 100,
                price: 10,
                supplier: "Test Supplier",
                expiryDate: new Date("2025-12-31"),
                batchNumber: "TEST001"
            });
            await testDrug.save();
            console.log('Added test drug to database');
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
        throw err; // Re-throw the error to be caught by the middleware
    }
};

// Initial connection attempt
connectWithRetry().catch(err => {
    console.error('Initial MongoDB connection failed:', err);
});

// Define Schemas
const orderSchema = new mongoose.Schema({
    drugName: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    orderDate: { type: Date, default: Date.now },
    completionDate: { type: Date }
});

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create Models
const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);

// Initialize drug types if they don't exist
const initializeDrugTypes = async () => {
    const drugTypes = [
        { code: 'M01AB', name: 'Anti-inflammatory and antirheumatic products (Acetic acid derivatives)' },
        { code: 'M01AE', name: 'Anti-inflammatory and antirheumatic products (Propionic acid derivatives)' },
        { code: 'N02BA', name: 'Other analgesics and antipyretics (Salicylic acid derivatives)' },
        { code: 'N02BE/B', name: 'Other analgesics and antipyretics (Pyrazolones and Anilides)' },
        { code: 'N05B', name: 'Psycholeptics drugs (Anxiolytic)' },
        { code: 'N05C', name: 'Psycholeptics drugs (Hypnotics and sedatives)' },
        { code: 'R03', name: 'Drugs for obstructive airway diseases' },
        { code: 'R06', name: 'Antihistamines for systemic use' }
    ];

    try {
        for (const drugType of drugTypes) {
            await DrugType.findOneAndUpdate(
                { code: drugType.code },
                drugType,
                { upsert: true, new: true }
            );
        }
        console.log('Drug types initialized successfully');
    } catch (error) {
        console.error('Error initializing drug types:', error);
    }
};

// Routes
// GET inventory endpoint
app.get('/api/inventory', async (req, res) => {
    try {
        console.log('Fetching inventory - MongoDB connection state:', mongoose.connection.readyState);
        console.log('Request headers:', req.headers);
        
        const inventory = await Drug.find();
        console.log(`Found ${inventory.length} items in inventory:`, inventory);
        
        res.json(inventory);
    } catch (error) {
        console.error('Error serving inventory:', error);
        res.status(500).json({ 
            error: 'Failed to fetch inventory data',
            details: error.message,
            mongoState: mongoose.connection.readyState
        });
    }
});

// POST inventory endpoint (for adding new drugs)
app.post('/api/inventory', async (req, res) => {
    try {
        const { drugName, drugType, quantity, price, supplier, expiryDate, batchNumber, description } = req.body;
        
        // Validate required fields
        if (!drugName || !drugType || !quantity || !price || !supplier || !expiryDate || !batchNumber) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'All fields are required except description'
            });
        }

        // Find drug type in database
        const drugTypeDoc = await DrugType.findOne({ name: drugType });
        if (!drugTypeDoc) {
            return res.status(400).json({
                error: 'Invalid drug type',
                details: 'The specified drug type does not exist'
            });
        }

        // Check if drug with same name and supplier exists
        const existingDrug = await Drug.findOne({ drugName, supplier });
        
        if (existingDrug) {
            // Update existing drug
            existingDrug.quantity += Number(quantity);
            existingDrug.price = price;
            existingDrug.drugType = {
                code: drugTypeDoc.code,
                name: drugTypeDoc.name
            };
            existingDrug.expiryDate = expiryDate;
            existingDrug.batchNumber = batchNumber;
            if (description) {
                existingDrug.description = description;
            }
            
            await existingDrug.save();
            console.log('Existing drug updated:', existingDrug);
            return res.json({
                message: 'Drug quantity updated successfully',
                drug: existingDrug
            });
        }
        
        // If drug doesn't exist, create new entry
        const newDrug = new Drug({
            ...req.body,
            drugType: {
                code: drugTypeDoc.code,
                name: drugTypeDoc.name
            }
        });
        
        await newDrug.save();
        console.log('New drug added successfully:', newDrug);
        res.status(201).json(newDrug);
    } catch (error) {
        console.error('Error adding drug:', error);
        res.status(500).json({ 
            error: 'Failed to add drug',
            details: error.message
        });
    }
});

// GET all sales endpoint
app.get('/api/sales', async (req, res) => {
    try {
        console.log('Fetching all sales');
        const sales = await Sale.find().sort({ transactionDate: -1 });
        console.log(`Found ${sales.length} sales`);
        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ 
            error: 'Failed to fetch sales data',
            details: error.message 
        });
    }
});

// GET sales statistics endpoint
app.get('/api/sales/stats/summary', async (req, res) => {
    try {
        console.log('Fetching sales statistics');
        
        // Get total sales amount and recent transactions in parallel
        const [totalSalesResult, recentTransactions] = await Promise.all([
            Sale.aggregate([
                { 
                    $group: { 
                        _id: null, 
                        total: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            Sale.find()
                .sort({ transactionDate: -1 })
                .limit(5)
                .lean()
        ]);

        console.log('Total sales calculation:', totalSalesResult);
        console.log('Recent transactions:', recentTransactions);

        // Get monthly totals for growth calculation
        const monthlyTotals = await Sale.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$transactionDate' },
                        month: { $month: '$transactionDate' }
                    },
                    total: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 2 }
        ]);
        console.log('Monthly totals:', monthlyTotals);

        // Calculate statistics
        const totalSales = totalSalesResult[0]?.total || 0;
        const totalCount = totalSalesResult[0]?.count || 0;
        const averageOrder = totalCount > 0 ? totalSales / totalCount : 0;
        
        // Calculate monthly growth
        let monthlyGrowth = 0;
        if (monthlyTotals.length >= 2) {
            const currentMonth = monthlyTotals[0].total;
            const previousMonth = monthlyTotals[1].total;
            monthlyGrowth = previousMonth === 0 ? 100 : ((currentMonth - previousMonth) / previousMonth) * 100;
        }

        const response = {
            totalSales,
            monthlyGrowth: Math.round(monthlyGrowth * 100) / 100, // Round to 2 decimal places
            averageOrder,
            totalOrders: totalCount,
            recentTransactions: recentTransactions.map(transaction => ({
                ...transaction,
                transactionDate: transaction.transactionDate.toISOString()
            }))
        };
        
        console.log('Sending sales statistics response:', response);
        res.json(response);
    } catch (error) {
        console.error('Error fetching sales stats:', error);
        res.status(500).json({ 
            error: 'Failed to fetch sales statistics',
            details: error.message 
        });
    }
});

// POST new sale
app.post('/api/sales', async (req, res) => {
    try {
        const { drugName, quantity, totalAmount, transactionDate } = req.body;
        
        // Validate required fields
        if (!drugName || !quantity || !totalAmount) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Drug name, quantity, and total amount are required'
            });
        }

        // Find the drug
        const drug = await Drug.findOne({ drugName });
        if (!drug) {
            return res.status(404).json({ 
                error: 'Drug not found',
                details: `No drug found with name: ${drugName}`
            });
        }
        
        // Check if enough quantity is available
        if (drug.quantity < quantity) {
            return res.status(400).json({ 
                error: 'Insufficient quantity',
                details: `Available quantity (${drug.quantity}) is less than requested (${quantity})`
            });
        }
        
        // Create new sale
        const sale = new Sale({
            drugName,
            quantity,
            totalAmount,
            transactionDate: transactionDate || new Date()
        });
        
        // Update inventory
        drug.quantity -= quantity;
        if (drug.quantity <= 10) { // Set low-stock threshold
            drug.status = 'low-stock';
        }
        
        // Save both sale and updated inventory
        await Promise.all([
            sale.save(),
            drug.save()
        ]);
        
        console.log('New sale created:', sale);
        res.status(201).json(sale);
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({ 
            error: 'Failed to create sale',
            details: error.message
        });
    }
});

// PATCH update sale endpoint
app.patch('/api/sales/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log('PATCH: Updating sale:', { id, status });

        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid ID format',
                details: 'The provided ID is not a valid MongoDB ObjectId'
            });
        }

        // Validate status if provided
        if (status) {
            const validStatuses = ['Processing', 'In Transit', 'Delivered'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status',
                    details: `Status must be one of: ${validStatuses.join(', ')}`
                });
            }
        }

        // Find and update the sale
        const sale = await Sale.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!sale) {
            return res.status(404).json({
                error: 'Sale not found',
                details: `No sale found with id: ${id}`
            });
        }

        console.log('Sale updated:', sale);
        res.json(sale);
    } catch (error) {
        console.error('Error updating sale:', error);
        res.status(500).json({
            error: 'Failed to update sale',
            details: error.message
        });
    }
});

// GET drug types endpoint
app.get('/api/drugs/types', async (req, res) => {
    try {
        const drugTypes = await DrugType.find();
        res.json(drugTypes);
    } catch (error) {
        console.error('Error fetching drug types:', error);
        res.status(500).json({
            error: 'Failed to fetch drug types',
            details: error.message
        });
    }
});

// User Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, name } = req.body;

        // Validate required fields
        if (!username || !email || !password || !name) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Username, email, password, and name are required'
            });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                details: existingUser.username === username ? 
                    'Username already taken' : 'Email already registered'
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password, // Note: In production, you should hash the password
            name,
            role: 'user'
        });

        await newUser.save();
        console.log('New user registered:', newUser.username);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                username: newUser.username,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ 
            error: 'Failed to register user',
            details: error.message
        });
    }
});

// User Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                details: 'Email or password is incorrect'
            });
        }

        // In a real application, you would verify the password here
        // For now, we'll just check if the password matches
        if (user.password !== password) {
            return res.status(401).json({
                error: 'Invalid credentials',
                details: 'Email or password is incorrect'
            });
        }

        // Return user data (excluding password)
        res.json({
            message: 'Login successful',
            user: {
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ 
            error: 'Failed to login',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

//Start Python prediction service
const startPredictionService = () => {
    const pythonPath = path.join(__dirname, '..', 'ml_service', 'venv', 'Scripts', 'python.exe');
    const scriptPath = path.join(__dirname, '..', 'ml_service', 'app.py');
    
    console.log('Starting Python service with:');
    console.log('Python path:', pythonPath);
    console.log('Script path:', scriptPath);
    
    const pythonProcess = spawn(pythonPath, [scriptPath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log('Python service output:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Python service error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python service exited with code ${code}`);
        if (code !== 0) {
            console.log('Restarting Python service...');
            setTimeout(startPredictionService, 5000);
        }
    });

    return pythonProcess;
};

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET /api/inventory');
    console.log('- POST /api/inventory');
    console.log('- GET /api/sales');
    console.log('- POST /api/sales');
    console.log('- GET /api/sales/stats/summary');
    console.log('- GET /api/predict/model-info');
    console.log('- POST /api/predict/forecast');
    console.log('- POST /api/auth/register');
    console.log('- POST /api/auth/login');

    // Start Python prediction service
    startPredictionService();
}); 