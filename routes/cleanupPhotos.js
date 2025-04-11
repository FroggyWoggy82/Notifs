/**
 * Cleanup script for progress photos
 * This script checks if the files referenced in the database actually exist on disk
 * and removes database entries for missing files
 */

const fs = require('fs');
const path = require('path');
const db = require('../db');

// Define the directory where progress photos are stored
const progressPhotosDir = path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');

async function cleanupMissingPhotos() {
    console.log('Starting cleanup of missing progress photos...');
    
    try {
        // Get all photo records from the database
        const result = await db.query('SELECT photo_id, file_path FROM progress_photos');
        const photos = result.rows;
        console.log(`Found ${photos.length} photo records in the database`);
        
        // Check each photo to see if the file exists
        const missingPhotos = [];
        for (const photo of photos) {
            // Extract the filename from the file_path
            let filePath = photo.file_path;
            
            // Remove leading slash if present
            if (filePath.startsWith('/')) {
                filePath = filePath.substring(1);
            }
            
            // Construct the full path to the file
            const fullPath = path.join(__dirname, '..', 'public', filePath);
            
            // Check if the file exists
            const fileExists = fs.existsSync(fullPath);
            if (!fileExists) {
                missingPhotos.push(photo);
                console.log(`Photo ID ${photo.photo_id} is missing: ${fullPath}`);
            }
        }
        
        console.log(`Found ${missingPhotos.length} missing photos out of ${photos.length} total`);
        
        // If there are missing photos, remove them from the database
        if (missingPhotos.length > 0) {
            const missingPhotoIds = missingPhotos.map(photo => photo.photo_id);
            const deleteResult = await db.query(
                'DELETE FROM progress_photos WHERE photo_id = ANY($1) RETURNING photo_id',
                [missingPhotoIds]
            );
            console.log(`Deleted ${deleteResult.rowCount} missing photo records from the database`);
            console.log('Deleted photo IDs:', deleteResult.rows.map(row => row.photo_id).join(', '));
        } else {
            console.log('No missing photos found. Database is clean.');
        }
        
        return {
            totalPhotos: photos.length,
            missingPhotos: missingPhotos.length,
            deletedPhotos: missingPhotos.length > 0 ? missingPhotos.map(p => p.photo_id) : []
        };
    } catch (error) {
        console.error('Error cleaning up missing photos:', error);
        throw error;
    }
}

// Export the function for use in other modules
module.exports = {
    cleanupMissingPhotos
};

// If this script is run directly, execute the cleanup
if (require.main === module) {
    cleanupMissingPhotos()
        .then(result => {
            console.log('Cleanup completed successfully:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('Cleanup failed:', error);
            process.exit(1);
        });
}
