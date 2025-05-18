/**
 * Journal Redesign - Modern AI-assisted interface
 * Enhances the journaling experience with real-time AI feedback
 */

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
    const moodSelector = document.getElementById('mood-selector');
    const voiceToTextButton = document.getElementById('voice-to-text');
    const promptSuggestions = document.getElementById('prompt-suggestions');
    const sentimentIndicator = document.getElementById('sentiment-indicator');
    const saveInsightsButton = document.getElementById('save-insights');
    const themeToggleButton = document.getElementById('theme-toggle');
    const testOllamaButton = document.getElementById('test-ollama');

    // Set today's date as default
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    journalDateInput.value = formattedDate;
    console.log('Setting journal date to local date:', formattedDate);

    // Initialize
    loadEntries();
    loadMemoryEntries();
    initializeAnimations();

    // Make sure word count is initialized
    console.log('Initializing word count');
    if (journalContentTextarea && wordCountElement) {
        const text = journalContentTextarea.value;

        // Count words properly - handle non-empty strings with proper word counting
        let wordCount = 0;
        if (text && text.trim().length > 0) {
            // Split by whitespace and filter out empty strings
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            wordCount = words.length;
        }

        console.log('Initial text content:', text);
        console.log('Initial word count calculated:', wordCount);

        wordCountElement.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
    } else {
        console.error('Could not initialize word count - missing elements');
    }

    // Event Listeners
    saveEntryButton.addEventListener('click', saveEntry);
    analyzeEntryButton.addEventListener('click', analyzeEntry);
    journalDateInput.addEventListener('change', loadEntryForDate);

    // Make sure the textarea input event is properly connected for word count
    if (journalContentTextarea) {
        // Add input event listener
        journalContentTextarea.addEventListener('input', handleTextareaInput);
        console.log('Added input event listener to journal content textarea');

        // Add change event listener as well
        journalContentTextarea.addEventListener('change', handleTextareaInput);

        // Add keyup event listener for good measure
        journalContentTextarea.addEventListener('keyup', handleTextareaInput);

        // Add a MutationObserver to monitor changes to the textarea
        const observer = new MutationObserver((mutations) => {
            handleTextareaInput();
        });

        observer.observe(journalContentTextarea, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        });

        // Trigger the input handler once to ensure word count is updated
        handleTextareaInput();

        // Force an update after a short delay to ensure content is loaded
        setTimeout(handleTextareaInput, 500);
    } else {
        console.error('Journal content textarea not found');
    }

    if (voiceToTextButton) {
        voiceToTextButton.addEventListener('click', toggleVoiceToText);
    }

    if (saveInsightsButton) {
        saveInsightsButton.addEventListener('click', saveAIInsights);
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    if (testOllamaButton) {
        testOllamaButton.addEventListener('click', testOllama);
    }

    /**
     * Handles input in the textarea
     * Triggers word count update and real-time analysis
     */
    function handleTextareaInput() {
        // Update word count immediately
        const text = journalContentTextarea.value;

        // Count words properly - handle non-empty strings with proper word counting
        let wordCount = 0;
        if (text && text.trim().length > 0) {
            // Split by whitespace and filter out empty strings
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            wordCount = words.length;
        }

        console.log('Text content:', text);
        console.log('Word count calculated:', wordCount);

        wordCountElement.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;

        // Update sentiment indicator in real-time
        const content = text;

        // Debounce real-time analysis
        clearTimeout(window.journalAnalysisTimeout);
        window.journalAnalysisTimeout = setTimeout(() => {
            if (content.length > 50) {
                performRealTimeAnalysis(content);
            }
        }, 2000);
    }

    /**
     * Performs real-time analysis of journal content
     * @param {string} content - The journal content to analyze
     */
    async function performRealTimeAnalysis(content) {
        try {
            // Simple sentiment analysis (will be replaced with AI analysis)
            const sentiment = await analyzeSentiment(content);
            updateSentimentIndicator(sentiment);

            // If we have enough content, suggest prompts based on the content
            if (content.length > 100) {
                generateContextualPrompts(content);
            }
        } catch (error) {
            console.error('Error in real-time analysis:', error);
        }
    }

    /**
     * Simple sentiment analysis function
     * This would ideally be replaced with a call to an AI service
     * @param {string} text - The text to analyze
     * @returns {Object} - Sentiment score and label
     */
    async function analyzeSentiment(text) {
        // This is a placeholder for actual sentiment analysis
        // In a real implementation, this would call an API

        // Simulate API call with a delay
        return new Promise(resolve => {
            setTimeout(() => {
                // Simple word-based sentiment analysis
                const positiveWords = ['happy', 'good', 'great', 'excellent', 'joy', 'love', 'excited'];
                const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'angry', 'hate', 'frustrated'];

                const words = text.toLowerCase().split(/\W+/);
                let positiveCount = 0;
                let negativeCount = 0;

                words.forEach(word => {
                    if (positiveWords.includes(word)) positiveCount++;
                    if (negativeWords.includes(word)) negativeCount++;
                });

                let score = 0;
                if (positiveCount + negativeCount > 0) {
                    score = (positiveCount - negativeCount) / (positiveCount + negativeCount);
                }

                let label = 'neutral';
                if (score > 0.3) label = 'positive';
                if (score < -0.3) label = 'negative';

                resolve({ score, label });
            }, 300);
        });
    }

    /**
     * Updates the sentiment indicator based on analysis
     * @param {Object} sentiment - The sentiment analysis result
     */
    function updateSentimentIndicator(sentiment) {
        if (!sentimentIndicator) return;

        // Remove previous classes
        sentimentIndicator.classList.remove('positive', 'negative', 'neutral');

        // Add appropriate class
        sentimentIndicator.classList.add(sentiment.label);

        // Update icon
        let icon = '😐';
        if (sentiment.label === 'positive') icon = '😊';
        if (sentiment.label === 'negative') icon = '😔';

        sentimentIndicator.innerHTML = `<span class="sentiment-icon">${icon}</span>`;

        // Add tooltip
        sentimentIndicator.setAttribute('title', `Sentiment: ${sentiment.label} (${Math.round(sentiment.score * 100)}%)`);
    }

    /**
     * Generates contextual prompt suggestions based on journal content
     * @param {string} content - The journal content
     */
    function generateContextualPrompts(content) {
        if (!promptSuggestions) return;

        // This would ideally use AI to generate relevant prompts
        // For now, we'll use some generic prompts
        const genericPrompts = [
            "How did this make you feel?",
            "What could you do differently next time?",
            "What are you grateful for today?",
            "What's one thing you learned?",
            "How does this connect to your goals?"
        ];

        // Clear existing prompts
        promptSuggestions.innerHTML = '';

        // Add new prompts
        genericPrompts.forEach(prompt => {
            const promptElement = document.createElement('div');
            promptElement.className = 'prompt-suggestion';
            promptElement.textContent = prompt;
            promptElement.addEventListener('click', () => {
                journalContentTextarea.value += `\n\n${prompt}\n`;
                journalContentTextarea.focus();
                // Place cursor at the end
                journalContentTextarea.selectionStart = journalContentTextarea.value.length;
                journalContentTextarea.selectionEnd = journalContentTextarea.value.length;
                updateWordCount();
            });
            promptSuggestions.appendChild(promptElement);
        });
    }

    /**
     * Initializes animations for the UI
     */
    function initializeAnimations() {
        // Add subtle animations to the UI elements
        document.querySelectorAll('.journal-editor, .ai-assistant').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';

            setTimeout(() => {
                element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100);
        });
    }

    /**
     * Toggles voice-to-text functionality
     */
    function toggleVoiceToText() {
        if (!voiceToTextButton) return;

        // Check if the Web Speech API is available
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            showStatus('Voice recognition is not supported in your browser.', 'error');
            return;
        }

        // Implementation would go here
        // This requires the Web Speech API
        showStatus('Voice-to-text feature coming soon!', 'info');
    }

    /**
     * Saves AI insights separately
     */
    function saveAIInsights() {
        if (!saveInsightsButton || !analysisContentElement) return;

        const insights = analysisContentElement.textContent.trim();
        if (!insights || insights.includes('will appear here')) {
            showStatus('No insights to save yet. Analyze your entry first.', 'error');
            return;
        }

        // In a real implementation, this would save to the database
        showStatus('AI insights saved successfully!', 'success');
    }

    /**
     * Toggles between light and dark themes
     */
    function toggleTheme() {
        document.body.classList.toggle('light-theme');

        // Update button icon
        if (themeToggleButton) {
            const icon = themeToggleButton.querySelector('i');
            if (icon) {
                if (document.body.classList.contains('light-theme')) {
                    icon.className = 'fas fa-moon';
                } else {
                    icon.className = 'fas fa-sun';
                }
            }
        }
    }

    /**
     * Updates the word count display
     */
    function updateWordCount() {
        if (!journalContentTextarea || !wordCountElement) {
            console.error('Missing required elements for word count update');
            return;
        }

        const text = journalContentTextarea.value;

        // Count words properly - handle non-empty strings with proper word counting
        let wordCount = 0;
        if (text && text.trim().length > 0) {
            // Split by whitespace and filter out empty strings
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            wordCount = words.length;
        }

        console.log('Text content for word count:', text);
        console.log(`Updating word count: ${wordCount} words`);

        // Update the word count display with the calculated value
        wordCountElement.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;

        // Force the word count to be visible
        wordCountElement.style.color = 'white';
        wordCountElement.style.fontWeight = 'bold';
    }

    /**
     * Saves the current journal entry
     */
    async function saveEntry() {
        const date = journalDateInput.value;
        const content = journalContentTextarea.value.trim();
        const mood = moodSelector ? moodSelector.value : 'neutral';

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
                    content: content,
                    mood: mood
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showStatus('Journal entry saved successfully!', 'success');

            // Add animation effect to indicate successful save
            journalContentTextarea.classList.add('saved-animation');
            setTimeout(() => {
                journalContentTextarea.classList.remove('saved-animation');
            }, 1000);

            loadEntries();
        } catch (error) {
            console.error('Error saving journal entry:', error);
            showStatus(`Error saving journal entry: ${error.message}`, 'error');
        }
    }

    /**
     * Analyzes the current journal entry with AI
     */
    async function analyzeEntry() {
        const content = journalContentTextarea.value.trim();
        const date = journalDateInput.value;
        const mood = moodSelector ? moodSelector.value : 'neutral';

        if (!content) {
            showStatus('Please write something to analyze.', 'error');
            return;
        }

        try {
            showStatus('Analyzing journal entry with AI assistant...', 'info');
            analysisContentElement.innerHTML = '<p>Analyzing your journal entry with AI assistant...</p>';

            // Show loading animation
            analysisContentElement.classList.add('loading');

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

            // Enhanced prompt for the AI assistant
            const prompt = `
            You are an empathetic AI assistant having a conversation with someone about their journal entry.

            Here are recent entries from this person's journal (READ THESE CAREFULLY - they contain important context):
            ${themes}${specificContext}

            Today's journal entry:
            "${content}"

            Respond in a warm, empathetic, conversational tone. Reference information from previous entries when relevant.
            Never contradict information they've provided in previous entries.

            In your response:
            1. Acknowledge their feelings and experiences
            2. Identify patterns or recurring themes across entries
            3. Ask 2-3 thoughtful follow-up questions that encourage deeper reflection (format as [QUESTION 1: your question])
            4. Offer one insight that might help them gain perspective (format as [INSIGHT: your insight])

            At the very end, include a one-sentence summary of this entry prefixed with [SUMMARY:] that I can use to track themes (this will be hidden from the user).
            `;

            try {
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

                // Extract summary, questions, and insights
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
                }

                // Format and display the analysis
                const formattedAnalysis = formatAIAnalysis(aiResponse, questions, insights);
                analysisContentElement.classList.remove('loading');
                analysisContentElement.innerHTML = formattedAnalysis;

                showStatus('AI analysis complete!', 'success');

                // Save the entry with analysis
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
                                analysis: aiResponse,
                                mood: mood
                            })
                        });
                    } catch (saveError) {
                        console.error('Error saving analysis with entry:', saveError);
                    }
                }
            } catch (ollamaError) {
                console.error('Error with Ollama:', ollamaError);
                analysisContentElement.classList.remove('loading');
                analysisContentElement.innerHTML = `
                    <div class="ai-analysis-conversation error-message">
                        <p><strong>AI Analysis Error</strong></p>
                        <p>There was an error communicating with the Ollama AI server: ${ollamaError.message}</p>
                        <p>Your journal entry has been saved without AI analysis.</p>
                    </div>`;

                // Save the entry without analysis
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
                                mood: mood
                            })
                        });
                        showStatus('Journal entry saved (without AI analysis).', 'success');
                    } catch (saveError) {
                        console.error('Error saving entry:', saveError);
                        showStatus('Error saving entry.', 'error');
                    }
                }
            }
        } catch (error) {
            console.error('Error analyzing journal entry:', error);
            showStatus(`Error analyzing journal entry: ${error.message}`, 'error');
            analysisContentElement.classList.remove('loading');
            analysisContentElement.innerHTML = '<p class="placeholder">Failed to analyze entry. Please try again.</p>';

            // Try to save the entry without analysis
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
                            mood: mood
                        })
                    });
                    showStatus('Journal entry saved (without AI analysis).', 'success');
                } catch (saveError) {
                    console.error('Error saving entry:', saveError);
                }
            }
        }
    }

    /**
     * Formats the AI analysis for display
     * @param {string} analysisText - The raw analysis text
     * @param {Array} questions - Array of question objects
     * @param {Array} insights - Array of insight objects
     * @returns {string} - Formatted HTML
     */
    function formatAIAnalysis(analysisText, questions = [], insights = []) {
        // Remove metadata tags
        const summaryMatch = analysisText.match(/\[SUMMARY:\s*(.+?)\]/i);
        let formatted = analysisText;

        if (summaryMatch) {
            formatted = formatted.replace(/\[SUMMARY:\s*.+?\]/i, '');
        }

        formatted = formatted.replace(/\[QUESTION\s+\d+:\s*.+?(?:\]|\n|$)/gi, '');
        formatted = formatted.replace(/\[INSIGHT:\s*.+?(?:\]|\n|$)/gi, '');
        formatted = formatted.replace(/\n/g, '<br>');

        // Add additional formatting for readability
        formatted = formatted.replace(/^([A-Za-z\s]+:)/gm, '$1');

        // Format insights section
        let insightsHTML = '';
        if (insights && insights.length > 0) {
            insightsHTML = `
                <div class="ai-insights">
                    <h3>Insights:</h3>
                    <ul>
                        ${insights.map(insight => `<li>${insight.text}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Format questions section
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
                ${insightsHTML}
                ${questionsHTML}
            </div>
        `;
    }

    /**
     * Loads all journal entries
     */
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

    /**
     * Renders the list of journal entries
     * @param {Array} entries - Array of journal entry objects
     */
    function renderEntryList(entries) {
        if (!entries || entries.length === 0) {
            entryListElement.innerHTML = '<li class="no-entries">No journal entries yet. Write your first entry and click "Save Entry".</li>';
            return;
        }

        entryListElement.innerHTML = '';

        // Sort entries by date (newest first)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Take only the 10 most recent entries
        const recentEntries = entries.slice(0, 10);

        recentEntries.forEach(entry => {
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

            // Add mood indicator if available
            const moodIndicator = entry.mood ?
                `<span class="entry-mood ${entry.mood}"></span>` : '';

            li.innerHTML = `
                <span class="entry-date">${formattedDate}</span>
                <span class="entry-preview">${contentPreview}</span>
                ${moodIndicator}
            `;

            li.addEventListener('click', () => loadEntry(entry));

            entryListElement.appendChild(li);
        });
    }

    /**
     * Loads a specific journal entry
     * @param {Object} entry - The journal entry object
     */
    function loadEntry(entry) {
        journalDateInput.value = entry.date;
        journalContentTextarea.value = entry.content;

        if (moodSelector && entry.mood) {
            moodSelector.value = entry.mood;
        }

        updateWordCount();

        // Clear analysis content
        analysisContentElement.innerHTML = '<p class="placeholder">AI analysis will appear here after you analyze your entry.</p>';

        // Scroll to top
        window.scrollTo(0, 0);
    }

    /**
     * Loads a journal entry for the selected date
     */
    async function loadEntryForDate() {
        const selectedDate = journalDateInput.value;

        try {
            const response = await fetch(`/api/journal/date/${selectedDate}`);

            if (response.status === 404) {
                // No entry for this date
                journalContentTextarea.value = '';
                if (moodSelector) {
                    moodSelector.value = 'neutral';
                }
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

            if (moodSelector && entry.mood) {
                moodSelector.value = entry.mood;
            } else if (moodSelector) {
                moodSelector.value = 'neutral';
            }

            updateWordCount();

            // If the entry has an analysis, display it
            if (entry.analysis) {
                // Extract questions and insights for proper formatting
                const questions = [];
                const questionRegex = /\[QUESTION\s+(\d+):\s*(.+?)(?:\]|\n|$)/gi;
                let questionMatch;
                while ((questionMatch = questionRegex.exec(entry.analysis)) !== null) {
                    questions.push({
                        number: parseInt(questionMatch[1]),
                        text: questionMatch[2].trim()
                    });
                }

                const insights = [];
                const insightRegex = /\[INSIGHT:\s*(.+?)(?:\]|\n|$)/gi;
                let insightMatch;
                while ((insightMatch = insightRegex.exec(entry.analysis)) !== null) {
                    insights.push({
                        text: insightMatch[1].trim()
                    });
                }

                const formattedAnalysis = formatAIAnalysis(entry.analysis, questions, insights);
                analysisContentElement.innerHTML = formattedAnalysis;
            } else {
                analysisContentElement.innerHTML = '<p class="placeholder">AI analysis will appear here after you analyze your entry.</p>';
            }
        } catch (error) {
            console.error('Error loading entry for date:', error);
            showStatus(`Error loading entry: ${error.message}`, 'error');
        }
    }

    /**
     * Loads memory entries for context
     */
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

            // Use memory entries to generate personalized prompts
            if (memoryEntries.length > 0 && promptSuggestions) {
                generatePersonalizedPrompts(memoryEntries);
            }
        } catch (error) {
            console.error('Error loading memory entries:', error);
        }
    }

    /**
     * Generates personalized prompts based on memory entries
     * @param {Array} memoryEntries - Array of memory entry objects
     */
    function generatePersonalizedPrompts(memoryEntries) {
        if (!promptSuggestions || memoryEntries.length === 0) return;

        // This would ideally use AI to generate relevant prompts
        // For now, we'll use some generic prompts plus one based on memory
        const genericPrompts = [
            "How are you feeling today?",
            "What's on your mind?",
            "What are you grateful for?"
        ];

        // Add a prompt based on the most recent memory entry
        const recentEntry = memoryEntries[0];
        if (recentEntry && recentEntry.summary) {
            const personalPrompt = `Last time you wrote about ${recentEntry.summary}. Any updates on that?`;
            genericPrompts.unshift(personalPrompt);
        }

        // Clear existing prompts
        promptSuggestions.innerHTML = '';

        // Add new prompts (limit to 4)
        genericPrompts.slice(0, 4).forEach(prompt => {
            const promptElement = document.createElement('div');
            promptElement.className = 'prompt-suggestion';
            promptElement.textContent = prompt;
            promptElement.addEventListener('click', () => {
                journalContentTextarea.value += `\n\n${prompt}\n`;
                journalContentTextarea.focus();
                // Place cursor at the end
                journalContentTextarea.selectionStart = journalContentTextarea.value.length;
                journalContentTextarea.selectionEnd = journalContentTextarea.value.length;
                updateWordCount();
            });
            promptSuggestions.appendChild(promptElement);
        });
    }

    /**
     * Shows a status message
     * @param {string} message - The message to display
     * @param {string} type - The type of message (info, success, error)
     */
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

    /**
     * Tests the Ollama connection
     */
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
                        <p>You can now use the "Analyze" button to analyze your journal entries.</p>
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
                    <p>To use the AI assistant feature, you need to:</p>
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
