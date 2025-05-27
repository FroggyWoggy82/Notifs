// cleanup-orphaned-photos.js
const db = require('../utils/db');
const fs = require('fs');
const path = require('path');

async function cleanupOrphanedPhotos() {
    try {
        console.log('Checking for orphaned progress photos...');
        
        // Get all photo records from database
        const result = await db.query('SELECT photo_id, date_taken, file_path, uploaded_at FROM progress_photos ORDER BY date_taken DESC');
        
        console.log(`Found ${result.rows.length} photos in database`);
        
        const publicDir = path.join(__dirname, '../public');
        let orphanedRecords = [];
        
        for (const photo of result.rows) {
            const filePath = path.join(publicDir, photo.file_path);
            const exists = fs.existsSync(filePath);
            
            if (!exists) {
                orphanedRecords.push(photo);
                console.log(`Orphaned record found: ${photo.file_path} (ID: ${photo.photo_id})`);
            }
        }
        
        if (orphanedRecords.length === 0) {
            console.log('No orphaned records found. All database records have corresponding files.');
            return;
        }
        
        console.log(`\nFound ${orphanedRecords.length} orphaned records out of ${result.rows.length} total records.`);
        console.log('These database records point to files that no longer exist.');
        
        console.log('\nOrphaned records that will be deleted:');
        orphanedRecords.forEach(photo => {
            console.log(`- ID: ${photo.photo_id}, Date: ${photo.date_taken}, Path: ${photo.file_path}`);
        });
        
        console.log('\nDeleting orphaned records...');
        
        // Delete the orphaned records
        for (const photo of orphanedRecords) {
            await db.query('DELETE FROM progress_photos WHERE photo_id = $1', [photo.photo_id]);
            console.log(`Deleted orphaned record: ID ${photo.photo_id}`);
        }
        console.log(`Successfully deleted ${orphanedRecords.length} orphaned records.`);
        
    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        process.exit();
    }
}

cleanupOrphanedPhotos();
