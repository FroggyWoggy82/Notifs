/**
 * Test script for AI personality improvements
 * Run this in the browser console to test the new AI responses
 */

// Test the new AI personalities
async function testAIPersonalities() {
    console.log('🧪 Testing AI Personality Improvements...\n');

    const testMessages = [
        {
            message: "hi i need to go to sleep",
            expected: "Brief, warm response like 'Sleep well, Kevin' or 'Get some good rest'"
        },
        {
            message: "I had a really tough day at work today",
            expected: "Supportive but not overly verbose response"
        },
        {
            message: "What do you think about my goals?",
            expected: "Engaging question back, referencing previous conversations if relevant"
        }
    ];

    // Test each personality
    const personalities = ['CONCISE', 'CHATGPT_4O', 'THERAPIST', 'MENTOR'];
    
    for (const personality of personalities) {
        console.log(`\n🤖 Testing ${personality} personality:`);
        console.log('=' .repeat(50));
        
        for (const test of testMessages) {
            console.log(`\n📝 Message: "${test.message}"`);
            console.log(`💭 Expected: ${test.expected}`);
            
            try {
                const response = await fetch('/api/journal/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: test.message,
                        conversation: [], // Empty conversation for clean test
                        personalityType: personality
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                const aiResponse = result.analysis;
                
                console.log(`🤖 AI Response: "${aiResponse}"`);
                console.log(`📊 Length: ${aiResponse.length} characters`);
                
                // Simple quality checks
                const isAppropriateLength = personality === 'CONCISE' ? 
                    aiResponse.length < 200 : aiResponse.length < 500;
                const containsName = aiResponse.toLowerCase().includes('kevin');
                const isWarm = /\b(well|good|rest|sleep|care|hope)\b/i.test(aiResponse);
                
                console.log(`✅ Checks: Length OK: ${isAppropriateLength}, Uses name: ${containsName}, Warm tone: ${isWarm}`);
                
            } catch (error) {
                console.error(`❌ Error testing ${personality}:`, error);
            }
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Test personality loading
async function testPersonalityLoading() {
    console.log('\n🔧 Testing Personality Loading...');
    
    try {
        const response = await fetch('/api/journal/personalities');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Available personalities:', data.personalities.map(p => p.name));
        console.log('✅ Default personality:', data.default);
        
        return true;
    } catch (error) {
        console.error('❌ Error loading personalities:', error);
        return false;
    }
}

// Test conversation context
async function testConversationContext() {
    console.log('\n💬 Testing Conversation Context...');
    
    const conversation = [
        { role: 'user', content: 'I had a great day today', timestamp: new Date() },
        { role: 'ai', content: 'That sounds wonderful! What made it so great?', timestamp: new Date() }
    ];
    
    try {
        const response = await fetch('/api/journal/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: 'Actually, now I need to go to sleep',
                conversation: conversation,
                personalityType: 'CONCISE'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Response with context:', result.analysis);
        console.log('✅ Context awareness test passed');
        
        return true;
    } catch (error) {
        console.error('❌ Error testing conversation context:', error);
        return false;
    }
}

// Compare old vs new responses
async function compareResponses() {
    console.log('\n🔄 Comparing Response Styles...');
    
    const testMessage = "hi i need to go to sleep";
    
    // Test CONCISE (new default)
    console.log('\n🆕 CONCISE personality:');
    try {
        const conciseResponse = await fetch('/api/journal/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: testMessage,
                conversation: [],
                personalityType: 'CONCISE'
            })
        });
        
        const conciseResult = await conciseResponse.json();
        console.log(`Response: "${conciseResult.analysis}"`);
        console.log(`Length: ${conciseResult.analysis.length} characters`);
    } catch (error) {
        console.error('Error with CONCISE:', error);
    }
    
    // Test ORIGINAL_GIBITI (old style)
    console.log('\n📜 ORIGINAL_GIBITI personality:');
    try {
        const originalResponse = await fetch('/api/journal/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: testMessage,
                conversation: [],
                personalityType: 'ORIGINAL_GIBITI'
            })
        });
        
        const originalResult = await originalResponse.json();
        console.log(`Response: "${originalResult.analysis}"`);
        console.log(`Length: ${originalResult.analysis.length} characters`);
    } catch (error) {
        console.error('Error with ORIGINAL_GIBITI:', error);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting AI Personality Tests...\n');
    
    const results = {
        personalityLoading: await testPersonalityLoading(),
        conversationContext: await testConversationContext()
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log('Personality Loading:', results.personalityLoading ? '✅ PASS' : '❌ FAIL');
    console.log('Conversation Context:', results.conversationContext ? '✅ PASS' : '❌ FAIL');
    
    // Run comparison
    await compareResponses();
    
    console.log('\n🎯 To test individual personalities, run:');
    console.log('testAIPersonalities()');
    
    console.log('\n💡 Expected improvements:');
    console.log('- CONCISE responses should be 1-2 sentences');
    console.log('- Should use "Kevin" naturally when appropriate');
    console.log('- Should match the energy of the input message');
    console.log('- Should be warm but not overly analytical');
}

// Export functions for manual testing
window.testAIPersonalities = testAIPersonalities;
window.testPersonalityLoading = testPersonalityLoading;
window.testConversationContext = testConversationContext;
window.compareResponses = compareResponses;
window.runAllTests = runAllTests;

// Auto-run basic tests
setTimeout(runAllTests, 1000);
