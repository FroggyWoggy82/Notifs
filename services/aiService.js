/**
 * AI Service
 * Handles interactions with OpenAI for AI analysis
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

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

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const DEFAULT_MODEL = 'gpt-4o-mini';

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
 * Get themes from memory entries
 * @param {Object} memory - Memory object with entries
 * @returns {string} Formatted string of themes from memory
 */
function getThemes(memory) {
    // Include all entries to maximize context
    return memory.entries.map(e => {
        // Prioritize summaries over full text to save space
        return `- Entry: ${e.date ? new Date(e.date).toLocaleDateString() : 'Unknown date'}: ${e.summary || 'No summary yet.'}`;
    }).join('\n');
}

/**
 * Query OpenAI API
 * @param {string} systemPrompt - The system prompt for the AI
 * @param {string} userMessage - The user message to send to OpenAI
 * @param {string} model - The model to use (default: gpt-4o-mini)
 * @returns {Promise<string>} The AI response
 */
async function queryOpenAI(systemPrompt, userMessage, model = DEFAULT_MODEL) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.');
        }

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error querying OpenAI:', error);
        if (error.code === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please check your billing and usage limits.');
        } else if (error.code === 'invalid_api_key') {
            throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
        } else {
            throw new Error(`Failed to query AI model: ${error.message}`);
        }
    }
}

/**
 * Check if memory contains specific information
 * @param {Object} memory - Memory object with entries
 * @param {string} text - Current journal entry text
 * @returns {string} Additional context based on memory
 */
function getSpecificMemoryContext(memory, text) {
    // This function now returns an empty string as we've simplified the prompt
    // and removed special handling for specific questions
    return '';
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

    const systemPrompt = `You are an empathetic AI therapist. You provide warm, understanding responses to journal entries.

Here are recent entries from this person's journal (IMPORTANT - read these carefully for context):
${themes}${specificContext}

Respond in a warm, empathetic, conversational tone. Reference information from previous entries when relevant. Never contradict information they've provided in previous entries.

At the end of your response, include up to 3 thoughtful questions that would help you better understand the person. Format these questions as:
[QUESTION 1: Your first question here]
[QUESTION 2: Your second question here]
[QUESTION 3: Your third question here]

Also include any insights you've gained about the person in this format:
[INSIGHT: Your insight about the person]

Finally, include a "[SUMMARY:]" at the end (which will be hidden from the user).`;

    const userMessage = `Today's journal entry: "${text}"`;

    const aiResponse = await queryOpenAI(systemPrompt, userMessage);

    // Extract summary from the response
    const summaryMatch = aiResponse.match(/\[SUMMARY:\s*(.+?)(?:\]|\n|$)/i);
    const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary generated';

    // Extract questions from the response
    const questions = [];
    const questionRegex = /\[QUESTION\s+(\d+):\s*(.+?)(?:\]|\n|$)/gi;
    let questionMatch;
    while ((questionMatch = questionRegex.exec(aiResponse)) !== null) {
        questions.push({
            number: parseInt(questionMatch[1]),
            text: questionMatch[2].trim()
        });
    }

    // Extract insights from the response
    const insights = [];
    const insightRegex = /\[INSIGHT:\s*(.+?)(?:\]|\n|$)/gi;
    let insightMatch;
    while ((insightMatch = insightRegex.exec(aiResponse)) !== null) {
        insights.push({
            text: insightMatch[1].trim()
        });
    }

    // Create a clean version of the response without the special tags
    let cleanResponse = aiResponse
        .replace(/\[QUESTION\s+\d+:\s*.+?(?:\]|\n|$)/gi, '')
        .replace(/\[INSIGHT:\s*.+?(?:\]|\n|$)/gi, '')
        .replace(/\[SUMMARY:\s*.+?(?:\]|\n|$)/gi, '')
        .trim();

    // Add entry to memory
    memory.entries.push({
        date: new Date().toISOString(),
        text: text.substring(0, 200) + (text.length > 200 ? '...' : ''), // Store truncated version
        summary
    });

    // Check if we need to consolidate memory entries
    const MAX_CONTEXT_CHARS = 100000; // Approximately 25K tokens

    // Calculate current context size
    const currentContextSize = memory.entries.reduce((total, entry) => {
        return total + (entry.summary ? entry.summary.length : 0) + 30; // Add 30 chars for date formatting
    }, 0);

    console.log(`Current memory context size: ${currentContextSize} characters (approx. ${Math.round(currentContextSize/4)} tokens)`);

    // If we're approaching the context limit, consolidate older entries
    if (currentContextSize > MAX_CONTEXT_CHARS * 0.8) { // 80% of max as a buffer
        console.log(`Memory context approaching limit (${currentContextSize}/${MAX_CONTEXT_CHARS}), consolidating older entries`);

        // Sort by date (oldest first)
        const sortedEntries = [...memory.entries].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Take the oldest 30% of entries for consolidation
        const consolidationCount = Math.max(5, Math.floor(sortedEntries.length * 0.3));
        const entriesToConsolidate = sortedEntries.slice(0, consolidationCount);
        const remainingEntries = sortedEntries.slice(consolidationCount);

        // Create a consolidated summary
        const consolidatedText = entriesToConsolidate.map(e => e.summary || '').join(' ');

        // Generate a meta-summary using the existing summaries
        const metaSummary = `Consolidated summary of ${consolidationCount} entries from ${
            new Date(entriesToConsolidate[0].date).toLocaleDateString()} to ${
            new Date(entriesToConsolidate[consolidationCount-1].date).toLocaleDateString()
        }: ${consolidatedText.substring(0, 500)}${consolidatedText.length > 500 ? '...' : ''}`;

        // Create a new consolidated entry
        const consolidatedEntry = {
            date: new Date(entriesToConsolidate[0].date).toISOString(),
            text: 'Consolidated entries',
            summary: metaSummary,
            isConsolidated: true,
            entryCount: consolidationCount
        };

        // Replace the original entries with the consolidated one
        memory.entries = [consolidatedEntry, ...remainingEntries];

        console.log(`Consolidated ${consolidationCount} entries into one meta-summary`);
    }

    saveMemory(memory);

    return {
        analysis: cleanResponse,
        summary,
        questions,
        insights
    };
}

/**
 * Get memory usage statistics
 * @returns {Object} Memory usage statistics
 */
function getMemoryStats() {
    const memory = loadMemory();

    // Calculate total size of memory file in KB
    const memoryFileSize = fs.existsSync(MEMORY_FILE)
        ? Math.round(fs.statSync(MEMORY_FILE).size / 1024)
        : 0;

    // Calculate average entry size
    const avgEntrySize = memory.entries.length > 0
        ? Math.round(memoryFileSize / memory.entries.length)
        : 0;

    // Calculate context size in characters
    const contextSize = memory.entries.reduce((total, entry) => {
        return total + (entry.summary ? entry.summary.length : 0) + 30; // Add 30 chars for date formatting
    }, 0);

    // Calculate estimated tokens (rough approximation: 4 chars = 1 token)
    const estimatedTokens = Math.round(contextSize / 4);

    // Count consolidated entries
    const consolidatedEntries = memory.entries.filter(e => e.isConsolidated);
    const totalConsolidatedEntries = consolidatedEntries.reduce((total, entry) => {
        return total + (entry.entryCount || 1);
    }, 0);

    // Calculate context efficiency (how many original entries are represented in the current context)
    const contextEfficiency = memory.entries.length > 0
        ? Math.round(((memory.entries.length - consolidatedEntries.length) + totalConsolidatedEntries) / memory.entries.length * 100)
        : 100;

    return {
        entryCount: memory.entries.length,
        totalSizeKB: memoryFileSize,
        avgEntrySizeKB: avgEntrySize,
        contextSizeChars: contextSize,
        estimatedTokens: estimatedTokens,
        consolidatedEntryCount: consolidatedEntries.length,
        originalEntryCount: (memory.entries.length - consolidatedEntries.length) + totalConsolidatedEntries,
        contextEfficiency: `${contextEfficiency}%`,
        maxContextChars: 100000, // Same as MAX_CONTEXT_CHARS in analyzeJournalEntry
        contextUtilization: `${Math.round(contextSize / 1000)}/${Math.round(100000 / 1000)}K chars (${Math.round(contextSize / 100000 * 100)}%)`,
        oldestEntry: memory.entries.length > 0
            ? new Date(memory.entries.sort((a, b) => new Date(a.date) - new Date(b.date))[0].date)
            : null,
        newestEntry: memory.entries.length > 0
            ? new Date(memory.entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date)
            : null
    };
}

module.exports = {
    analyzeJournalEntry,
    loadMemory,
    saveMemory,
    getMemoryStats
};
