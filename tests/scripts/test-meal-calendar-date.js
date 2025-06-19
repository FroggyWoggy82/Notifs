/**
 * Test script to check meal calendar date selection
 */

console.log('🗓️ Testing Meal Calendar Date Selection');

// Check what the current date is
const today = new Date();
const todayString = today.toISOString().split('T')[0];

console.log('Current date:', todayString);
console.log('Current date object:', today);
console.log('Day of month:', today.getDate());
console.log('Month:', today.getMonth() + 1); // +1 because getMonth() is 0-based
console.log('Year:', today.getFullYear());

// Format date like the meal calendar does (OLD WAY - UTC)
function formatDateKeyOld(date) {
    return date.toISOString().split('T')[0];
}

// Format date like the meal calendar does (NEW WAY - Local timezone)
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

console.log('Formatted date key (OLD - UTC):', formatDateKeyOld(today));
console.log('Formatted date key (NEW - Local):', formatDateKey(today));

// Test if today is May 27th or 28th using local dates
console.log('Is today May 27 (local)?', formatDateKey(today) === '2025-05-27');
console.log('Is today May 28 (local)?', formatDateKey(today) === '2025-05-28');

// Check timezone information
console.log('\n🌍 Timezone Information:');
console.log('Timezone offset (minutes):', today.getTimezoneOffset());
console.log('Local time string:', today.toString());
console.log('UTC time string:', today.toUTCString());
console.log('ISO string:', today.toISOString());

// Check local date vs UTC date
const localDateString = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

console.log('\n📅 Date Comparison:');
console.log('Local date (YYYY-MM-DD):', localDateString);
console.log('UTC date (YYYY-MM-DD):', formatDateKey(today));
console.log('Are they the same?', localDateString === formatDateKey(today));

console.log('✅ Date test completed');
