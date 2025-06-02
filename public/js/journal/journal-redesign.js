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
    const sendMessageButton = document.getElementById('send-message');
    const entryListElement = document.getElementById('entry-list');
    const chatMessagesElement = document.getElementById('chat-messages');
    const statusMessage = document.getElementById('status-message');
    const wordCountElement = document.getElementById('word-count');
    const moodSelector = document.getElementById('mood-selector');
    const voiceToTextButton = document.getElementById('voice-to-text');
    const promptSuggestions = document.getElementById('prompt-suggestions');
    const sentimentIndicator = document.getElementById('sentiment-indicator');
    const saveInsightsButton = document.getElementById('save-insights');

    // Chat conversation state
    let currentConversation = [];

    // Auto-save state
    let autoSaveTimeout = null;
    let lastSavedContent = '';
    let isAutoSaving = false;

    // Set today's date as default - Enhanced to ensure it always works
    function setTodaysDate(skipLoadEntry = false) {
        if (!journalDateInput) {
            console.error('Journal date input not found');
            return;
        }

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // Only set if it's different to avoid unnecessary triggers
        if (journalDateInput.value !== formattedDate) {
            journalDateInput.value = formattedDate;
            console.log('Setting journal date to local date:', formattedDate);

            // Only trigger change event if we want to load entry for this date
            if (!skipLoadEntry) {
                // Use a small delay to ensure the value is set
                setTimeout(() => {
                    journalDateInput.dispatchEvent(new Event('change', { bubbles: true }));
                }, 10);
            }
        }
    }

    // Set today's date immediately (skip loading entry on initial set)
    setTodaysDate(true);

    // Also set it after a short delay to ensure DOM is fully ready
    setTimeout(() => setTodaysDate(true), 100);

    // Set it again after page load to ensure it sticks, and load today's entry
    window.addEventListener('load', () => {
        setTodaysDate(false); // This time, load the entry for today
    });

    // Initialize
    loadEntries();
    loadMemoryEntries();
    initializeAnimations();

    // Initialize chat interface with a delay to ensure DOM is ready
    setTimeout(() => {
        initializeChatInterface();
    }, 100);

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
    // saveEntryButton.addEventListener('click', saveEntry); // Removed - using auto-save now
    // analyzeEntryButton.addEventListener('click', analyzeEntry); // Removed - confer button removed
    sendMessageButton.addEventListener('click', sendMessage);

    // Enhanced date change listener with debugging
    journalDateInput.addEventListener('change', function(e) {
        console.log('Date changed to:', e.target.value);
        loadEntryForDate();
    });

    // Also listen for input events (for manual typing)
    journalDateInput.addEventListener('input', function(e) {
        console.log('Date input changed to:', e.target.value);
        // Validate date format before loading
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(e.target.value)) {
            loadEntryForDate();
        }
    });

    // Enter key to send message
    journalContentTextarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

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

    /**
     * Handles input in the textarea
     * Triggers word count update and auto-save
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

        wordCountElement.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;

        // Enable/disable send button based on content
        if (sendMessageButton) {
            sendMessageButton.disabled = !text.trim();
        }

        // Trigger auto-save
        scheduleAutoSave();
    }

    /**
     * Schedules an auto-save after a delay
     */
    function scheduleAutoSave() {
        // Clear any existing timeout
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        // Schedule auto-save after 2 seconds of inactivity
        autoSaveTimeout = setTimeout(() => {
            performAutoSave();
        }, 2000);
    }

    /**
     * Performs automatic save of current content
     */
    async function performAutoSave() {
        if (isAutoSaving) {
            return; // Prevent multiple simultaneous saves
        }

        const currentContent = getCurrentContent();

        // Only save if content has changed
        if (currentContent === lastSavedContent || !currentContent.trim()) {
            return;
        }

        isAutoSaving = true;

        try {
            const date = journalDateInput.value;
            const mood = moodSelector ? moodSelector.value : 'neutral';

            console.log('Auto-saving content...');

            const response = await fetch('/api/journal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: date,
                    content: currentContent,
                    mood: mood,
                    conversation: currentConversation
                })
            });

            if (response.ok) {
                lastSavedContent = currentContent;
                console.log('Auto-save successful');

                // Show subtle save indicator
                showAutoSaveIndicator();

                // Refresh entry list
                loadEntries();
            } else {
                console.error('Auto-save failed:', response.status);
            }
        } catch (error) {
            console.error('Auto-save error:', error);
        } finally {
            isAutoSaving = false;
        }
    }

    /**
     * Gets the current content to save (textarea + conversation)
     */
    function getCurrentContent() {
        let content = journalContentTextarea.value.trim();

        // If there's no content in textarea but we have a conversation, save the conversation
        if (!content && currentConversation.length > 0) {
            content = currentConversation
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n\n');
        }

        // If there's content in textarea and a conversation, combine them
        if (content && currentConversation.length > 0) {
            const conversationText = currentConversation
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n\n');

            // If the textarea content isn't already part of the conversation, add it
            if (!conversationText.includes(content)) {
                content = conversationText + '\n\nCurrent input: ' + content;
            } else {
                content = conversationText;
            }
        }

        return content;
    }

    /**
     * Shows a subtle auto-save indicator
     */
    function showAutoSaveIndicator() {
        // Create or update auto-save indicator
        let indicator = document.getElementById('auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'auto-save-indicator';
            indicator.className = 'auto-save-indicator';
            indicator.textContent = 'Saved';

            // Add it near the word count
            const wordCountElement = document.getElementById('word-count');
            if (wordCountElement && wordCountElement.parentNode) {
                wordCountElement.parentNode.appendChild(indicator);
            }
        }

        // Show the indicator
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';

        // Hide it after 2 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(-10px)';
        }, 2000);
    }

    /**
     * Sends a message in the chat interface
     */
    async function sendMessage() {
        const content = journalContentTextarea.value.trim();
        if (!content) return;

        // Add user message to chat
        addMessageToChat('user', content);

        // Clear input
        journalContentTextarea.value = '';
        handleTextareaInput();

        // Add to conversation history
        currentConversation.push({
            role: 'user',
            content: content,
            timestamp: new Date()
        });

        // Get AI response
        await getAIResponse(content);
    }

    /**
     * Adds a message to the chat interface
     */
    function addMessageToChat(sender, content, timestamp = new Date()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = formatMessageContent(content);

        const messageTimestamp = document.createElement('div');
        messageTimestamp.className = 'message-timestamp';
        messageTimestamp.textContent = timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTimestamp);

        // Remove welcome message if it exists
        const welcomeMessage = chatMessagesElement.querySelector('.welcome-message');
        if (welcomeMessage && sender === 'user') {
            welcomeMessage.remove();
        }

        chatMessagesElement.appendChild(messageDiv);

        // Improved scroll to bottom with multiple fallbacks
        scrollToBottom();

        return messageDiv;
    }

    /**
     * Scrolls the chat messages container to the bottom
     * Uses multiple methods to ensure reliable scrolling
     */
    function scrollToBottom() {
        if (!chatMessagesElement) {
            return;
        }

        // Method 1: Immediate scroll
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;

        // Method 2: RequestAnimationFrame for next paint cycle
        requestAnimationFrame(() => {
            chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
        });

        // Method 3: Timeout fallback for complex layouts
        setTimeout(() => {
            chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
        }, 50);

        // Method 4: Force scroll using scrollIntoView on last message
        setTimeout(() => {
            const lastMessage = chatMessagesElement.lastElementChild;
            if (lastMessage) {
                lastMessage.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest'
                });
            }
        }, 100);
    }

    /**
     * Formats message content for display
     */
    function formatMessageContent(content) {
        // Convert line breaks to <br> tags
        return content.replace(/\n/g, '<br>');
    }

    /**
     * Gets AI response for the user's message
     */
    async function getAIResponse(userMessage) {
        // Add loading message
        const loadingMessage = addMessageToChat('ai', 'Thinking...');
        loadingMessage.classList.add('loading');

        try {
            const response = await fetch('/api/journal/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: userMessage,
                    conversation: currentConversation
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const analysis = result.analysis;

            // Remove loading message
            loadingMessage.remove();

            // Add AI response
            const aiMessage = addMessageToChat('ai', analysis);

            // Ensure scrolling happens after the message is fully rendered
            setTimeout(() => {
                scrollToBottom();
            }, 150);

            // Add to conversation history
            currentConversation.push({
                role: 'ai',
                content: analysis,
                timestamp: new Date()
            });

            // Save the conversation
            await saveConversation();

        } catch (error) {
            console.error('Error getting AI response:', error);

            // Remove loading message
            loadingMessage.remove();

            // Add error message
            const errorMessage = addMessageToChat('ai', 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.');

            // Ensure scrolling happens for error message too
            setTimeout(() => {
                scrollToBottom();
            }, 150);
        }
    }

    /**
     * Saves the current conversation (now handled by auto-save)
     */
    async function saveConversation() {
        try {
            const date = journalDateInput.value;
            const mood = moodSelector ? moodSelector.value : 'neutral';

            // Create a summary of the conversation for storage
            const conversationText = currentConversation
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n\n');

            const response = await fetch('/api/journal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: date,
                    content: conversationText,
                    mood: mood,
                    conversation: currentConversation
                })
            });

            if (response.ok) {
                // Update the last saved content to prevent duplicate auto-saves
                lastSavedContent = conversationText;
                console.log('Conversation saved successfully');

                // Show save indicator
                showAutoSaveIndicator();

                // Refresh entry list
                loadEntries();
            }

        } catch (error) {
            console.error('Error saving conversation:', error);
        }
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
        let icon = '•';
        if (sentiment.label === 'positive') icon = '↑';
        if (sentiment.label === 'negative') icon = '↓';

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
     * Initializes the chat interface
     */
    function initializeChatInterface() {
        console.log('Starting initializeChatInterface...');

        // Initialize send button state
        if (sendMessageButton) {
            sendMessageButton.disabled = true;
            console.log('Send button initialized');
        }

        // Auto-resize textarea
        if (journalContentTextarea) {
            journalContentTextarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });

            // Focus on the input
            setTimeout(() => {
                journalContentTextarea.focus();
            }, 500);
            console.log('Textarea auto-resize initialized');
        }

        // Fix chat messages container height to enable scrolling
        console.log('About to fix chat container height...');
        console.log('Checking chatMessagesElement:', !!chatMessagesElement);
        const chatElement = chatMessagesElement || document.getElementById('chat-messages');
        console.log('Chat element found:', !!chatElement);

        if (chatElement) {
            console.log('Applying height fix...');
            chatElement.style.height = '400px';
            chatElement.style.maxHeight = '400px';
            chatElement.style.minHeight = '400px';
            chatElement.style.flex = 'none';
            chatElement.style.flexGrow = '0';
            chatElement.style.flexShrink = '0';
            chatElement.style.overflowY = 'auto';
            console.log('Fixed chat container height for scrolling');
        } else {
            console.error('Could not find chat messages element for height fix');
        }

        // Load today's conversation if it exists
        console.log('About to load entry for date...');
        loadEntryForDate();

        console.log('Chat interface initialized');
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
        const mood = moodSelector ? moodSelector.value : 'neutral';

        // Get content from either the textarea or the conversation
        let content = journalContentTextarea.value.trim();

        // If there's no content in textarea but we have a conversation, save the conversation
        if (!content && currentConversation.length > 0) {
            content = currentConversation
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n\n');
        }

        // If there's content in textarea and a conversation, combine them
        if (content && currentConversation.length > 0) {
            const conversationText = currentConversation
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n\n');

            // If the textarea content isn't already part of the conversation, add it
            if (!conversationText.includes(content)) {
                content = conversationText + '\n\nCurrent input: ' + content;
            } else {
                content = conversationText;
            }
        }

        if (!content) {
            showStatus('Please write something or have a conversation to save.', 'error');
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
                    mood: mood,
                    conversation: currentConversation
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showStatus('Journal entry saved successfully!', 'success');

            // Add animation effect to indicate successful save
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                chatContainer.classList.add('saved-animation');
                setTimeout(() => {
                    chatContainer.classList.remove('saved-animation');
                }, 1000);
            }

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



            try {
                const aiResponse = await fetch('/api/journal/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: content
                    })
                });

                if (!aiResponse.ok) {
                    const errorData = await aiResponse.json();
                    throw new Error(errorData.error || `HTTP error! status: ${aiResponse.status}`);
                }

                const result = await aiResponse.json();
                const analysis = result.analysis;
                const summary = result.summary;
                const questions = result.questions || [];
                const insights = result.insights || [];

                // Generate AI summary for memory (300 characters max)
                let memorySummary = summary || 'No summary available';
                if (memorySummary.length > 300) {
                    memorySummary = memorySummary.substring(0, 297) + '...';
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
                            text: memorySummary,
                            summary: summary
                        })
                    });
                } catch (memoryError) {
                    console.error('Error saving to memory:', memoryError);
                }

                // Format and display the analysis
                const formattedAnalysis = formatAIAnalysis(analysis, questions, insights);
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
                                analysis: analysis,
                                mood: mood
                            })
                        });
                    } catch (saveError) {
                        console.error('Error saving analysis with entry:', saveError);
                    }
                }
            } catch (aiError) {
                console.error('Error with AI:', aiError);
                analysisContentElement.classList.remove('loading');
                analysisContentElement.innerHTML = `
                    <div class="ai-analysis-conversation error-message">
                        <p><strong>AI Analysis Error</strong></p>
                        <p>There was an error communicating with the AI service: ${aiError.message}</p>
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
        // Ensure analysisText is a string
        if (typeof analysisText !== 'string') {
            console.error('formatAIAnalysis: analysisText is not a string:', typeof analysisText, analysisText);
            return '<div class="error-message">Error: Invalid analysis data received</div>';
        }

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

            // Store the original date for data attributes and API calls
            li.dataset.date = entry.date;
            li.dataset.id = entry.id;

            // Format date for display
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

            li.addEventListener('click', () => {
                console.log('Clicking entry with date:', entry.date);
                loadEntry(entry);
            });

            entryListElement.appendChild(li);
        });
    }

    /**
     * Loads a specific journal entry
     * @param {Object} entry - The journal entry object
     */
    function loadEntry(entry) {
        // Convert date to proper format for date input (YYYY-MM-DD)
        let formattedDate = entry.date;
        if (entry.date) {
            // Handle both ISO format and regular date strings
            const date = new Date(entry.date);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                formattedDate = `${year}-${month}-${day}`;
            }
        }

        journalDateInput.value = formattedDate;
        console.log('Loading entry with formatted date:', formattedDate, 'from original:', entry.date);

        if (moodSelector && entry.mood) {
            moodSelector.value = entry.mood;
        }

        // Clear current conversation
        currentConversation = [];

        // Clear chat messages
        chatMessagesElement.innerHTML = '';

        // Load conversation if it exists
        if (entry.conversation && Array.isArray(entry.conversation)) {
            currentConversation = entry.conversation;

            // Render conversation messages
            entry.conversation.forEach(msg => {
                addMessageToChat(msg.role, msg.content, new Date(msg.timestamp));
            });
        } else if (entry.content) {
            // If it's an old-style entry, show it as a single user message
            addMessageToChat('user', entry.content);

            // If there's analysis, show it as AI response
            if (entry.analysis) {
                addMessageToChat('ai', entry.analysis);
            }
        } else {
            // Show welcome message
            chatMessagesElement.innerHTML = `
                <div class="welcome-message">
                    <div class="message ai-message">
                        <div class="message-content">
                            <p>Hello! I'm Gibiti, your AI journaling companion. Share your thoughts with me and I'll help you reflect and gain insights. What's on your mind today?</p>
                        </div>
                    </div>
                </div>
            `;
        }

        updateWordCount();

        // Scroll to top
        window.scrollTo(0, 0);
    }

    /**
     * Loads a journal entry for the selected date
     */
    async function loadEntryForDate() {
        const selectedDate = journalDateInput.value;

        if (!selectedDate) {
            console.log('No date selected, skipping load');
            return;
        }

        console.log('Loading entry for date:', selectedDate);

        try {
            showStatus('Loading entry for selected date...', 'info');

            const response = await fetch(`/api/journal/date/${selectedDate}`);

            if (response.status === 404) {
                console.log('No entry found for date:', selectedDate);
                // No entry for this date - clear everything and show welcome
                journalContentTextarea.value = '';
                if (moodSelector) {
                    moodSelector.value = 'neutral';
                }
                currentConversation = [];
                chatMessagesElement.innerHTML = `
                    <div class="welcome-message">
                        <div class="message ai-message">
                            <div class="message-content">
                                <p>Hello! I'm Gibiti, your AI journaling companion. Share your thoughts with me and I'll help you reflect and gain insights. What's on your mind today?</p>
                            </div>
                        </div>
                    </div>
                `;
                updateWordCount();
                showStatus('', ''); // Clear status
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const entry = await response.json();
            console.log('Loaded entry for date:', selectedDate, entry);

            // Load the entry using the existing loadEntry function
            loadEntry(entry);
            showStatus('Entry loaded successfully!', 'success');

        } catch (error) {
            console.error('Error loading entry for date:', error);
            showStatus(`Error loading entry: ${error.message}`, 'error');

            // Clear the interface on error
            journalContentTextarea.value = '';
            if (moodSelector) {
                moodSelector.value = 'neutral';
            }
            currentConversation = [];
            chatMessagesElement.innerHTML = `
                <div class="welcome-message">
                    <div class="message ai-message">
                        <div class="message-content">
                            <p>Hello! I'm Gibiti, your AI journaling companion. Share your thoughts with me and I'll help you reflect and gain insights. What's on your mind today?</p>
                        </div>
                    </div>
                </div>
            `;
            updateWordCount();
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
     * Initialize people tracking functionality
     */
    function initializePeopleSection() {
        const peopleList = document.getElementById('people-list');
        const personSearch = document.getElementById('person-search');
        const searchPersonBtn = document.getElementById('search-person-btn');
        const personAnalysis = document.getElementById('person-analysis');
        const personAnalysisName = document.getElementById('person-analysis-name');
        const personAnalysisContent = document.getElementById('person-analysis-content');
        const closePersonAnalysis = document.getElementById('close-person-analysis');

        if (!peopleList || !personSearch || !searchPersonBtn) {
            console.log('People section elements not found');
            return;
        }

        // Load people on initialization
        loadPeople();

        // Search person functionality
        searchPersonBtn.addEventListener('click', searchPerson);
        personSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchPerson();
            }
        });

        // Close person analysis
        if (closePersonAnalysis) {
            closePersonAnalysis.addEventListener('click', () => {
                personAnalysis.style.display = 'none';
            });
        }

        /**
         * Load and display all people mentioned in journal entries
         */
        async function loadPeople() {
            try {
                const response = await fetch('/api/journal/people');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const people = await response.json();
                renderPeopleList(people);
            } catch (error) {
                console.error('Error loading people:', error);
                peopleList.innerHTML = '<p class="people-placeholder">Failed to load people. Please try again.</p>';
            }
        }

        /**
         * Render the list of people
         * @param {Array} people - Array of people objects
         */
        function renderPeopleList(people) {
            if (!people || people.length === 0) {
                peopleList.innerHTML = '<p class="people-placeholder">People you mention in your journal will appear here...</p>';
                return;
            }

            peopleList.innerHTML = '';

            people.forEach(person => {
                const personElement = document.createElement('div');
                personElement.className = 'person-item';
                personElement.innerHTML = `
                    <div class="person-name">${person.name}</div>
                    <div class="person-details">
                        <span class="person-relationship">${person.relationship_type || 'Unknown'}</span>
                        <span class="person-mentions">${person.total_mentions || person.mention_count || 0} mentions</span>
                        <span class="person-sentiment ${person.overall_sentiment || 'neutral'}">${person.overall_sentiment || 'neutral'}</span>
                    </div>
                `;

                personElement.addEventListener('click', () => {
                    showPersonAnalysis(person.id, person.name);
                });

                peopleList.appendChild(personElement);
            });
        }

        /**
         * Search for a person and show their analysis
         */
        async function searchPerson() {
            const searchTerm = personSearch.value.trim();
            if (!searchTerm) {
                showStatus('Please enter a name to search for', 'error');
                return;
            }

            try {
                showStatus('Searching for person...', 'info');
                const response = await fetch(`/api/journal/people/search?name=${encodeURIComponent(searchTerm)}`);

                if (response.status === 404) {
                    showStatus(`No person found matching "${searchTerm}"`, 'error');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const analysis = await response.json();
                displayPersonAnalysis(analysis.person.name, analysis.analysis);
                showStatus('Person analysis loaded!', 'success');

                // Clear search input
                personSearch.value = '';
            } catch (error) {
                console.error('Error searching for person:', error);
                showStatus(`Error searching for person: ${error.message}`, 'error');
            }
        }

        /**
         * Show analysis for a specific person
         * @param {number} personId - Person ID
         * @param {string} personName - Person name
         */
        async function showPersonAnalysis(personId, personName) {
            try {
                showStatus('Loading person analysis...', 'info');
                const response = await fetch(`/api/journal/people/${personId}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const analysis = await response.json();
                displayPersonAnalysis(personName, analysis.analysis);
                showStatus('Person analysis loaded!', 'success');
            } catch (error) {
                console.error('Error loading person analysis:', error);
                showStatus(`Error loading analysis: ${error.message}`, 'error');
            }
        }

        /**
         * Display person analysis in the UI
         * @param {string} personName - Person name
         * @param {string} analysisText - Analysis text
         */
        function displayPersonAnalysis(personName, analysisText) {
            if (!personAnalysis || !personAnalysisName || !personAnalysisContent) {
                console.error('Person analysis elements not found');
                return;
            }

            personAnalysisName.textContent = personName;

            // Format the analysis text (convert markdown-like formatting to HTML)
            const formattedAnalysis = formatAnalysisText(analysisText);
            personAnalysisContent.innerHTML = formattedAnalysis;

            personAnalysis.style.display = 'block';

            // Scroll to the analysis
            personAnalysis.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        /**
         * Format analysis text for display
         * @param {string} text - Raw analysis text
         * @returns {string} Formatted HTML
         */
        function formatAnalysisText(text) {
            if (!text) return '<p>No analysis available.</p>';

            // Convert markdown-like formatting to HTML
            let formatted = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
                .replace(/^### (.*$)/gim, '<h5>$1</h5>') // H3 headers
                .replace(/^## (.*$)/gim, '<h4>$1</h4>') // H2 headers
                .replace(/^# (.*$)/gim, '<h3>$1</h3>') // H1 headers
                .replace(/\n\n/g, '</p><p>') // Paragraphs
                .replace(/\n- /g, '</p><ul><li>') // Lists
                .replace(/\n/g, '<br>'); // Line breaks

            // Wrap in paragraph tags if not already wrapped
            if (!formatted.startsWith('<')) {
                formatted = '<p>' + formatted + '</p>';
            }

            // Fix list formatting
            formatted = formatted.replace(/<\/p><ul><li>/g, '</p><ul><li>');
            formatted = formatted.replace(/<li>(.*?)(<br>|<\/p>)/g, '<li>$1</li>');
            formatted = formatted.replace(/<\/li><li>/g, '</li><li>');
            formatted = formatted.replace(/<li>(.*?)$/, '<li>$1</li></ul>');

            return formatted;
        }
    }

    // Initialize people section
    initializePeopleSection();

});
