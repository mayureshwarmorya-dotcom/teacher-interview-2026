// test-system.js - Main Test Engine
import { CONFIG, QUESTION_BANKS } from './config.js';

class TestSystem {
    constructor() {
        this.candidateData = null;
        this.testConfig = null;
        this.questions = [];
        this.responses = {};
        this.startTime = null;
        this.timerInterval = null;
        this.currentSection = 0;
        this.currentQuestion = 0;
    }
    
    async initialize(couponCode) {
        // Load candidate data and generate test
        this.candidateData = await this.loadCandidateData(couponCode);
        this.testConfig = this.generateTestConfig();
        this.questions = this.generateQuestionSet();
        this.initializeResponses();
        
        return {
            candidate: this.candidateData,
            config: this.testConfig,
            questions: this.questions
        };
    }
    
    async loadCandidateData(couponCode) {
        // In production, fetch from Google Sheets via Apps Script
        const storedData = sessionStorage.getItem('candidateData');
        if (storedData) {
            return JSON.parse(storedData);
        }
        
        // Simulate API call
        return {
            name: "Demo Candidate",
            employeeCode: "EMP123456",
            post: "PRT",
            subject: "Mathematics",
            couponCode: couponCode
        };
    }
    
    generateTestConfig() {
        const config = JSON.parse(JSON.stringify(CONFIG.TEST_CONFIG));
        
        // Add candidate-specific info
        config.candidate = {
            name: this.candidateData.fullName,
            post: this.candidateData.postType,
            subject: this.candidateData.subject
        };
        
        return config;
    }
    
    generateQuestionSet() {
        const questions = [];
        const usedQuestionIds = new Set();
        
        // Generate common section questions
        CONFIG.TEST_CONFIG.commonSections.forEach(section => {
            const sectionQuestions = this.selectRandomQuestions(
                QUESTION_BANKS.common[section.name],
                section.questions,
                usedQuestionIds
            );
            
            questions.push({
                section: section.name,
                type: 'common',
                questions: this.shuffleArray(sectionQuestions)
            });
        });
        
        // Generate subject-specific questions
        const subjectQuestions = this.selectRandomQuestions(
            QUESTION_BANKS.subject[this.candidateData.subject] || QUESTION_BANKS.subject.Mathematics,
            CONFIG.TEST_CONFIG.subjectSection.questions,
            usedQuestionIds
        );
        
        questions.push({
            section: `${this.candidateData.subject} (Subject Specific)`,
            type: 'subject',
            questions: this.shuffleArray(subjectQuestions)
        });
        
        return questions;
    }
    
    selectRandomQuestions(questionBank, count, usedIds) {
        const availableQuestions = questionBank.filter(q => !usedIds.has(q.id));
        const shuffled = this.shuffleArray([...availableQuestions]);
        const selected = shuffled.slice(0, count);
        
        // Mark as used
        selected.forEach(q => usedIds.add(q.id));
        
        return selected;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    initializeResponses() {
        this.questions.forEach(section => {
            section.questions.forEach(question => {
                this.responses[question.id] = {
                    selected: -1,
                    isCorrect: null,
                    timeTaken: 0
                };
            });
        });
    }
    
    startTimer(duration) {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const remaining = duration - elapsed;
            
            if (remaining <= 0) {
                this.autoSubmit();
                return;
            }
            
            this.updateTimerDisplay(remaining);
        }, 1000);
    }
    
    updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    recordResponse(questionId, optionIndex, timeTaken) {
        if (this.responses[questionId]) {
            this.responses[questionId].selected = optionIndex;
            this.responses[questionId].timeTaken = timeTaken;
        }
    }
    
    calculateResults() {
        let totalCorrect = 0;
        let totalWrong = 0;
        let totalUnattempted = 0;
        const sectionWise = {};
        
        this.questions.forEach(section => {
            let sectionCorrect = 0;
            let sectionWrong = 0;
            
            section.questions.forEach(question => {
                const response = this.responses[question.id];
                
                if (response.selected === -1) {
                    totalUnattempted++;
                } else if (response.selected === question.correct) {
                    totalCorrect++;
                    sectionCorrect++;
                    response.isCorrect = true;
                } else {
                    totalWrong++;
                    sectionWrong++;
                    response.isCorrect = false;
                }
            });
            
            sectionWise[section.section] = {
                total: section.questions.length,
                correct: sectionCorrect,
                wrong: sectionWrong,
                score: sectionCorrect - (sectionWrong * CONFIG.TEST_CONFIG.negativeMarking)
            };
        });
        
        const totalScore = totalCorrect - (totalWrong * CONFIG.TEST_CONFIG.negativeMarking);
        const percentage = (totalScore / (this.questions.flatMap(s => s.questions).length)) * 100;
        
        return {
            totalCorrect,
            totalWrong,
            totalUnattempted,
            totalScore,
            percentage: percentage.toFixed(2),
            sectionWise,
            responses: this.responses,
            timeTaken: Math.floor((Date.now() - this.startTime) / 1000)
        };
    }
    
    async submitTest() {
        clearInterval(this.timerInterval);
        
        const results = this.calculateResults();
        const submissionData = {
            candidate: this.candidateData,
            testConfig: this.testConfig,
            questions: this.questions,
            responses: this.responses,
            results: results,
            submissionTime: new Date().toISOString()
        };
        
        // Save to Google Sheets
        await this.saveResults(submissionData);
        
        return results;
    }
    
    async saveResults(data) {
        // In production, send to Google Apps Script
        const payload = {
            action: 'submitTest',
            data: data
        };
        
        try {
            // const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            //     method: 'POST',
            //     body: JSON.stringify(payload)
            // });
            
            // Store in session for result page
            sessionStorage.setItem('testResults', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save results:', error);
            throw error;
        }
    }
    
    autoSubmit() {
        clearInterval(this.timerInterval);
        alert('Time is up! Test will be submitted automatically.');
        this.submitTest().then(() => {
            window.location.href = 'result.html';
        });
    }
}

export default TestSystem;
