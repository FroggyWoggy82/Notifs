document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const journalDateInput = document.getElementById('journal-date');
    const journalContentTextarea = document.getElementById('journal-content');
    const saveEntryButton = document.getElementById('save-entry');
    const analyzeEntryButton = document.getElementById('analyze-entry');
    const entryListElement = document.getElementById('entry-list');
    const analysisContentElement = document.getElementById('analysis-content');
    const statusMessage = document.getElementById('status-message');

    // Set today's date as default
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    journalDateInput.value = formattedDate;

    // Initialize
    loadEntries();

    // Event Listeners
    saveEntryButton.addEventListener('click', saveEntry);
    analyzeEntryButton.addEventListener('click', analyzeEntry);
    journalDateInput.addEventListener('change', loadEntryForDate);

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

        if (!content) {
            showStatus('Please write something to analyze.', 'error');
            return;
        }

        try {
            showStatus('Analyzing journal entry...', 'info');
            analysisContentElement.innerHTML = '<p>Analyzing your journal entry...</p>';
            
            const response = await fetch('/api/journal/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: content
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            analysisContentElement.innerHTML = result.analysis;
            showStatus('Analysis complete!', 'success');
        } catch (error) {
            console.error('Error analyzing journal entry:', error);
            showStatus(`Error analyzing journal entry: ${error.message}`, 'error');
            analysisContentElement.innerHTML = '<p class="placeholder">Failed to analyze entry. Please try again.</p>';
        }
    }

    async function loadEntries() {
        try {
            showStatus('Loading journal entries...', 'info');
            
            const response = await fetch('/api/journal');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const entries = await response.json();
            renderEntryList(entries);
            showStatus('', ''); // Clear status
        } catch (error) {
            console.error('Error loading journal entries:', error);
            showStatus(`Error loading journal entries: ${error.message}`, 'error');
            entryListElement.innerHTML = '<li>Failed to load entries</li>';
        }
    }

    function renderEntryList(entries) {
        if (!entries || entries.length === 0) {
            entryListElement.innerHTML = '<li>No journal entries yet</li>';
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
                analysisContentElement.innerHTML = '<p class="placeholder">AI analysis will appear here after you analyze your entry.</p>';
                return;
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const entry = await response.json();
            journalContentTextarea.value = entry.content;
            
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
});
