(function initAgriPlannerConfig(global) {
    'use strict';

    const existing = global.CONFIG || {};
    let storedApiBase = '';
    let storedGroqKey = '';

    try {
        storedApiBase = global.localStorage.getItem('AGRIPLANNER_API_BASE_URL') || '';
        storedGroqKey = global.localStorage.getItem('AGRIPLANNER_GROQ_API_KEY') || '';
    } catch (error) {
        // Ignore storage access issues in restricted browsing contexts.
    }

    const CONFIG = {
        API_BASE_URL: existing.API_BASE_URL || storedApiBase || 'http://localhost:8080/api',
        GROQ_API_URL: existing.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
        GROQ_MODEL: existing.GROQ_MODEL || 'llama-3.3-70b-versatile',
        GROQ_API_KEY: existing.GROQ_API_KEY || storedGroqKey || ''
    };

    global.CONFIG = Object.assign({}, existing, CONFIG);
    global.API_BASE_URL = global.CONFIG.API_BASE_URL;
})(window);
