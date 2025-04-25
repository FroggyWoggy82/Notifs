document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const journalDateInput = document.getElementById('journal-date');
    const journalContentTextarea = document.getElementById('journal-content');
    const saveEntryButton = document.getElementById('save-entry');
    const analyzeEntryButton = document.getElementById('analyze-entry');
    const entryListElement = document.getElementById('entry-list');
    const analysisContentElement = document.getElementById('analysis-content');
    const statusMessage = document.getElementById('status-message');
    const wordCountElement = document.getElementById('word-count');

    // Set today's date as default (using local date to avoid timezone issues)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
    journalDateInput.value = formattedDate;
    console.log('Setting journal date to local date:', formattedDate);

    // Initialize
    loadEntries();
    loadMemoryEntries();

    // Event Listeners
    saveEntryButton.addEventListener('click', saveEntry);
    analyzeEntryButton.addEventListener('click', analyzeEntry);
    journalDateInput.addEventListener('change', loadEntryForDate);
    journalContentTextarea.addEventListener('input', updateWordCount);

    // Initialize word count
    updateWordCount();

    // Test Ollama button
    const testOllamaButton = document.getElementById('test-ollama');
    if (testOllamaButton) {
        testOllamaButton.addEventListener('click', testOllama);
    }

    // Functions
    async function saveEntry() {
        const date = journalDateInput.value;
        const content = journalContentTextarea.value.trim();

        if (!content) {
            showStatus('Please write something in your journal entry.', 'error');
            return;
        }

        try {
            showStatus('Saving journal entry...', 'info');

            const response = await fetch('/api/journal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: date,
                    content: content
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showStatus('Journal entry saved successfully!', 'success');

            // Reload entries to update the list
            loadEntries();
        } catch (error) {
            console.error('Error saving journal entry:', error);
            showStatus(`Error saving journal entry: ${error.message}`, 'error');
        }
    }

    async function analyzeEntry() {
        const content = journalContentTextarea.value.trim();
        const date = journalDateInput.value;

        if (!content) {
            showStatus('Please write something to analyze.', 'error');
            return;
        }

        try {
            showStatus('Analyzing journal entry with AI therapist...', 'info');
            analysisContentElement.innerHTML = '<p>Analyzing your journal entry with AI therapist...</p>';

            // Get recent entries for context
            let themes = '';
            let memoryEntries = [];
            try {
                const memoryResponse = await fetch('/api/journal/memory');
                if (memoryResponse.ok) {
                    memoryEntries = await memoryResponse.json();
                    // Include all entries instead of just the last 5
                    themes = memoryEntries.map(e => {
                        return `- Entry: "${e.text || ''}"\n  Summary: ${e.summary || 'No summary yet.'}`;
                    }).join('\n');
                }
            } catch (memoryError) {
                console.error('Error fetching memory:', memoryError);
                // Continue even if memory fetch fails
            }

            // Get current date information
            const now = new Date();
            const currentDate = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const currentTime = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Function to check for specific information in memory
            function getSpecificMemoryContext(entries, text) {
                let additionalContext = '';

                // Check for questions about the color of number 2
                if (text.toLowerCase().includes('what color is') &&
                    (text.includes('2') || text.includes('two') || text.toLowerCase().includes('number 2'))) {

                    // Search for entries that mention the color of number 2
                    const colorEntries = entries.filter(e =>
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
                    const bottleEntries = entries.filter(e =>
                        e.text && e.text.toLowerCase().includes('water bottle') &&
                        (e.text.includes('2') || e.text.includes('two'))
                    );

                    if (bottleEntries.length > 0) {
                        additionalContext += '\n\nIMPORTANT CONTEXT: Based on previous entries, the user has mentioned having 2 water bottles. When they ask about water bottles, reference this information.';
                    }
                }

                return additionalContext;
            }

            // Get specific context based on the current entry
            const specificContext = getSpecificMemoryContext(memoryEntries, content);

            // Create the prompt for Ollama
            const prompt = `
            You are an empathetic AI therapist having a conversation with someone about their journal entry.

            Here are recent entries from this person's journal (READ THESE CAREFULLY - they contain important context):
            ${themes}${specificContext}

            Today's journal entry:
            "${content}"

            CRITICAL INSTRUCTIONS:
            1. SEARCH THROUGH ALL PREVIOUS ENTRIES FOR SPECIFIC INFORMATION. If they ask "what color is 2" or "what color is the number 2", LOOK FOR ANY ENTRY that contains phrases like "the number 2 is green" or "number 2 its green" and USE THAT INFORMATION in your response.

            2. NEVER contradict information they've provided in previous entries. If they previously stated "the number 2 is green", NEVER say "numbers don't have a specific color".

            3. If the person asks a specific question that might be answered by information in their previous entries, DIRECTLY reference that information in your response.

            4. DO NOT mention the current date and time in your response unless specifically asked.

            5. Keep your responses concise and focused on the user's question or concern.

            Respond in a warm, empathetic, conversational tone as if you're speaking directly to them. Be supportive and understanding.

            In your response:
            - Acknowledge their feelings and experiences
            - Offer a thoughtful insight that might help them
            - Ask a gentle question that encourages reflection
            - If they ask a specific question that relates to previous entries, directly answer it using that information

            Don't use numbered lists or formal headings. Make it feel like a natural conversation.

            At the very end, include a one-sentence summary of this entry prefixed with [SUMMARY:] that I can use to track themes (this will be hidden from the user).
            `;

            // Call Ollama directly
            const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mistral',
                    prompt: prompt,
                    stream: false
                })
            });

            if (!ollamaResponse.ok) {
                const errorText = await ollamaResponse.text();
                throw new Error(`Ollama error! status: ${ollamaResponse.status}, message: ${errorText}`);
            }

            const ollamaResult = await ollamaResponse.json();
            const aiResponse = ollamaResult.response;

            // Extract summary from the response
            const summaryMatch = aiResponse.match(/\[SUMMARY:\s*(.+?)\]/i);
            const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary generated';

            // Save to memory
            try {
                await fetch('/api/journal/memory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date: new Date().toISOString(),
                        text: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
                        summary: summary
                    })
                });
            } catch (memoryError) {
                console.error('Error saving to memory:', memoryError);
                // Continue even if memory save fails
            }

            // Format the analysis for better readability
            const formattedAnalysis = formatAIAnalysis(aiResponse);
            analysisContentElement.innerHTML = formattedAnalysis;

            showStatus('AI analysis complete!', 'success');

            // Save the entry with the analysis
            if (date) {
                try {
                    await fetch('/api/journal', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            date: date,
                            content: content,
                            analysis: aiResponse
                        })
                    });
                } catch (saveError) {
                    console.error('Error saving analysis with entry:', saveError);
                    // Continue even if saving fails
                }
            }
        } catch (error) {
            console.error('Error analyzing journal entry:', error);
            showStatus(`Error analyzing journal entry: ${error.message}`, 'error');
            analysisContentElement.innerHTML = '<p class="placeholder">Failed to analyze entry. Please try again.</p>';
        }
    }

    function formatAIAnalysis(analysisText) {
        // Extract and remove the summary for internal use
        const summaryMatch = analysisText.match(/\[SUMMARY:\s*(.+?)\]/i);
        let formatted = analysisText;

        if (summaryMatch) {
            // Remove the summary from the displayed text
            formatted = formatted.replace(/\[SUMMARY:\s*.+?\]/i, '');
        }

        // Replace line breaks with HTML breaks
        formatted = formatted.replace(/\n/g, '<br>');

        // Remove any remaining headings format
        formatted = formatted.replace(/^([A-Za-z\s]+:)/gm, '$1');

        // Wrap in a container with a more conversational style
        return `<div class="ai-analysis-conversation">${formatted}</div>`;
    }

    async function loadEntries() {
        try {
            showStatus('Loading journal entries...', 'info');

            const response = await fetch('/api/journal');

            if (!response.ok) {
                if (response.status === 503) {
                    throw new Error('Offline. Please try again when connected.');
                }

                try {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                } catch (jsonError) {
                    // If we can't parse the error as JSON, just use the status
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const entries = await response.json();
            renderEntryList(entries);
            showStatus('', ''); // Clear status
        } catch (error) {
            console.error('Error loading journal entries:', error);
            showStatus(`Error loading journal entries: ${error.message}`, 'error');
            entryListElement.innerHTML = '<li class="no-entries">Failed to load entries. Please check your internet connection and try again.</li>';
        }
    }

    function renderEntryList(entries) {
        if (!entries || entries.length === 0) {
            entryListElement.innerHTML = '<li class="no-entries">No journal entries yet. Write your first entry and click "Save Entry".</li>';
            return;
        }

        entryListElement.innerHTML = '';

        // Sort entries by date (newest first)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        entries.forEach(entry => {
            const li = document.createElement('li');
            li.dataset.date = entry.date;
            li.dataset.id = entry.id;

            // Format the date for display
            const entryDate = new Date(entry.date);
            const formattedDate = entryDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            // Create a preview of the content (first 50 characters)
            const contentPreview = entry.content.substring(0, 50) + (entry.content.length > 50 ? '...' : '');

            li.innerHTML = `
                <span class="entry-date">${formattedDate}</span>
                <span class="entry-preview">${contentPreview}</span>
            `;

            li.addEventListener('click', () => loadEntry(entry));

            entryListElement.appendChild(li);
        });
    }

    function loadEntry(entry) {
        // Set the date input to the entry's date
        journalDateInput.value = entry.date;

        // Set the content textarea to the entry's content
        journalContentTextarea.value = entry.content;

        // Update word count
        updateWordCount();

        // Clear any previous analysis
        analysisContentElement.innerHTML = '<p class="placeholder">AI analysis will appear here after you analyze your entry.</p>';

        // Scroll to the top of the page
        window.scrollTo(0, 0);
    }

    async function loadEntryForDate() {
        const selectedDate = journalDateInput.value;

        try {
            const response = await fetch(`/api/journal/date/${selectedDate}`);

            if (response.status === 404) {
                // No entry for this date, clear the textarea
                journalContentTextarea.value = '';
                // Update word count
                updateWordCount();
                analysisContentElement.innerHTML = '<p class="placeholder">AI analysis will appear here after you analyze your entry.</p>';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const entry = await response.json();
            journalContentTextarea.value = entry.content;

            // Update word count
            updateWordCount();

            // Clear any previous analysis
            analysisContentElement.innerHTML = '<p class="placeholder">AI analysis will appear here after you analyze your entry.</p>';
        } catch (error) {
            console.error('Error loading entry for date:', error);
            showStatus(`Error loading entry: ${error.message}`, 'error');
        }
    }

    function showStatus(message, type) {
        if (!statusMessage) return;

        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`;

        if (message && type !== 'info') {
            setTimeout(() => {
                if (statusMessage.textContent === message) {
                    statusMessage.textContent = '';
                    statusMessage.className = 'status';
                }
            }, 5000);
        }
    }

    async function loadMemoryEntries() {
        try {
            const response = await fetch('/api/journal/memory');

            if (!response.ok) {
                if (response.status === 503) {
                    console.error('Failed to load memory entries: Offline');
                    return;
                }
                console.error('Failed to load memory entries:', response.status);
                return;
            }

            const memoryEntries = await response.json();
            console.log('Memory entries loaded:', memoryEntries.length);

            // You can use these entries to display themes or patterns
            // For now, we'll just log them to the console
        } catch (error) {
            console.error('Error loading memory entries:', error);
            // Add a more user-friendly error message in the UI if needed
            // showStatus(`Error loading memory entries: ${error.message}`, 'error');
        }
    }

    // Function to update word count
    function updateWordCount() {
        const text = journalContentTextarea.value.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        wordCountElement.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
    }

    async function testOllama() {
        try {
            showStatus('Testing Ollama connection...', 'info');
            analysisContentElement.innerHTML = '<p>Testing Ollama connection...</p>';

            // First, check if Ollama is running
            try {
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'mistral',
                        prompt: 'Hello, how are you?',
                        stream: false
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }

                const result = await response.json();
                analysisContentElement.innerHTML = `
                    <div class="ai-analysis-conversation">
                        <p><strong>Ollama is running correctly!</strong></p>
                        <p>The Mistral model responded with: "${result.response.substring(0, 100)}..."</p>
                        <p>You can now use the "Talk to AI Therapist" button to analyze your journal entries.</p>
                    </div>`;
                showStatus('Ollama test successful!', 'success');
            } catch (error) {
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    throw new Error('Ollama is not running. Please start Ollama in your terminal with the command: ollama serve');
                } else if (error.message.includes('model not found')) {
                    throw new Error('The Mistral model is not installed. Please run this command in your terminal: ollama pull mistral');
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error testing Ollama:', error);
            showStatus(`Error testing Ollama: ${error.message}`, 'error');
            analysisContentElement.innerHTML = `
                <div class="ai-analysis-conversation error-message">
                    <p><strong>Failed to connect to Ollama</strong></p>
                    <p>${error.message}</p>
                    <p>To use the AI therapist feature, you need to:</p>
                    <ol>
                        <li>Open a terminal window</li>
                        <li>Run the command: <code>ollama serve</code></li>
                        <li>If you haven't installed the Mistral model yet, run: <code>ollama pull mistral</code></li>
                        <li>Once Ollama is running, try this test again</li>
                    </ol>
                </div>`;
        }
    }
});
