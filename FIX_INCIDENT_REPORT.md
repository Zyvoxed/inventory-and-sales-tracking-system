# Fix for Incident Report Update Issue

## Problem
When marking an incident as "Resolved", the backend returns "Could not update incident status" error.

## Root Cause
The PUT endpoint was trying to set `updated_at = NOW()`, but the `incident_report` table doesn't have that column.

## Solution Applied
Removed the `updated_at` column update from the PUT endpoint in `backend/server.js`.

## Steps to Test

### 1. Stop any running Node servers
Press `Ctrl+C` in any terminal running `node server.js`

### 2. Start the backend server fresh
```powershell
cd "d:\PERSONAL FILES\Documents\USTP Villanueva\Inventory_and_Sales_Tracking_System\inventory-and-sales-tracking-system\backend"
node server.js
```

Look for this output:
```
Connected to MySQL
Server running on port 8081
```

### 3. Open browser console (F12) and try marking an incident as Resolved

You should see in the browser console:
```
Updating incident [ID] to Resolved
Successfully updated incident [ID]
```

### 4. Check the backend server console

You should see:
```
PUT /incident-report/:id received - id: [ID], status: Resolved, description: undefined
PUT /incident-report/:id - SQL: UPDATE incident_report SET status = ? WHERE incident_id = ?
Params: [ 'Resolved', [ID] ]
PUT /incident-report/:id - Success! Affected rows: 1
```

### 5. If it still fails

Check the backend console for the exact SQL error. It will show something like:
```
PUT /incident-report/:id error: [database error message]
```

## Files Modified
- `backend/server.js` - Removed `updated_at = NOW()` from PUT endpoint, added detailed logging
