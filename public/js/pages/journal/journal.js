document.addEventListener('DOMContentLoaded', function() {

    const journalDateInput = document.getElementById('journal-date');
    const journalContentTextarea = document.getElementById('journal-content');
    const saveEntryButton = document.getElementById('save-entry');
    const analyzeEntryButton = document.getElementById('analyze-entry');
    const entryListElement = document.getElementById('entry-list');
    const analysisContentElement = document.getElementById('analysis-content');
    const statusMessage = document.getElementById('status-message');
    const wordCountElement = document.getElementById('word-count');

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
    journalDateInput.value = formattedDate;
    console.log('Setting journal date to local date:', formattedDate);

    loadEntries();
    loadMemoryEntries();

    saveEntryButton.addEventListener('click', saveEntry);
    analyzeEntryButton.addEventListener('click', analyzeEntry);
    journalDateInput.addEventListener('change', loadEntryForDate);
    journalContentTextarea.addEventListener('input', updateWordCount);

    updateWordCount();

    const testOllamaButton = document.getElementById('test-ollama');
    if (testOllamaButton) {
        testOllamaButton.addEventListener('click', testOllama);
    }

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

            let themes = '';
            let memoryEntries = [];
            try {
                const memoryResponse = await fetch('/api/journal/memory');
                if (memoryResponse.ok) {
                    memoryEntries = await memoryResponse.json();

                    themes = memoryEntries.map(e => {
                        return `- Entry: "${e.text || ''}"\n  Summary: ${e.summary || 'No summary yet.'}`;
                    }).join('\n');
                }
            } catch (memoryError) {
                console.error('Error fetching memory:', memoryError);

            }

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

            function getSpecificMemoryContext(entries, text) {


                return '';
            }

            const specificContext = getSpecificMemoryContext(memoryEntries, content);

            const prompt = `
            You are a direct, forward-thinking AI therapist. Tell it like it is; don't sugar-coat responses. Take a forward-thinking view and focus on actionable insights and growth.

            Here are recent entries from this person's journal (READ THESE CAREFULLY - they contain important context):
            ${themes}${specificContext}

            Today's journal entry:
            "${content}"

            Be honest, constructive, and solution-oriented. Reference information from previous entries when relevant. Never contradict information they've provided in previous entries. Challenge them when appropriate and push for meaningful progress.

            At the very end, include a one-sentence summary of this entry prefixed with [SUMMARY:] that I can use to track themes (this will be hidden from the user).
            `;

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

            const summaryMatch = aiResponse.match(/\[SUMMARY:\s*(.+?)\]/i);
            const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary generated';

            const questions = [];
            const questionRegex = /\[QUESTION\s+(\d+):\s*(.+?)(?:\]|\n|$)/gi;
            let questionMatch;
            while ((questionMatch = questionRegex.exec(aiResponse)) !== null) {
                questions.push({
                    number: parseInt(questionMatch[1]),
                    text: questionMatch[2].trim()
                });
            }

            const insights = [];
            const insightRegex = /\[INSIGHT:\s*(.+?)(?:\]|\n|$)/gi;
            let insightMatch;
            while ((insightMatch = insightRegex.exec(aiResponse)) !== null) {
                insights.push({
                    text: insightMatch[1].trim()
                });
            }

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

            }

            const formattedAnalysis = formatAIAnalysis(aiResponse, questions);
            analysisContentElement.innerHTML = formattedAnalysis;

            showStatus('AI analysis complete!', 'success');

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

                }
            }
        } catch (error) {
            console.error('Error analyzing journal entry:', error);
            showStatus(`Error analyzing journal entry: ${error.message}`, 'error');
            analysisContentElement.innerHTML = '<p class="placeholder">Failed to analyze entry. Please try again.</p>';
        }
    }

    function formatAIAnalysis(analysisText, questions = []) {

        const summaryMatch = analysisText.match(/\[SUMMARY:\s*(.+?)\]/i);
        let formatted = analysisText;

        if (summaryMatch) {

            formatted = formatted.replace(/\[SUMMARY:\s*.+?\]/i, '');
        }

        formatted = formatted.replace(/\[QUESTION\s+\d+:\s*.+?(?:\]|\n|$)/gi, '');

        formatted = formatted.replace(/\[INSIGHT:\s*.+?(?:\]|\n|$)/gi, '');

        formatted = formatted.replace(/\n/g, '<br>');

        formatted = formatted.replace(/^([A-Za-z\s]+:)/gm, '$1');

        let questionsHTML = '';
        if (questions && questions.length > 0) {
            questionsHTML = `
                <div class="ai-questions">
                    <h3>Questions to Consider:</h3>
                    <ul>
                        ${questions.map(q => `<li>${q.text}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        return `
            <div class="ai-analysis-conversation">
                ${formatted}
                ${questionsHTML}
            </div>
        `;
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

        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        entries.forEach(entry => {
            const li = document.createElement('li');
            li.dataset.date = entry.date;
            li.dataset.id = entry.id;

            const entryDate = new Date(entry.date);
            const formattedDate = entryDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

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

        journalDateInput.value = entry.date;

        journalContentTextarea.value = entry.content;

        updateWordCount();

        analysisContentElement.innerHTML = '<p class="placeholder">AI analysis will appear here after you analyze your entry.</p>';

        window.scrollTo(0, 0);
    }

    async function loadEntryForDate() {
        const selectedDate = journalDateInput.value;

        try {
            const response = await fetch(`/api/journal/date/${selectedDate}`);

            if (response.status === 404) {

                journalContentTextarea.value = '';

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

            updateWordCount();

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


        } catch (error) {
            console.error('Error loading memory entries:', error);


        }
    }

    function updateWordCount() {
        const text = journalContentTextarea.value.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        wordCountElement.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
    }

    async function testOllama() {
        try {
            showStatus('Testing Ollama connection...', 'info');
            analysisContentElement.innerHTML = '<p>Testing Ollama connection...</p>';

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
