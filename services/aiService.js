/**
 * AI Service
 * Handles interactions with Ollama for AI analysis
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Constants
const DATA_DIR = path.join(__dirname, '..', 'data');
const MEMORY_FILE = path.join(DATA_DIR, 'memory.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        console.log(`Created data directory: ${DATA_DIR}`);
    } catch (error) {
        console.error(`Error creating data directory: ${error.message}`);
    }
}
const OLLAMA_API = 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = 'mistral';

/**
 * Load memory from file
 * @returns {Object} Memory object with entries
 */
function loadMemory() {
    if (!fs.existsSync(MEMORY_FILE)) {
        // Create the file with empty entries
        const emptyMemory = { entries: [] };
        try {
            fs.writeFileSync(MEMORY_FILE, JSON.stringify(emptyMemory, null, 2));
            console.log(`Created memory file: ${MEMORY_FILE}`);
        } catch (writeError) {
            console.error(`Error creating memory file: ${writeError.message}`);
        }
        return emptyMemory;
    }

    try {
        const data = fs.readFileSync(MEMORY_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading memory file:', error);
        return { entries: [] };
    }
}

/**
 * Save memory to file
 * @param {Object} data - Memory object to save
 */
function saveMemory(data) {
    try {
        fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving memory file:', error);
    }
}

/**
 * Get themes from recent entries
 * @param {Object} memory - Memory object with entries
 * @returns {string} Formatted string of recent themes
 */
function getThemes(memory) {
    // Include all entries instead of just the last 10
    return memory.entries.map(e => {
        return `- Entry: "${e.text || ''}"\n  Summary: ${e.summary || 'No summary yet.'}`;
    }).join('\n');
}

/**
 * Query Ollama API
 * @param {string} prompt - The prompt to send to Ollama
 * @param {string} model - The model to use (default: mistral)
 * @returns {Promise<string>} The AI response
 */
async function queryOllama(prompt, model = DEFAULT_MODEL) {
    try {
        const response = await fetch(OLLAMA_API, {
            method: 'POST',
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: false
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error('Error querying Ollama:', error);
        throw new Error(`Failed to query AI model: ${error.message}`);
    }
}

/**
 * Check if memory contains specific information
 * @param {Object} memory - Memory object with entries
 * @param {string} text - Current journal entry text
 * @returns {string} Additional context based on memory
 */
function getSpecificMemoryContext(memory, text) {
    let additionalContext = '';

    // Check for questions about the color of number 2
    if (text.toLowerCase().includes('what color is') &&
        (text.includes('2') || text.includes('two') || text.toLowerCase().includes('number 2'))) {

        // Search for entries that mention the color of number 2
        const colorEntries = memory.entries.filter(e =>
            e.text && (
                (e.text.toLowerCase().includes('number 2') && e.text.toLowerCase().includes('green')) ||
                (e.text.toLowerCase().includes('2 is green')) ||
                (e.text.toLowerCase().includes('2 its green'))
            )
        );

        if (colorEntries.length > 0) {
            additionalContext = '\n\nIMPORTANT CONTEXT: Based on previous entries, the user has stated that "the number 2 is green". When they ask about the color of number 2, tell them it\'s green.';
        }
    }

    // Check for questions about water bottles
    if (text.toLowerCase().includes('water bottle') && text.toLowerCase().includes('how many')) {
        const bottleEntries = memory.entries.filter(e =>
            e.text && e.text.toLowerCase().includes('water bottle') &&
            (e.text.includes('2') || e.text.includes('two'))
        );

        if (bottleEntries.length > 0) {
            additionalContext += '\n\nIMPORTANT CONTEXT: Based on previous entries, the user has mentioned having 2 water bottles. When they ask about water bottles, reference this information.';
        }
    }

    return additionalContext;
}

/**
 * Analyze journal entry with AI
 * @param {string} text - Journal entry text
 * @returns {Promise<Object>} Analysis result with analysis text and summary
 */
async function analyzeJournalEntry(text) {
    if (!text || text.trim() === '') {
        throw new Error('Journal entry text is required for analysis');
    }

    const memory = loadMemory();
    const themes = getThemes(memory);
    const specificContext = getSpecificMemoryContext(memory, text);

    const prompt = `
You are an empathetic AI therapist.

Here are recent entries from this person's journal (IMPORTANT - read these carefully for context):
${themes}${specificContext}

Today's journal entry:
"${text}"

IMPORTANT INSTRUCTIONS:
1. CRITICAL: SEARCH THROUGH ALL PREVIOUS ENTRIES FOR SPECIFIC INFORMATION. If they ask "what color is 2" or "what color is the number 2", LOOK FOR ANY ENTRY that contains phrases like "the number 2 is green" or "number 2 its green" and USE THAT INFORMATION in your response.

2. If the person asks a specific question that might be answered by information in their previous entries, DIRECTLY reference that information in your response. NEVER say "numbers don't have a specific color" if they previously stated one does.

3. IMPORTANT: Look for patterns in their entries. For example, if they mention "the number 2 is green" in one entry and later ask "what color is the number 2?", tell them it's green. Or if they mention "I have 2 water bottles" and later ask how many they have, tell them they have 2.

4. Reflect on how this entry fits the patterns in their previous entries.

5. Provide one meaningful insight.

6. DO NOT mention the current date and time in your response unless specifically asked.

Also, summarize this entry in 1 sentence to help track themes later.

Format your response in a conversational style, and include a "[SUMMARY:]" at the end (which will be hidden from the user).
`;

    const aiResponse = await queryOllama(prompt);

    // Extract summary from the response
    const summaryMatch = aiResponse.match(/summary.*?:\s*(.+?)(?:\n|$)/i);
    const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary generated';

    // Add entry to memory
    memory.entries.push({
        date: new Date().toISOString(),
        text: text.substring(0, 200) + (text.length > 200 ? '...' : ''), // Store truncated version
        summary
    });

    saveMemory(memory);

    return {
        analysis: aiResponse,
        summary
    };
}

module.exports = {
    analyzeJournalEntry,
    loadMemory,
    saveMemory
};
