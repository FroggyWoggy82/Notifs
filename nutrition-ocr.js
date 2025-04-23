// Import required libraries
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');

// Create a client
// Option 1: Using environment variable (recommended)
const client = new vision.ImageAnnotatorClient();

// Option 2: Explicitly providing credentials
// const client = new vision.ImageAnnotatorClient({
//   keyFilename: './path/to/your-project-credentials.json'
// });

// Function to detect text in a nutrition label image
async function detectNutritionLabel(filePath) {
  try {
    // Performs text detection on the local file
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      console.error('No text detected in the image');
      return null;
    }
    
    // Get the full text
    const fullText = detections[0].description;
    console.log('Raw detected text:');
    console.log(fullText);
    
    // Parse nutrition information
    const nutritionData = parseNutritionText(fullText);
    
    return {
      rawText: fullText,
      parsedData: nutritionData
    };
  } catch (error) {
    console.error('Error detecting text:', error);
    throw error;
  }
}

// Function to parse nutrition information from detected text
function parseNutritionText(text) {
  // Initialize nutrition data object with common nutrition label fields
  const nutritionData = {
    calories: null,
    totalFat: null,
    saturatedFat: null,
    transFat: null,
    cholesterol: null,
    sodium: null,
    totalCarbohydrate: null,
    dietaryFiber: null,
    sugars: null,
    protein: null,
    vitaminD: null,
    calcium: null,
    iron: null,
    potassium: null
  };
  
  // Split text into lines for easier processing
  const lines = text.split('\n');
  
  // Process each line to extract nutrition information
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    
    // Extract calories
    if (line.includes('calories') || line.match(/calories\s*\d+/)) {
      const caloriesMatch = line.match(/calories\s*(\d+(\.\d+)?)/i) || 
                           line.match(/(\d+(\.\d+)?)\s*calories/i);
      if (caloriesMatch) {
        nutritionData.calories = parseFloat(caloriesMatch[1]);
      }
    }
    
    // Extract total fat
    if (line.includes('total fat') || line.includes('fat')) {
      const fatMatch = line.match(/total fat\s*(\d+(\.\d+)?)\s*g/i) || 
                      line.match(/fat\s*(\d+(\.\d+)?)\s*g/i);
      if (fatMatch) {
        nutritionData.totalFat = parseFloat(fatMatch[1]);
      }
    }
    
    // Extract saturated fat
    if (line.includes('saturated fat') || line.includes('sat fat')) {
      const satFatMatch = line.match(/saturated fat\s*(\d+(\.\d+)?)\s*g/i) || 
                         line.match(/sat fat\s*(\d+(\.\d+)?)\s*g/i);
      if (satFatMatch) {
        nutritionData.saturatedFat = parseFloat(satFatMatch[1]);
      }
    }
    
    // Extract trans fat
    if (line.includes('trans fat')) {
      const transFatMatch = line.match(/trans fat\s*(\d+(\.\d+)?)\s*g/i);
      if (transFatMatch) {
        nutritionData.transFat = parseFloat(transFatMatch[1]);
      }
    }
    
    // Extract cholesterol
    if (line.includes('cholesterol')) {
      const cholesterolMatch = line.match(/cholesterol\s*(\d+(\.\d+)?)\s*mg/i);
      if (cholesterolMatch) {
        nutritionData.cholesterol = parseFloat(cholesterolMatch[1]);
      }
    }
    
    // Extract sodium
    if (line.includes('sodium')) {
      const sodiumMatch = line.match(/sodium\s*(\d+(\.\d+)?)\s*mg/i);
      if (sodiumMatch) {
        nutritionData.sodium = parseFloat(sodiumMatch[1]);
      }
    }
    
    // Extract total carbohydrate
    if (line.includes('total carbohydrate') || line.includes('carbohydrate')) {
      const carbMatch = line.match(/total carbohydrate\s*(\d+(\.\d+)?)\s*g/i) || 
                       line.match(/carbohydrate\s*(\d+(\.\d+)?)\s*g/i);
      if (carbMatch) {
        nutritionData.totalCarbohydrate = parseFloat(carbMatch[1]);
      }
    }
    
    // Extract dietary fiber
    if (line.includes('dietary fiber') || line.includes('fiber')) {
      const fiberMatch = line.match(/dietary fiber\s*(\d+(\.\d+)?)\s*g/i) || 
                        line.match(/fiber\s*(\d+(\.\d+)?)\s*g/i);
      if (fiberMatch) {
        nutritionData.dietaryFiber = parseFloat(fiberMatch[1]);
      }
    }
    
    // Extract sugars
    if (line.includes('sugars')) {
      const sugarsMatch = line.match(/sugars\s*(\d+(\.\d+)?)\s*g/i);
      if (sugarsMatch) {
        nutritionData.sugars = parseFloat(sugarsMatch[1]);
      }
    }
    
    // Extract protein
    if (line.includes('protein')) {
      const proteinMatch = line.match(/protein\s*(\d+(\.\d+)?)\s*g/i);
      if (proteinMatch) {
        nutritionData.protein = parseFloat(proteinMatch[1]);
      }
    }
    
    // Extract vitamin D
    if (line.includes('vitamin d')) {
      const vitaminDMatch = line.match(/vitamin d\s*(\d+(\.\d+)?)\s*(mcg|µg|%)/i);
      if (vitaminDMatch) {
        nutritionData.vitaminD = parseFloat(vitaminDMatch[1]);
      }
    }
    
    // Extract calcium
    if (line.includes('calcium')) {
      const calciumMatch = line.match(/calcium\s*(\d+(\.\d+)?)\s*(mg|%)/i);
      if (calciumMatch) {
        nutritionData.calcium = parseFloat(calciumMatch[1]);
      }
    }
    
    // Extract iron
    if (line.includes('iron')) {
      const ironMatch = line.match(/iron\s*(\d+(\.\d+)?)\s*(mg|%)/i);
      if (ironMatch) {
        nutritionData.iron = parseFloat(ironMatch[1]);
      }
    }
    
    // Extract potassium
    if (line.includes('potassium')) {
      const potassiumMatch = line.match(/potassium\s*(\d+(\.\d+)?)\s*mg/i);
      if (potassiumMatch) {
        nutritionData.potassium = parseFloat(potassiumMatch[1]);
      }
    }
  }
  
  return nutritionData;
}

// Function to save results to a JSON file
function saveResults(data, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Results saved to ${outputPath}`);
}

// Main function to run the nutrition label OCR
async function main() {
  // Replace with the path to your nutrition label image
  const imagePath = './path/to/your/nutrition-label.jpg';
  const outputPath = './nutrition-results.json';
  
  console.log(`Analyzing nutrition label: ${imagePath}`);
  console.log('----------------------------------------');
  
  try {
    // Detect and parse nutrition information
    const results = await detectNutritionLabel(imagePath);
    
    if (results) {
      console.log('\n=== PARSED NUTRITION DATA ===');
      console.log(JSON.stringify(results.parsedData, null, 2));
      
      // Save results to file
      saveResults(results, outputPath);
    }
    
    console.log('\nAnalysis complete!');
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

// If this file is run directly (not imported as a module)
if (require.main === module) {
  // Run the example
  main();
}

// Export functions for use in other files
module.exports = {
  detectNutritionLabel,
  parseNutritionText
};
