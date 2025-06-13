#!/usr/bin/env node

/**
 * Fix Photo Storage Script
 * 
 * This script fixes the photo storage issue by:
 * 1. Cleaning up orphaned database entries (photos that don't have files)
 * 2. Setting up proper Railway volume configuration
 * 
 * Run this after setting up Railway volumes to clean up the database.
 */

const db = require('../utils/db');
const fs = require('fs');
const path = require('path');

async function fixPhotoStorage() {
    try {
        console.log('🔧 Starting photo storage fix...');
        
        // Get all photo records from database
        const result = await db.query('SELECT photo_id, date_taken, file_path, uploaded_at FROM progress_photos ORDER BY date_taken DESC');
        
        console.log(`📊 Found ${result.rows.length} photos in database`);
        
        // Determine the correct photos directory
        const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME;
        const photosDir = isRailway && process.env.RAILWAY_VOLUME_MOUNT_PATH 
            ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'progress_photos')
            : path.join(__dirname, '../public/uploads/progress_photos');
            
        console.log(`📁 Checking files in: ${photosDir}`);
        
        let orphanedRecords = [];
        let validRecords = [];
        
        for (const photo of result.rows) {
            // Convert database path to actual file path
            const fileName = path.basename(photo.file_path);
            const filePath = path.join(photosDir, fileName);
            const exists = fs.existsSync(filePath);
            
            if (!exists) {
                orphanedRecords.push(photo);
                console.log(`❌ Missing file: ${fileName} (ID: ${photo.photo_id})`);
            } else {
                validRecords.push(photo);
                console.log(`✅ Valid file: ${fileName} (ID: ${photo.photo_id})`);
            }
        }
        
        console.log(`\n📈 Summary:`);
        console.log(`   Valid photos: ${validRecords.length}`);
        console.log(`   Orphaned records: ${orphanedRecords.length}`);
        
        if (orphanedRecords.length > 0) {
            console.log(`\n🧹 Cleaning up ${orphanedRecords.length} orphaned records...`);
            
            // Delete the orphaned records
            for (const photo of orphanedRecords) {
                await db.query('DELETE FROM progress_photos WHERE photo_id = $1', [photo.photo_id]);
                console.log(`   Deleted orphaned record: ID ${photo.photo_id} (${photo.file_path})`);
            }
            
            console.log(`✅ Successfully cleaned up ${orphanedRecords.length} orphaned records.`);
        } else {
            console.log(`✅ No orphaned records found - database is clean!`);
        }
        
        // Show Railway volume configuration status
        console.log(`\n🚂 Railway Configuration:`);
        if (isRailway) {
            console.log(`   Environment: ${process.env.RAILWAY_ENVIRONMENT_NAME}`);
            console.log(`   Volume path: ${process.env.RAILWAY_VOLUME_MOUNT_PATH || 'NOT CONFIGURED'}`);
            
            if (!process.env.RAILWAY_VOLUME_MOUNT_PATH) {
                console.log(`\n⚠️  WARNING: Railway volume not configured!`);
                console.log(`   To fix this:`);
                console.log(`   1. Go to your Railway project dashboard`);
                console.log(`   2. Add environment variable: RAILWAY_VOLUME_MOUNT_PATH=/app/data`);
                console.log(`   3. Add a Volume with mount path: /app/data`);
                console.log(`   4. Redeploy your service`);
            } else {
                console.log(`✅ Railway volume is properly configured`);
            }
        } else {
            console.log(`   Running locally - using public directory`);
        }
        
        console.log(`\n🎉 Photo storage fix completed!`);
        
    } catch (err) {
        console.error('❌ Error during photo storage fix:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the fix
fixPhotoStorage();
