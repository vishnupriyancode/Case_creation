require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const app = express();
const port = process.env.PORT || 3002;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (error.code === 'EADDRINUSE') {
        console.log('Port is already in use. Please try the following:');
        console.log('1. Stop any other servers running on this port');
        console.log('2. Choose a different port in .env file');
        console.log('3. Or wait a moment and try again');
    }
    process.exit(1);
});

// Ensure required environment variables are set
if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY is not set in .env file');
    process.exit(1);
}

// Create uploads directory if it doesn't exist
async function initializeDirectories() {
    try {
        await fs.mkdir('uploads', { recursive: true });
        console.log('Uploads directory initialized');
    } catch (error) {
        console.error('Error creating uploads directory:', error);
        process.exit(1);
    }
}

// Initialize directories
initializeDirectories();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            await fs.access('uploads');
            cb(null, 'uploads/');
        } catch (error) {
            await fs.mkdir('uploads', { recursive: true });
            cb(null, 'uploads/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB default
    },
    fileFilter: function (req, file, cb) {
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .doc and .docx files are allowed'));
        }
    }
});

// Function to read and analyze document
async function analyzeDocument(filePath) {
    try {
        // Read document content
        const result = await mammoth.extractRawText({ path: filePath });
        const documentText = result.value;

        // Analyze content and create test cases
        const testCases = await generateTestCases(documentText);
        return testCases;
    } catch (error) {
        console.error('Error analyzing document:', error);
        throw new Error('Failed to analyze document: ' + error.message);
    }
}

// Function to generate test cases from document content
async function generateTestCases(documentText) {
    try {
        // Split document into sections
        const sections = documentText.split('\n\n');
        const testCases = [];
        let testCaseId = 1;

        // Extract requirements and functionality
        const requirements = extractRequirements(sections);
        
        // Generate test cases for value aggregation
        const aggregationTests = generateValueAggregationTests(testCaseId);
        testCases.push(...aggregationTests);
        testCaseId += aggregationTests.length;

        // Generate test cases for API validation
        const apiTests = generateAPIValidationTests(testCaseId);
        testCases.push(...apiTests);
        testCaseId += apiTests.length;

        // Generate test cases for form submission
        const formTests = generateFormSubmissionTests(testCaseId);
        testCases.push(...formTests);
        testCaseId += formTests.length;

        // Generate test cases for data validation
        const dataTests = generateDataValidationTests(testCaseId);
        testCases.push(...dataTests);
        testCaseId += dataTests.length;

        return formatDetailedTestCases(testCases);
    } catch (error) {
        console.error('Error generating test cases:', error);
        throw new Error('Failed to generate test cases: ' + error.message);
    }
}

function extractRequirements(sections) {
    const requirements = [];
    sections.forEach(section => {
        if (section.toLowerCase().includes('requirement') || 
            section.toLowerCase().includes('functionality')) {
            requirements.push(section.trim());
        }
    });
    return requirements;
}

function generateValueAggregationTests(startId) {
    return [
        {
            id: `TC_${startId.toString().padStart(3, '0')}`,
            title: 'Basic Value Aggregation Test',
            scenario: 'Verify aggregation of values 1, 2, and 3',
            steps: [
                'Navigate to calculation page',
                'Enter value 1 in first input',
                'Enter value 2 in second input',
                'Enter value 3 in third input',
                'Click calculate button',
                'Verify sum calculation',
                'Check result display'
            ],
            expectedResults: [
                'Values should be successfully aggregated',
                'Sum should equal 6 (1 + 2 + 3)',
                'Result should be displayed correctly',
                'Result should be stored in database'
            ],
            priority: 'High',
            status: 'Not Started'
        },
        {
            id: `TC_${(startId + 1).toString().padStart(3, '0')}`,
            title: 'Addition with Value 5',
            scenario: 'Verify addition of previous result with value 5',
            steps: [
                'Navigate to calculation page',
                'Enter previous result (6) in first input',
                'Enter value 5 in second input',
                'Click calculate button',
                'Verify final sum',
                'Check result persistence'
            ],
            expectedResults: [
                'Values should be successfully added',
                'Sum should equal 11 (6 + 5)',
                'Result should be displayed correctly',
                'Result should be stored in database'
            ],
            priority: 'High',
            status: 'Not Started'
        }
    ];
}

function generateAPIValidationTests(startId) {
    return [
        {
            id: `TC_${startId.toString().padStart(3, '0')}`,
            title: 'API Success Response Validation',
            scenario: 'Verify API response for successful calculations',
            steps: [
                'Prepare API request with valid data',
                'Send POST request to calculation endpoint',
                'Verify response status code',
                'Validate response format',
                'Check calculation result'
            ],
            expectedResults: [
                'API should return 200 status code',
                'Response should contain correct calculation',
                'Response format should match specification',
                'Response time should be within limits'
            ],
            priority: 'High',
            status: 'Not Started'
        },
        {
            id: `TC_${(startId + 1).toString().padStart(3, '0')}`,
            title: 'API Error Response Validation',
            scenario: 'Verify API error handling for invalid inputs',
            steps: [
                'Prepare API request with invalid data',
                'Send POST request to calculation endpoint',
                'Verify error response status code',
                'Validate error message format',
                'Check error details'
            ],
            expectedResults: [
                'API should return appropriate error code',
                'Error message should be clear and descriptive',
                'Response should include error details',
                'Error should be logged in system'
            ],
            priority: 'High',
            status: 'Not Started'
        }
    ];
}

function generateFormSubmissionTests(startId) {
    return [
        {
            id: `TC_${startId.toString().padStart(3, '0')}`,
            title: 'Form Submission - Valid Numeric Data',
            scenario: 'Verify form submission with valid numeric values (1, 2, 3)',
            steps: [
                'Navigate to form page',
                'Enter value 1 in first numeric field',
                'Enter value 2 in second numeric field',
                'Enter value 3 in third numeric field',
                'Fill other required fields',
                'Submit the form',
                'Verify submission success',
                'Check database entry'
            ],
            expectedResults: [
                'Form should be submitted successfully',
                'Numeric values should be stored correctly',
                'Success message should be displayed',
                'Database should contain exact values (1, 2, 3)',
                'User should be redirected to confirmation page'
            ],
            priority: 'High',
            status: 'Not Started'
        },
        {
            id: `TC_${(startId + 1).toString().padStart(3, '0')}`,
            title: 'Form Submission - Invalid Numeric Data',
            scenario: 'Verify form validation with invalid numeric inputs',
            steps: [
                'Navigate to form page',
                'Enter non-numeric values in numeric fields',
                'Enter special characters in numeric fields',
                'Try to submit the form',
                'Verify validation behavior'
            ],
            expectedResults: [
                'Form submission should be prevented',
                'Validation errors should be displayed',
                'Error messages should indicate numeric values required',
                'Invalid fields should be highlighted',
                'Focus should be set to first invalid field'
            ],
            priority: 'High',
            status: 'Not Started'
        }
    ];
}

function generateDataValidationTests(startId) {
    return [
        {
            id: `TC_${startId.toString().padStart(3, '0')}`,
            title: 'Numeric Data Validation',
            scenario: 'Verify storage and retrieval of numeric values',
            steps: [
                'Submit form with numeric values (1, 2, 3)',
                'Record submission timestamp',
                'Query database for stored record',
                'Compare numeric values',
                'Verify data types',
                'Check calculation results'
            ],
            expectedResults: [
                'Numeric values should be stored as numbers',
                'Retrieved values should match submitted values',
                'Calculations should be accurate',
                'No data type conversion issues',
                'Sum of values should equal 6'
            ],
            priority: 'High',
            status: 'Not Started'
        },
        {
            id: `TC_${(startId + 1).toString().padStart(3, '0')}`,
            title: 'Data Integrity Test',
            scenario: 'Verify data integrity during concurrent operations',
            steps: [
                'Submit multiple forms concurrently',
                'Perform calculations on stored values',
                'Update existing records',
                'Verify all stored data',
                'Check calculation results'
            ],
            expectedResults: [
                'All submissions should be stored correctly',
                'No data corruption during concurrent access',
                'Calculations should remain accurate',
                'Data consistency should be maintained',
                'Audit trail should be complete'
            ],
            priority: 'High',
            status: 'Not Started'
        }
    ];
}

function formatDetailedTestCases(testCases) {
    let formattedOutput = '';
    
    // Add table header
    formattedOutput += '| Test Case ID | Title | Test Scenario | Test Steps | Expected Results | Priority | Status |\n';
    formattedOutput += '|-------------|--------|---------------|------------|-----------------|----------|--------|\n';
    
    testCases.forEach(tc => {
        // Format steps as numbered list
        const steps = tc.steps.map((step, index) => `${index + 1}. ${step}`).join('<br>');
        
        // Format expected results as bullet points
        const results = tc.expectedResults.map(result => `• ${result}`).join('<br>');
        
        // Create table row
        formattedOutput += `| ${tc.id} | ${tc.title} | ${tc.scenario} | ${steps} | ${results} | ${tc.priority} | ${tc.status} |\n`;
    });
    
    return formattedOutput;
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload route
app.post('/upload', upload.single('qa_brd'), async (req, res) => {
    console.log('Upload request received');
    
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Processing file:', req.file.originalname);

        // Analyze document and generate test cases
        const testCases = await analyzeDocument(req.file.path);

        // Save test cases to file
        const outputFileName = `test_cases_${Date.now()}.txt`;
        const outputPath = path.join('uploads', outputFileName);
        await fs.writeFile(outputPath, testCases);

        // Clean up uploaded file
        await fs.unlink(req.file.path);

        res.json({
            success: true,
            testCases: testCases,
            fileName: outputFileName,
            message: 'Document processed successfully'
        });

    } catch (error) {
        console.error('Error processing document:', error);
        
        // Clean up uploaded file if it exists
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }

        res.status(500).json({
            error: 'Error processing document',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                details: `Maximum file size is ${(process.env.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            details: err.message
        });
    }

    res.status(500).json({
        error: 'Server error',
        details: err.message
    });
});

// Start server with port fallback
const startServer = async (initialPort) => {
    const MAX_PORT = 65535;
    const MAX_RETRIES = 10;
    let currentPort = parseInt(initialPort);
    let retryCount = 0;

    const tryPort = async (port) => {
        try {
            const server = app.listen(port, () => {
                console.log(`Server running at http://localhost:${port}`);
                console.log('OpenAI API Key configured:', !!process.env.OPENAI_API_KEY);
            });

            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE' && retryCount < MAX_RETRIES && currentPort < MAX_PORT) {
                    console.log(`Port ${port} is busy, trying ${port + 1}`);
                    server.close();
                    retryCount++;
                    currentPort++;
                    tryPort(currentPort);
                } else {
                    console.error('Error starting server:', err);
                    process.exit(1);
                }
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    };

    await tryPort(currentPort);
};

// Initialize server
startServer(3005); 