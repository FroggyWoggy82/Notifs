// Product Tracking JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addProductForm = document.getElementById('addProductForm');
    const productList = document.getElementById('productList');
    const categoryFilter = document.getElementById('categoryFilter');
    const trackingFrequency = document.getElementById('trackingFrequency');
    const customFrequency = document.querySelector('.custom-frequency');
    const addProductStatus = document.getElementById('addProductStatus');
    
    // Modal Elements
    const productDetailModal = document.getElementById('productDetailModal');
    const closeButton = document.querySelector('.close-button');
    const modalProductName = document.getElementById('modalProductName');
    const modalCategory = document.getElementById('modalCategory');
    const modalStartDate = document.getElementById('modalStartDate');
    const modalFrequency = document.getElementById('modalFrequency');
    const trackingEntries = document.getElementById('trackingEntries');
    const addEntryForm = document.getElementById('addEntryForm');
    const entryProductId = document.getElementById('entryProductId');
    const entryRating = document.getElementById('entryRating');
    const ratingValue = document.getElementById('ratingValue');
    
    // Sample data (would be replaced with actual API calls)
    let products = [
        {
            id: 1,
            name: 'Vitamin C Serum',
            category: 'skin',
            startDate: '2025-04-01',
            frequency: 'weekly',
            customDays: null,
            notificationType: 'photo',
            notes: 'Starting to use this for hyperpigmentation',
            entries: [
                {
                    date: '2025-04-01',
                    rating: 5,
                    notes: 'First day using it. Skin feels a bit tingly.',
                    photoUrl: null
                },
                {
                    date: '2025-04-08',
                    rating: 6,
                    notes: 'Slight improvement in skin tone.',
                    photoUrl: null
                }
            ]
        },
        {
            id: 2,
            name: 'Probiotic Supplement',
            category: 'gut',
            startDate: '2025-03-15',
            frequency: 'biweekly',
            customDays: null,
            notificationType: 'all',
            notes: 'Taking this for digestive health',
            entries: [
                {
                    date: '2025-03-15',
                    rating: 4,
                    notes: 'Starting to take this daily.',
                    photoUrl: null
                },
                {
                    date: '2025-03-29',
                    rating: 7,
                    notes: 'Noticing less bloating after meals.',
                    photoUrl: null
                }
            ]
        }
    ];
    
    // Initialize
    loadProducts();
    
    // Event Listeners
    trackingFrequency.addEventListener('change', () => {
        if (trackingFrequency.value === 'custom') {
            customFrequency.style.display = 'block';
        } else {
            customFrequency.style.display = 'none';
        }
    });
    
    categoryFilter.addEventListener('change', loadProducts);
    
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addProduct();
    });
    
    closeButton.addEventListener('click', () => {
        productDetailModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === productDetailModal) {
            productDetailModal.style.display = 'none';
        }
    });
    
    entryRating.addEventListener('input', () => {
        ratingValue.textContent = entryRating.value;
    });
    
    addEntryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addEntry();
    });
    
    // Functions
    function loadProducts() {
        const selectedCategory = categoryFilter.value;
        let filteredProducts = products;
        
        if (selectedCategory !== 'all') {
            filteredProducts = products.filter(product => product.category === selectedCategory);
        }
        
        if (filteredProducts.length === 0) {
            productList.innerHTML = '<p>No products found. Add your first product above!</p>';
            return;
        }
        
        productList.innerHTML = '';
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id;
            
            const lastEntry = product.entries.length > 0 ? 
                product.entries[product.entries.length - 1] : null;
            
            const nextTrackingDate = getNextTrackingDate(product);
            const daysUntilNext = getDaysUntil(nextTrackingDate);
            
            let progressPercent = 0;
            if (product.frequency === 'daily') {
                progressPercent = 100; // Always due today
            } else {
                const frequencyDays = getFrequencyDays(product);
                const daysSinceLastEntry = lastEntry ? 
                    getDaysBetween(new Date(lastEntry.date), new Date()) : frequencyDays;
                progressPercent = Math.min(100, (daysSinceLastEntry / frequencyDays) * 100);
            }
            
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <span class="category-badge ${product.category}">${getCategoryName(product.category)}</span>
                <p class="next-tracking">Next tracking: ${daysUntilNext === 0 ? 'Today' : 
                    daysUntilNext === 1 ? 'Tomorrow' : 
                    `In ${daysUntilNext} days (${formatDate(nextTrackingDate)})`}</p>
                <div class="progress-indicator">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
            `;
            
            productCard.addEventListener('click', () => {
                openProductDetail(product);
            });
            
            productList.appendChild(productCard);
        });
    }
    
    function addProduct() {
        const productName = document.getElementById('productName').value;
        const productCategory = document.getElementById('productCategory').value;
        const startDate = document.getElementById('startDate').value;
        const frequency = document.getElementById('trackingFrequency').value;
        const customDays = frequency === 'custom' ? 
            parseInt(document.getElementById('customDays').value) : null;
        const notificationType = document.getElementById('notificationType').value;
        const notes = document.getElementById('productNotes').value;
        
        // Validation
        if (!productName || !productCategory || !startDate || !frequency || !notificationType) {
            showStatus(addProductStatus, 'Please fill in all required fields.', 'error');
            return;
        }
        
        if (frequency === 'custom' && (!customDays || customDays < 1)) {
            showStatus(addProductStatus, 'Please enter a valid number of days for custom frequency.', 'error');
            return;
        }
        
        // Create new product
        const newProduct = {
            id: products.length + 1,
            name: productName,
            category: productCategory,
            startDate: startDate,
            frequency: frequency,
            customDays: customDays,
            notificationType: notificationType,
            notes: notes,
            entries: []
        };
        
        // Add initial entry if notes are provided
        if (notes) {
            newProduct.entries.push({
                date: startDate,
                rating: 5, // Default middle rating
                notes: notes,
                photoUrl: null
            });
        }
        
        // In a real app, you would send this to the server
        // For now, we'll just add it to our local array
        products.push(newProduct);
        
        // Schedule notification (in a real app)
        scheduleProductNotification(newProduct);
        
        // Reset form and show success message
        addProductForm.reset();
        customFrequency.style.display = 'none';
        showStatus(addProductStatus, 'Product added successfully!', 'success');
        
        // Reload product list
        loadProducts();
    }
    
    function openProductDetail(product) {
        modalProductName.textContent = product.name;
        modalCategory.textContent = getCategoryName(product.category);
        modalStartDate.textContent = formatDate(new Date(product.startDate));
        modalFrequency.textContent = getFrequencyText(product);
        
        // Load tracking entries
        trackingEntries.innerHTML = '';
        
        if (product.entries.length === 0) {
            trackingEntries.innerHTML = '<p>No tracking entries yet.</p>';
        } else {
            // Sort entries by date (newest first)
            const sortedEntries = [...product.entries].sort((a, b) => 
                new Date(b.date) - new Date(a.date));
            
            sortedEntries.forEach(entry => {
                const entryElement = document.createElement('div');
                entryElement.className = 'tracking-entry';
                
                let entryHTML = `
                    <div class="entry-header">
                        <span class="entry-date">${formatDate(new Date(entry.date))}</span>
                        <span class="entry-rating">Rating: ${entry.rating}/10</span>
                    </div>
                `;
                
                if (entry.notes) {
                    entryHTML += `<p class="entry-notes">${entry.notes}</p>`;
                }
                
                if (entry.photoUrl) {
                    entryHTML += `<img class="entry-photo" src="${entry.photoUrl}" alt="Progress photo">`;
                }
                
                entryElement.innerHTML = entryHTML;
                trackingEntries.appendChild(entryElement);
            });
        }
        
        // Set product ID for the entry form
        entryProductId.value = product.id;
        
        // Set today's date as default for new entry
        document.getElementById('entryDate').valueAsDate = new Date();
        
        // Reset entry form
        addEntryForm.reset();
        entryRating.value = 5;
        ratingValue.textContent = '5';
        
        // Show modal
        productDetailModal.style.display = 'block';
    }
    
    function addEntry() {
        const productId = parseInt(entryProductId.value);
        const date = document.getElementById('entryDate').value;
        const rating = parseInt(entryRating.value);
        const notes = document.getElementById('entryNotes').value;
        const photoInput = document.getElementById('entryPhoto');
        
        // Find the product
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        // In a real app, you would upload the photo and get a URL
        // For now, we'll just check if a file was selected
        let photoUrl = null;
        if (photoInput.files.length > 0) {
            // This would be replaced with actual file upload logic
            photoUrl = 'photo_url_placeholder.jpg';
        }
        
        // Create new entry
        const newEntry = {
            date: date,
            rating: rating,
            notes: notes,
            photoUrl: photoUrl
        };
        
        // Add entry to product
        product.entries.push(newEntry);
        
        // Refresh the modal with updated data
        openProductDetail(product);
        
        // Show success message
        alert('Entry added successfully!');
    }
    
    // Helper Functions
    function getNextTrackingDate(product) {
        const lastEntry = product.entries.length > 0 ? 
            product.entries[product.entries.length - 1] : null;
        
        const startDate = lastEntry ? new Date(lastEntry.date) : new Date(product.startDate);
        const frequencyDays = getFrequencyDays(product);
        
        const nextDate = new Date(startDate);
        nextDate.setDate(nextDate.getDate() + frequencyDays);
        
        return nextDate;
    }
    
    function getFrequencyDays(product) {
        switch (product.frequency) {
            case 'daily': return 1;
            case 'weekly': return 7;
            case 'biweekly': return 14;
            case 'monthly': return 30;
            case 'custom': return product.customDays || 30;
            default: return 30;
        }
    }
    
    function getFrequencyText(product) {
        switch (product.frequency) {
            case 'daily': return 'Daily';
            case 'weekly': return 'Weekly';
            case 'biweekly': return 'Every 2 weeks';
            case 'monthly': return 'Monthly';
            case 'custom': return `Every ${product.customDays} days`;
            default: return 'Unknown';
        }
    }
    
    function getDaysUntil(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    }
    
    function getDaysBetween(date1, date2) {
        const diffTime = Math.abs(date2 - date1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    function getCategoryName(category) {
        switch (category) {
            case 'skin': return 'Skin Care';
            case 'hair': return 'Hair Care';
            case 'gut': return 'Gut Health';
            case 'supplement': return 'Supplement';
            case 'other': return 'Other';
            default: return 'Unknown';
        }
    }
    
    function showStatus(element, message, type) {
        element.textContent = message;
        element.className = `status ${type}`;
        
        // Hide after 5 seconds
        setTimeout(() => {
            element.className = 'status';
        }, 5000);
    }
    
    function scheduleProductNotification(product) {
        // This is a placeholder for actual notification scheduling
        console.log(`Scheduled ${product.notificationType} notification for ${product.name} with ${getFrequencyText(product)} frequency`);
        
        // In a real implementation, you would:
        // 1. Calculate the next notification date
        // 2. Send a request to the server to schedule the notification
        // 3. The server would store this in a database and use a job scheduler
        
        // For now, we'll just log it
        const nextDate = getNextTrackingDate(product);
        console.log(`Next notification scheduled for: ${formatDate(nextDate)}`);
    }
});
