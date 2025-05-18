// Fix date display in the UI
console.log('Fixing date display in the UI...');

// Override the toLocaleDateString method to add one day to the date
const originalToLocaleDateString = Date.prototype.toLocaleDateString;
Date.prototype.toLocaleDateString = function() {
    // Create a new date object with one day added
    const newDate = new Date(this);
    newDate.setDate(newDate.getDate() + 1);
    
    // Call the original method on the new date
    return originalToLocaleDateString.apply(newDate, arguments);
};

console.log('Date display fixed!');
