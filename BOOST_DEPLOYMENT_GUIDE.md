# Ad Boost Feature - Production Deployment Guide

## Overview
This guide covers the deployment of the enhanced ad boost feature with automatic expiry cleanup and featured ads API support.

## 🎯 Features Implemented

### 1. Featured API Endpoint Support
- **Endpoint**: `GET /api/ads?featured=true`
- **Purpose**: Returns only active boosted ads for landing page featured section
- **Implementation**: Added filtering in `AdController::index()` method

### 2. Null Price Handling Fix
- **Issue**: PHP deprecation warnings when ads have null prices
- **Fix**: Added null check in `Ad::getFormattedPriceAttribute()`
- **Result**: Displays "Price on request" for null/zero prices

### 3. Automatic Boost Expiry Cleanup
- **Command**: `php artisan ads:clean-expired-boosts`
- **Schedule**: Runs automatically every hour
- **Purpose**: Removes expired boost status from ads

## 🚀 Production Deployment Steps

### Step 1: Deploy Code Changes
```bash
# Pull the latest changes
git pull origin main

# Clear application cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 2: Enable Laravel Scheduler
The scheduler is required for automatic boost expiry cleanup.

#### Option A: Using Crontab (Recommended)
```bash
# Edit the server's crontab
crontab -e

# Add this line (replace /path-to-your-project with actual path)
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

#### Option B: Using cPanel Cron Jobs
1. Login to cPanel
2. Go to "Cron Jobs"
3. Add a new cron job:
   - **Minute**: `*`
   - **Hour**: `*`
   - **Day**: `*`
   - **Month**: `*`
   - **Weekday**: `*`
   - **Command**: `cd /home/username/public_html && php artisan schedule:run`

### Step 3: Verify Deployment
```bash
# Check if the scheduler is working
php artisan schedule:list

# Expected output:
# 0 * * * *  php artisan ads:clean-expired-boosts  Next Due: XX minutes from now

# Test the cleanup command manually
php artisan ads:clean-expired-boosts

# Test the featured API endpoint
curl "https://yourdomain.com/api/ads?featured=true&limit=5"
```

## 🔧 Maintenance Commands

### Manual Boost Cleanup
```bash
# Clean expired boosts immediately
php artisan ads:clean-expired-boosts
```

### Check Scheduled Tasks
```bash
# List all scheduled tasks
php artisan schedule:list

# Run scheduler manually (for testing)
php artisan schedule:run
```

### Monitor Boost Status
```bash
# Check active boosted ads
php artisan tinker
>>> App\Models\Ad::where('is_boosted', true)->where('boost_expires_at', '>', now())->count()

# Check expired boosted ads
>>> App\Models\Ad::where('is_boosted', true)->where('boost_expires_at', '<', now())->count()
```

## 📊 API Usage Examples

### Get Featured/Boosted Ads Only
```bash
# Frontend usage (in FeaturedAds component)
GET /api/ads?featured=true&limit=8

# Alternative parameter
GET /api/ads?boosted=true&limit=10
```

### Expected Response
```json
{
  "data": [
    {
      "id": 1,
      "title": "iPhone 14 Pro",
      "price": "950000.00",
      "is_boosted": true,
      "boost_expires_at": "2025-09-24T18:00:00.000000Z",
      "formatted_price": "₦950,000.00"
    }
  ],
  "search_metadata": {
    "total_count": 1,
    "filters_applied": {
      "featured": true
    }
  }
}
```

## 🚨 Troubleshooting

### Scheduler Not Running
```bash
# Check if cron is running
sudo service cron status

# Check cron logs
sudo tail -f /var/log/cron.log

# Test scheduler manually
php artisan schedule:run -v
```

### Featured Ads Not Showing
```bash
# Check if any ads are actually boosted and not expired
php artisan tinker
>>> App\Models\Ad::where('is_boosted', true)->where('boost_expires_at', '>', now())->get(['id', 'title', 'boost_expires_at'])

# Test the API endpoint directly
curl -X GET "http://localhost:8000/api/ads?featured=true"
```

### Price Display Issues
```bash
# Check for PHP warnings in logs
tail -f storage/logs/laravel.log | grep "number_format"

# Should see no deprecation warnings after the fix
```

## 📋 Post-Deployment Checklist

- [ ] Cron job added to server
- [ ] `php artisan schedule:list` shows the cleanup task
- [ ] Featured ads API endpoint returns boosted ads only
- [ ] No PHP deprecation warnings in logs
- [ ] Manual cleanup command works: `php artisan ads:clean-expired-boosts`
- [ ] Landing page shows real boosted ads instead of dummy data
- [ ] My Ads dashboard correctly counts boosted ads
- [ ] Expired boosts are automatically cleaned up

## 🔄 Monitoring & Maintenance

### Daily Checks
- Monitor application logs for any scheduler errors
- Verify featured ads are displaying correctly on landing page

### Weekly Checks
- Review boost expiry cleanup logs
- Check for any orphaned boost records

### Monthly Checks
- Analyze boost feature usage and performance
- Review and optimize scheduler frequency if needed

## 📞 Support

If you encounter any issues during deployment:

1. Check the Laravel logs: `storage/logs/laravel.log`
2. Verify cron is running: `sudo service cron status`
3. Test commands manually before relying on automation
4. Ensure proper file permissions for the scheduler

---

**Last Updated**: September 17, 2025
**Version**: 1.0
**Environment**: Production Ready