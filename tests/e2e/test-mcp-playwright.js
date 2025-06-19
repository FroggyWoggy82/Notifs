// Test script to interact with MCP Playwright server
// This connects to the running MCP Playwright server at http://[::1]:3001

const axios = require('axios');

const MCP_PLAYWRIGHT_URL = 'http://[::1]:3001';

async function testWithMCPPlaywright() {
  try {
    console.log('🎭 Testing with MCP Playwright server...');
    
    // Example: Send a request to the MCP Playwright server
    // Note: The exact API depends on how the MCP server is configured
    
    const response = await axios.get(`${MCP_PLAYWRIGHT_URL}/health`);
    console.log('✅ MCP Playwright server is responding:', response.status);
    
    // You would typically send MCP protocol messages here
    // For example, to navigate to a page and take a screenshot
    
    console.log('🔍 MCP Playwright server is ready for testing!');
    console.log('📍 Server URL:', MCP_PLAYWRIGHT_URL);
    console.log('📍 SSE Endpoint:', `${MCP_PLAYWRIGHT_URL}/sse`);
    
  } catch (error) {
    console.error('❌ Error connecting to MCP Playwright:', error.message);
    console.log('💡 Make sure the MCP Playwright server is running on port 3001');
  }
}

// Run the test
testWithMCPPlaywright();
