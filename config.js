// config.js - Configuration and Constants
const CONFIG = {
    // Google Apps Script Web App URL (Deploy as web app)
    GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
    
    // Test Configuration
    TEST_CONFIG: {
        PRT: {
            subjects: ['Mathematics', 'Environmental Science', 'Computer Science', 'Marathi', 'Hindi', 'English']
        },
        TGT: {
            subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'SST', 'Computer', 'Marathi', 'Hindi', 'English']
        },
        commonSections: [
            { name: 'Teacher Aptitude', questions: 5, bank: 10 },
            { name: 'Computer Knowledge', questions: 5, bank: 10 },
            { name: 'Basic English', questions: 5, bank: 10 },
            { name: 'Classroom Management', questions: 5, bank: 10 }
        ],
        subjectSection: { name: 'Subject Specific', questions: 20, bank: 40 },
        totalTime: 90 * 60, // 90 minutes in seconds
        marksPerQuestion: 1,
        negativeMarking: 0.25
    },
    
    // Security
    TOKEN_LENGTH: 10,
    SESSION_TIMEOUT: 120 * 60 * 1000, // 120 minutes
    MAX_ATTEMPTS: 1
};

// Question Banks (In real implementation, these would be loaded from server)
const QUESTION_BANKS = {
    common: {
        'Teacher Aptitude': Array.from({length: 10}, (_, i) => ({
            id: `TA${i+1}`,
            question: `Teacher Aptitude Question ${i+1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: Math.floor(Math.random() * 4)
        })),
        'Computer Knowledge': Array.from({length: 10}, (_, i) => ({
            id: `CK${i+1}`,
            question: `Computer Knowledge Question ${i+1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: Math.floor(Math.random() * 4)
        })),
        'Basic English': Array.from({length: 10}, (_, i) => ({
            id: `BE${i+1}`,
            question: `Basic English Question ${i+1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: Math.floor(Math.random() * 4)
        })),
        'Classroom Management': Array.from({length: 10}, (_, i) => ({
            id: `CM${i+1}`,
            question: `Classroom Management Question ${i+1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: Math.floor(Math.random() * 4)
        }))
    },
    subject: {
        'Mathematics': Array.from({length: 40}, (_, i) => ({
            id: `MATH${i+1}`,
            question: `Mathematics Question ${i+1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: Math.floor(Math.random() * 4)
        })),
        'Physics': Array.from({length: 40}, (_, i) => ({
            id: `PHY${i+1}`,
            question: `Physics Question ${i+1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: Math.floor(Math.random() * 4)
        })),
        // Add other subject question banks similarly
    }
};

export { CONFIG, QUESTION_BANKS };
