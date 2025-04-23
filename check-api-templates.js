// Script to check the templates returned by the API
const fetch = require('node-fetch');

async function checkApiTemplates() {
  try {
    console.log('Checking templates returned by the API...');
    
    // Get templates from the API
    const response = await fetch('https://notifs-production.up.railway.app/api/workouts/templates');
    const templates = await response.json();
    
    console.log(`API returned ${templates.length} templates`);
    console.log('First template:');
    console.log(JSON.stringify(templates[0], null, 2));
    
    // Get all templates
    console.log('All templates:');
    console.log(JSON.stringify(templates, null, 2));
    
  } catch (error) {
    console.error('Error checking API templates:', error);
  }
}

checkApiTemplates().catch(console.error);
