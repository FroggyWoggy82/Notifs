// Test the timezone logic at different times to see when the bug manifests

function testTimezoneBug(utcHour, utcMinute) {
    // Create a test date at the specified UTC time
    const testDate = new Date();
    testDate.setUTCHours(utcHour, utcMinute, 0, 0);
    
    console.log(`\n=== Testing at UTC ${utcHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')} ===`);
    console.log('UTC time:', testDate.toISOString());
    console.log('Central Time:', testDate.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    
    // New correct logic
    const centralTimeString = testDate.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const [month, day, year] = centralTimeString.split('/');
    const newDate = `${year}-${month}-${day}`;
    
    // Old buggy logic
    const oldCentralTime = new Date(testDate.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const oldYear = oldCentralTime.getFullYear();
    const oldMonth = String(oldCentralTime.getMonth() + 1).padStart(2, '0');
    const oldDay = String(oldCentralTime.getDate()).padStart(2, '0');
    const oldDate = `${oldYear}-${oldMonth}-${oldDay}`;
    
    console.log('NEW date:', newDate);
    console.log('OLD date:', oldDate);
    const bugPresent = newDate !== oldDate;
    console.log('Bug present:', bugPresent);
    
    return bugPresent;
}

// Test at various times
console.log('Testing timezone conversion at different UTC times...');

// Test when it should be 11:59 PM Central (4:59 AM UTC next day during CDT)
testTimezoneBug(4, 59);

// Test when it should be 7 PM Central (midnight UTC next day during CDT) 
testTimezoneBug(0, 0);

// Test when it should be midnight Central (5 AM UTC during CDT)
testTimezoneBug(5, 0);

// Test current time
const now = new Date();
testTimezoneBug(now.getUTCHours(), now.getUTCMinutes());
