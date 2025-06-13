/**
 * Task Search Functionality
 * Provides comprehensive search capabilities for the task management system
 */

(function() {
    'use strict';

    // DOM Elements
    let searchInput;
    let clearSearchBtn;
    let searchResults;
    let searchResultsList;
    let searchResultsCount;
    let searchResultsStatus;
    let normalTaskView;
    let taskFilterSelect;

    // Search state
    let isSearchActive = false;
    let searchDebounceTimer = null;
    let currentSearchTerm = '';

    // Initialize search functionality
    function initializeTaskSearch() {
        console.log('Initializing task search functionality...');

        // Get DOM elements
        searchInput = document.getElementById('taskSearch');
        clearSearchBtn = document.getElementById('clearSearch');
        searchResults = document.getElementById('searchResults');
        searchResultsList = document.getElementById('searchResultsList');
        searchResultsCount = document.getElementById('searchResultsCount');
        searchResultsStatus = document.getElementById('searchResultsStatus');
        normalTaskView = document.getElementById('normalTaskView');
        taskFilterSelect = document.getElementById('taskFilter');

        if (!searchInput || !clearSearchBtn || !searchResults) {
            console.error('Search elements not found in DOM');
            return;
        }

        // Set up event listeners
        setupEventListeners();

        console.log('Task search functionality initialized successfully');
    }

    // Set up event listeners
    function setupEventListeners() {
        // Search input with debouncing
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleSearchKeydown);

        // Clear search button
        clearSearchBtn.addEventListener('click', clearSearch);

        // Listen for tasks loaded events to ensure search works with fresh data
        document.addEventListener('tasksLoaded', () => {
            if (isSearchActive && currentSearchTerm) {
                performSearch(currentSearchTerm);
            }
        });

        document.addEventListener('tasksRendered', () => {
            if (isSearchActive && currentSearchTerm) {
                performSearch(currentSearchTerm);
            }
        });
    }

    // Handle search input with debouncing
    function handleSearchInput(event) {
        const searchTerm = event.target.value.trim();
        currentSearchTerm = searchTerm;

        // Show/hide clear button
        if (searchTerm) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }

        // Clear previous debounce timer
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }

        // Debounce search to avoid excessive API calls
        searchDebounceTimer = setTimeout(() => {
            if (searchTerm) {
                performSearch(searchTerm);
            } else {
                clearSearch();
            }
        }, 300); // 300ms debounce
    }

    // Handle search input keydown events
    function handleSearchKeydown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const searchTerm = event.target.value.trim();
            if (searchTerm) {
                performSearch(searchTerm);
            }
        } else if (event.key === 'Escape') {
            clearSearch();
            searchInput.blur();
        }
    }

    // Perform the actual search
    function performSearch(searchTerm) {
        if (!searchTerm) {
            clearSearch();
            return;
        }

        // Check if allTasks is available
        if (typeof window.allTasks === 'undefined' || !Array.isArray(window.allTasks)) {
            showSearchStatus('Tasks not loaded yet. Please wait...', false);
            return;
        }

        // Show search results container
        showSearchResults();

        // Show loading state
        showSearchStatus('Searching...', false);

        // Perform search
        const results = searchTasks(searchTerm, window.allTasks);

        // Display results
        displaySearchResults(results, searchTerm);
    }

    // Search through tasks
    function searchTasks(searchTerm, tasks) {
        const term = searchTerm.toLowerCase();

        return tasks.filter(task => {
            // Search in title
            if (task.title && task.title.toLowerCase().includes(term)) {
                return true;
            }

            // Search in description
            if (task.description && task.description.toLowerCase().includes(term)) {
                return true;
            }

            // Search in reminder type
            if (task.reminder_type && task.reminder_type.toLowerCase().includes(term)) {
                return true;
            }

            // Search in recurrence type
            if (task.recurrence_type && task.recurrence_type.toLowerCase().includes(term)) {
                return true;
            }

            // Search in grocery data if available
            if (task.grocery_data && typeof task.grocery_data === 'object') {
                const groceryText = JSON.stringify(task.grocery_data).toLowerCase();
                if (groceryText.includes(term)) {
                    return true;
                }
            }

            return false;
        });
    }

    // Display search results
    function displaySearchResults(results, searchTerm) {
        console.log(`Found ${results.length} search results`);

        // Update results count
        updateSearchResultsCount(results.length, searchTerm);

        // Clear previous results
        searchResultsList.innerHTML = '';

        if (results.length === 0) {
            showNoResults(searchTerm);
            return;
        }

        // Create task elements for each result
        results.forEach(task => {
            const taskElement = createSearchResultElement(task, searchTerm);
            if (taskElement) {
                searchResultsList.appendChild(taskElement);
            }
        });

        // Clear status
        hideSearchStatus();
    }

    // Create a search result element
    function createSearchResultElement(task, searchTerm) {
        // Use the existing createTaskElement function if available
        if (typeof window.createTaskElement === 'function') {
            const element = window.createTaskElement(task);
            
            // Add search-specific enhancements
            enhanceSearchResultElement(element, task, searchTerm);
            
            return element;
        } else {
            // Fallback: create a basic task element
            return createBasicTaskElement(task, searchTerm);
        }
    }

    // Enhance search result element with search-specific features
    function enhanceSearchResultElement(element, task, searchTerm) {
        // Add search result class
        element.classList.add('search-result-item');

        // Add status indicator
        const statusIndicator = createStatusIndicator(task);
        element.appendChild(statusIndicator);

        // Add date information
        const dateInfo = createDateInfo(task);
        if (dateInfo) {
            element.appendChild(dateInfo);
        }

        // Highlight search terms
        highlightSearchTerms(element, searchTerm);
    }

    // Create status indicator
    function createStatusIndicator(task) {
        const indicator = document.createElement('div');
        indicator.className = 'search-status-indicator';

        if (task.is_complete) {
            indicator.classList.add('complete');
            indicator.textContent = 'Complete';
        } else if (isTaskOverdue(task)) {
            indicator.classList.add('overdue');
            indicator.textContent = 'Overdue';
        } else {
            indicator.classList.add('pending');
            indicator.textContent = 'Pending';
        }

        return indicator;
    }

    // Create date information display
    function createDateInfo(task) {
        if (!task.due_date && !task.assigned_date) {
            return null;
        }

        const dateInfo = document.createElement('div');
        dateInfo.className = 'search-date-info';

        if (task.due_date) {
            const dueDate = document.createElement('div');
            dueDate.className = 'due-date';
            dueDate.innerHTML = `<i class="fas fa-calendar-check"></i> Due: ${formatDate(task.due_date)}`;
            dateInfo.appendChild(dueDate);
        }

        if (task.assigned_date && task.assigned_date !== task.due_date) {
            const assignedDate = document.createElement('div');
            assignedDate.className = 'assigned-date';
            assignedDate.innerHTML = `<i class="fas fa-calendar-plus"></i> Assigned: ${formatDate(task.assigned_date)}`;
            dateInfo.appendChild(assignedDate);
        }

        return dateInfo;
    }

    // Highlight search terms in the element
    function highlightSearchTerms(element, searchTerm) {
        const term = searchTerm.toLowerCase();
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const lowerText = text.toLowerCase();
            const index = lowerText.indexOf(term);

            if (index !== -1) {
                const beforeText = text.substring(0, index);
                const matchText = text.substring(index, index + term.length);
                const afterText = text.substring(index + term.length);

                const fragment = document.createDocumentFragment();
                
                if (beforeText) {
                    fragment.appendChild(document.createTextNode(beforeText));
                }

                const highlight = document.createElement('span');
                highlight.className = 'search-highlight';
                highlight.textContent = matchText;
                fragment.appendChild(highlight);

                if (afterText) {
                    fragment.appendChild(document.createTextNode(afterText));
                }

                textNode.parentNode.replaceChild(fragment, textNode);
            }
        });
    }

    // Create basic task element (fallback)
    function createBasicTaskElement(task, searchTerm) {
        const div = document.createElement('div');
        div.className = `task-item search-result-item ${task.is_complete ? 'complete' : ''}`;
        div.setAttribute('data-task-id', task.id);

        const title = document.createElement('h4');
        title.textContent = task.title || 'Untitled Task';
        div.appendChild(title);

        if (task.description) {
            const description = document.createElement('p');
            description.textContent = task.description;
            div.appendChild(description);
        }

        // Add status indicator
        const statusIndicator = createStatusIndicator(task);
        div.appendChild(statusIndicator);

        // Add date info
        const dateInfo = createDateInfo(task);
        if (dateInfo) {
            div.appendChild(dateInfo);
        }

        // Highlight search terms
        highlightSearchTerms(div, searchTerm);

        return div;
    }

    // Utility functions
    function isTaskOverdue(task) {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today && !task.is_complete;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function updateSearchResultsCount(count, searchTerm) {
        if (count === 0) {
            searchResultsCount.textContent = 'No results';
        } else if (count === 1) {
            searchResultsCount.textContent = '1 result';
        } else {
            searchResultsCount.textContent = `${count} results`;
        }
    }

    function showNoResults(searchTerm) {
        searchResultsList.innerHTML = `
            <div class="no-search-results">
                <i class="fas fa-search"></i>
                <p>No tasks found for "${searchTerm}"</p>
                <p>Try different keywords or check your spelling.</p>
            </div>
        `;
    }

    function showSearchResults() {
        isSearchActive = true;
        searchResults.style.display = 'block';
        normalTaskView.style.display = 'none';
        
        // Disable the filter dropdown during search
        if (taskFilterSelect) {
            taskFilterSelect.disabled = true;
            taskFilterSelect.style.opacity = '0.5';
        }
    }

    function hideSearchResults() {
        isSearchActive = false;
        searchResults.style.display = 'none';
        normalTaskView.style.display = 'block';
        
        // Re-enable the filter dropdown
        if (taskFilterSelect) {
            taskFilterSelect.disabled = false;
            taskFilterSelect.style.opacity = '1';
        }
    }

    function showSearchStatus(message, isError = false) {
        searchResultsStatus.textContent = message;
        searchResultsStatus.className = `status ${isError ? 'error' : ''}`;
        searchResultsStatus.style.display = 'block';
    }

    function hideSearchStatus() {
        searchResultsStatus.style.display = 'none';
    }

    function clearSearch() {
        // Clear input and hide clear button
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        currentSearchTerm = '';

        // Hide search results and show normal view
        hideSearchResults();

        // Clear any pending debounce timer
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = null;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTaskSearch);
    } else {
        initializeTaskSearch();
    }

    // Export functions for external use if needed
    window.taskSearch = {
        performSearch,
        clearSearch,
        isSearchActive: () => isSearchActive
    };

})();
