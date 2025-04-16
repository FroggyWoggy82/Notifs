// check-completions.js
const http = require('http');

function fetchCompletions() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/habits/completions?startDate=2025-04-01&endDate=2025-04-30',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                console.log('Response data:', JSON.stringify(parsedData, null, 2));
                
                // Check if there are any completions
                if (parsedData.completionsByDate) {
                    console.log('Completion dates:', Object.keys(parsedData.completionsByDate));
                    
                    for (const date in parsedData.completionsByDate) {
                        console.log(`Completions for ${date}:`, parsedData.completionsByDate[date]);
                    }
                } else {
                    console.log('No completions found in the response');
                }
            } catch (e) {
                console.error('Error parsing response:', e);
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.end();
}

fetchCompletions();
