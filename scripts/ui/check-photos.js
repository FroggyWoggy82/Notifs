// check-photos.js
const db = require('./utils/db');
const fs = require('fs');
const path = require('path');

async function checkPhotos() {
    try {
        console.log('Checking progress photos in database...');
        
        // Query the database for progress photos
        const result = await db.query('SELECT photo_id, date_taken, file_path, uploaded_at FROM progress_photos ORDER BY date_taken DESC');
        
        console.log(`Found ${result.rows.length} photos in database`);
        
        // Check if files exist
        const publicDir = path.join(__dirname, 'public');
        let missingFiles = 0;
        
        for (const photo of result.rows) {
            const filePath = path.join(publicDir, photo.file_path);
            const exists = fs.existsSync(filePath);
            
            if (!exists) {
                missingFiles++;
                console.log(`Missing file: ${filePath} (ID: ${photo.photo_id})`);
            }
        }
        
        console.log(`Total missing files: ${missingFiles} out of ${result.rows.length}`);
        
        // Print sample data
        if (result.rows.length > 0) {
            console.log('Sample photo record:');
            console.log(JSON.stringify(result.rows[0], null, 2));
        }
        
    } catch (err) {
        console.error('Error checking photos:', err);
    } finally {
        process.exit();
    }
}

checkPhotos();
