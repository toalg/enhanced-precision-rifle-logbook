# Gun Profiles Setup Guide

## Overview
This guide will help you set up the Gun Profiles feature with Supabase backend for your Enhanced Precision Rifle Logbook app.

## Prerequisites
- Supabase project with existing precision rifle schema
- React Native app with Supabase client configured
- Access to Supabase SQL Editor

## Step 1: Run Schema Extensions

### 1.1 Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Create a new query

### 1.2 Execute Schema Extensions
Copy and paste the contents of `supabase_schema_extensions.sql` into the SQL Editor and run it.

This will:
- Add new columns to `rifle_profiles` table
- Add `rounds_fired` column to `shooting_sessions` table
- Create database functions for round counting and cleaning
- Create indexes for better performance
- Create a view for cleaning status
- Set up proper permissions

### 1.3 Verify Schema Changes
After running the SQL, you should see:
- New columns in `rifle_profiles` table
- New functions in the Functions section
- New view called `rifle_cleaning_status`

## Step 2: Test Schema Setup

### 2.1 Run Test Script
```bash
cd PrecisionRifleLogbook
node test-supabase-schema.js
```

This script will test:
- ✅ Supabase connection
- ✅ Schema extensions
- ✅ Database functions
- ✅ Database view
- ✅ Profile creation

### 2.2 Expected Output
```
🚀 Starting Supabase Schema Tests...

🔍 Testing Supabase Connection...
✅ Supabase connection successful

🔍 Testing Schema Extensions...
✅ New columns exist in rifle_profiles table

🔍 Testing Database Functions...
✅ Database functions are working

🔍 Testing Database View...
✅ rifle_cleaning_status view is working

🔍 Testing Profile Creation...
✅ Test profile created successfully
✅ Test profile cleaned up

📊 Test Results:
✅ Passed: 5
❌ Failed: 0

🎉 All tests passed! Your Supabase schema is ready for Gun Profiles.
```

## Step 3: App Integration

### 3.1 Updated Files
The following files have been updated:

- `src/services/GunProfileService.js` - Complete CRUD operations
- `src/screens/GunProfilesScreen.js` - UI with all new fields
- `supabase_schema_extensions.sql` - Database schema
- `test-supabase-schema.js` - Schema validation tests

### 3.2 New Features
- **Extended Profile Fields**: Serial number, purchase date, manufacturer, model
- **Round Counting**: Automatic tracking via database triggers
- **Cleaning Reminders**: Based on round count and interval
- **Real-time Sync**: Live updates across devices
- **Database Functions**: Server-side logic for cleaning status

## Step 4: Test the App

### 4.1 Build and Run
```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

### 4.2 Test Gun Profiles
1. Navigate to the **Profiles** tab
2. Tap **"Add Rifle Profile"**
3. Fill in the form with test data:
   - Name: "Test Rifle"
   - Caliber: ".308 Winchester"
   - Manufacturer: "Remington"
   - Model: "700 SPS"
   - Serial Number: "TEST123"
   - Purchase Date: "2023-01-01"
   - Cleaning Interval: "200"
   - Notes: "Test profile"
4. Tap **"Save Profile"**

### 4.3 Verify Features
- ✅ Profile appears in the list
- ✅ Cleaning status shows correctly
- ✅ Round count starts at 0
- ✅ Real-time updates work

## Step 5: Integration with Sessions

### 5.1 Session Integration
When you create shooting sessions, the round count will automatically update for the selected rifle profile.

### 5.2 Cleaning Reminders
- Profiles will show cleaning warnings when they exceed the cleaning interval
- Use the "Mark as Cleaned" button to reset the counter
- Cleaning status is calculated server-side for consistency

## Troubleshooting

### Common Issues

#### 1. Schema Extension Errors
**Error**: `column "total_rounds" already exists`
**Solution**: The `IF NOT EXISTS` clause should prevent this. If it occurs, the column already exists and you can proceed.

#### 2. Permission Errors
**Error**: `permission denied for table rifle_profiles`
**Solution**: Check that RLS policies are properly configured for authenticated users.

#### 3. Function Not Found
**Error**: `function "mark_rifle_cleaned" does not exist`
**Solution**: Re-run the schema extensions SQL to create the functions.

#### 4. App Crashes
**Error**: App crashes when accessing Gun Profiles
**Solution**: Check that Supabase client is properly configured in `src/config/supabase.js`

### Debug Commands

#### Check Supabase Connection
```bash
node test-supabase-schema.js
```

#### Check App Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

#### Reset Database (Development Only)
```sql
-- WARNING: This will delete all data
TRUNCATE TABLE rifle_profiles CASCADE;
TRUNCATE TABLE shooting_sessions CASCADE;
```

## Next Steps

### Phase 2: Advanced Features
1. **Profile Selection Screen**: Choose rifle for new sessions
2. **Session Integration**: Pre-populate rifle data in session forms
3. **Analytics Integration**: Rifle-specific statistics
4. **Photo Integration**: Associate target photos with profiles

### Phase 3: Production Features
1. **Push Notifications**: iOS cleaning reminders
2. **Offline Support**: Local caching and sync
3. **Export/Import**: Profile data backup
4. **Advanced Analytics**: Cleaning trends and maintenance schedules

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run the test script to verify schema setup
3. Check Supabase logs in the dashboard
4. Review React Native logs for app-specific errors

## Schema Reference

### rifle_profiles Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User reference |
| name | TEXT | Rifle name |
| caliber | TEXT | Caliber |
| manufacturer | TEXT | Manufacturer |
| model | TEXT | Model |
| serial_number | TEXT | Serial number |
| purchase_date | DATE | Purchase date |
| firearm_type | TEXT | Type (rifle, handgun, shotgun) |
| total_rounds | INTEGER | Total rounds fired |
| last_cleaned_at | INTEGER | Rounds when last cleaned |
| cleaning_interval | INTEGER | Cleaning interval |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Database Functions
- `update_rifle_total_rounds()` - Auto-updates round count
- `mark_rifle_cleaned(profile_name, user_uuid)` - Marks rifle as cleaned
- `get_rifles_needing_cleaning(user_uuid)` - Returns rifles needing cleaning

### Database Views
- `rifle_cleaning_status` - Enhanced view with cleaning calculations 