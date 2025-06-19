# Railway Photo Storage Fix

## The Problem

Your photo uploads were working initially but then disappearing the next day because **Railway has an ephemeral file system**. When Railway restarts or redeploys your container, all files saved to the local file system get deleted, but the database entries remain. This causes:

1. ✅ Mobile uploads work initially (files saved + database entries created)
2. ❌ Next day they don't work (Railway restarted, files deleted, database entries orphaned)
3. ❌ 503 errors when loading photos (files don't exist)

## The Solution

I've updated your code to use Railway's persistent volume storage instead of the ephemeral file system.

### Code Changes Made

All photo upload routes now use this pattern:
```javascript
// Use Railway persistent volume for storage (matches server.js pattern)
const isProduction = process.env.NODE_ENV === 'production';
const progressPhotosDir = isProduction
    ? '/data/uploads/progress_photos'
    : path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');
```

**Files Updated:**
- ✅ `server.js` - Added volume photo serving
- ✅ `routes/basic-upload.js` - Updated storage path
- ✅ `routes/mobile-upload.js` - Updated storage path  
- ✅ `routes/photo-upload.js` - Updated storage path
- ✅ `routes/simple-photo-upload.js` - Updated storage path
- ✅ `routes/unified-photo-upload.js` - Updated storage path

### Railway Configuration Required

**You need to configure your Railway volume to mount at `/data`:**

1. **Go to your Railway project dashboard**
2. **Click on your "Notifs" service**
3. **Go to the "Settings" tab**
4. **Find the "Volumes" section**
5. **Edit your existing volume (`religion-volume`)**
6. **Set the mount path to: `/data`**
7. **Save and redeploy**

### Verification Steps

After deploying the changes:

1. **Check the server logs** - You should see:
   ```
   [SERVER] Serving photos from Railway volume: /data/uploads/progress_photos
   ```

2. **Test photo upload** - Upload a photo and verify it works

3. **Wait for Railway restart** - Photos should persist after restarts

4. **Run cleanup script** (optional) - Remove orphaned database entries:
   ```bash
   node scripts/fix-photo-storage.js
   ```

## How It Works

### Development (Local)
- Photos stored in: `public/uploads/progress_photos/`
- Served via: Express static middleware
- Database paths: `/uploads/progress_photos/filename.jpg`

### Production (Railway)
- Photos stored in: `/data/uploads/progress_photos/` (persistent volume)
- Served via: Custom static route for volume
- Database paths: `/uploads/progress_photos/filename.jpg` (same as local)

### Volume Serving
The server now includes this logic:
```javascript
// Serve photos from Railway volume in production
if (isProduction) {
    const volumePhotosPath = '/data/uploads/progress_photos';
    app.use('/uploads/progress_photos', express.static(volumePhotosPath));
    console.log(`[SERVER] Serving photos from Railway volume: ${volumePhotosPath}`);
}
```

## Troubleshooting

### If photos still disappear:
1. Check Railway volume mount path is `/data`
2. Check server logs for volume serving message
3. Verify `NODE_ENV=production` is set in Railway

### If uploads fail:
1. Check Railway volume has enough space
2. Check server logs for permission errors
3. Verify volume is properly mounted

### If old photos are missing:
1. Run the cleanup script to remove orphaned database entries
2. Old photos uploaded before this fix are permanently lost (Railway deleted them)

## Benefits

✅ **Persistent Storage** - Photos survive Railway restarts/redeploys
✅ **Same URLs** - No changes needed to frontend code
✅ **Automatic Cleanup** - Script to remove orphaned database entries
✅ **Development Compatible** - Works locally and in production
✅ **Performance** - Direct volume serving, no database queries for files

Your photo upload issue should now be completely resolved!
