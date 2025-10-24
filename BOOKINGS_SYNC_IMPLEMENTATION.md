# Bookings Sync System Implementation

## Overview

Successfully implemented an appointment bookings system that syncs with API, stores data in IndexedDB, supports offline editing, and syncs changes back to the server.

## Implementation Date

October 18, 2025

## Changes Made

### 1. IndexedDB Schema Updates (`plugins/indexeddb.js`)

#### Database Version

- Upgraded from version `5` to version `6`

#### New Object Store: `bookings`

```javascript
{
  keyPath: "stid",
  indexes: {
    dataSource: { unique: false },
    lastSyncedAt: { unique: false }
  }
}
```

#### New CRUD Methods

- `addBooking(booking)` - Add or update a booking
- `addBookings(bookings)` - Bulk add bookings
- `getBookings()` - Get all bookings
- `getBooking(stid)` - Get booking by stid
- `updateBooking(booking)` - Update existing booking
- `deleteBooking(stid)` - Delete a booking
- `clearBookings()` - Clear all bookings
- `getUnsyncedBookings()` - Get bookings marked as "local" (edited offline)

### 2. System Initialization Updates (`plugins/system-init.js`)

#### New Method: `syncBookings(username)`

Fetches appointment data from API and syncs to IndexedDB:

- **Endpoint**: `GET /api/parenting2025_census/get/homevisit/getchildsample_app.php?homevisitor=${username}`
- **Functionality**:
  - Fetches bookings from API
  - Merges with local data (preserves offline edits)
  - Stores in IndexedDB with `dataSource` tracking
  - Records last sync timestamp

#### New Method: `pushBookingsToAPI()`

Pushes offline-edited bookings back to the server:

- **Endpoint**: `PUT /api/parenting2025_census/put/homevisit/putdata_arr.php`
- **Payload Format**:
  ```json
  {
    "variable": [["appointmentDate", "appointmentTime"]],
    "value": [["2025-10-20", "16:00 น."]],
    "pk": [["stid"]],
    "pkval": [["900601010105"]],
    "tb": "homevisitor_sample_students"
  }
  ```
- **Functionality**:
  - Finds bookings with `dataSource: "local"`
  - Sends each booking to API
  - Updates to `dataSource: "api"` on success
  - Logs errors for failed syncs

### 3. Dashboard Page Updates (`pages/index.vue`)

#### Updated: `loadVisitors()`

Now joins bookings with visitors:

```javascript
// Load bookings from IndexedDB
const bookings = await this.$indexedDB.getBookings();

// Create a map for quick lookup
const bookingsMap = new Map();
bookings.forEach((booking) => {
  bookingsMap.set(booking.stid, booking);
});

// Join with visitors
const booking = bookingsMap.get(visitor.stid);
visitor.appointmentDate = booking?.appointmentDate || null;
visitor.appointmentTime = booking?.appointmentTime || null;
```

#### Updated: `saveAppointment()`

Now saves to bookings table:

- Converts Thai year to Christian year for storage
- Saves to IndexedDB bookings table with `dataSource: "local"`
- Updates visitor display immediately
- Triggers background sync to API if online

#### Updated: `scheduleAppointment()`

Now pre-fills existing appointment dates:

- If patient has existing `appointmentDate`, uses it
- Converts to Thai year for display
- Otherwise uses current date

#### Updated: `initializeSystem()`

Integrated bookings sync into startup flow:

```javascript
if (this.$store.state.isOnline && this.$auth.user?.username) {
  // Sync visitors
  await this.$systemInit.syncVisitors(this.$auth.user.username);

  // Sync bookings (NEW)
  await this.$systemInit.syncBookings(this.$auth.user.username);

  // Push any unsynced bookings (NEW)
  await this.$systemInit.pushBookingsToAPI();
}
```

## Data Flow

### 1. Initial Load (Online)

```
User Opens App
    ↓
System Init → syncVisitors()
    ↓
System Init → syncBookings()
    ↓
System Init → pushBookingsToAPI()
    ↓
loadVisitors() joins bookings with visitors
    ↓
Display in UI
```

### 2. Creating/Editing Appointment

```
User edits appointment
    ↓
saveAppointment() saves to bookings table
    (with dataSource: "local")
    ↓
Update visitor display
    ↓
If online: pushBookingsToAPI() (background)
```

### 3. Offline → Online Sync

```
User goes offline
    ↓
User edits appointments (saved with dataSource: "local")
    ↓
User comes back online
    ↓
initializeSystem() runs
    ↓
pushBookingsToAPI() sends pending changes
    ↓
syncBookings() fetches latest from server
    ↓
Reload visitors with updated bookings
```

## Data Schema

### Bookings Table Structure

```javascript
{
  stid: "900601010105",           // Primary key (student ID)
  appointmentDate: "2025-10-20",  // ISO date format (YYYY-MM-DD)
  appointmentTime: "16:00 น.",   // Time with Thai label
  dataSource: "api" | "local",    // Track sync status
  lastSyncedAt: "2025-10-18T10:00:00Z" // Last sync timestamp
}
```

### API Response Format

The API endpoint returns:

```javascript
{
  results: [
    {
      stid: "900601010105",
      appointmentDate: "2025-10-20",
      appointmentTime: "16:00 น.",
      // ... other fields
    },
  ];
}
```

## Key Features

### ✅ Offline Support

- Bookings are stored in IndexedDB
- Edits work offline with `dataSource: "local"` tracking
- Changes sync automatically when online

### ✅ Conflict Resolution

- Local changes (marked as "local") are preserved during sync
- API data only overwrites if not edited locally
- Push happens before pull to send pending changes first

### ✅ Background Sync

- When saving an appointment online, immediately pushes to API
- On startup, automatically syncs if online
- No user intervention required

### ✅ Data Integrity

- Separate bookings table keeps appointment data distinct
- Join pattern prevents data duplication
- Tracks sync status per booking

## Offline → Online Sync Enhancement

Added automatic bookings sync when app comes back online:

```javascript
async handleOnlineStatusChange() {
  if (this.$store.state.isOnline) {
    setTimeout(async () => {
      // Sync visitor changes from queue
      await this.processSyncQueue()

      // Sync bookings that were edited offline
      await this.$systemInit.pushBookingsToAPI()  // Push local changes first
      await this.$systemInit.syncBookings(username)  // Then fetch latest
      await this.loadVisitors()  // Reload with updated bookings
    }, 2000)
  }
}
```

## Testing Checklist

- [ ] Create new appointment while online → should sync immediately
- [ ] Edit existing appointment while online → should update API
- [ ] Create appointment while offline → should save locally
- [ ] Go online after offline edits → should sync automatically
- [ ] View appointment dates on dashboard → should display correctly
- [ ] Edit appointment form → should pre-fill existing dates
- [ ] Check IndexedDB → bookings table should have data
- [ ] Check console logs → should show sync messages
- [ ] Test offline → online transition → bookings should sync automatically

## Troubleshooting

### Appointments not showing up

1. Check browser console for sync errors
2. Verify IndexedDB has bookings table (version 6)
3. Check that `loadVisitors()` is joining bookings correctly

### Sync not working

1. Verify online status in console
2. Check API endpoint URLs are correct
3. Look for errors in `syncBookings()` or `pushBookingsToAPI()` logs

### Offline edits not syncing

1. Check bookings have `dataSource: "local"`
2. Verify `getUnsyncedBookings()` returns the edits
3. Check network tab for PUT request to API

## Files Modified

1. `/plugins/indexeddb.js` - Added bookings table and CRUD operations
2. `/plugins/system-init.js` - Added sync methods for bookings
3. `/pages/index.vue` - Integrated bookings display and editing

## Next Steps / Enhancements

Consider adding:

- Bulk sync UI with progress indicator
- Manual sync button for bookings
- Conflict resolution UI when server has newer data
- Last sync timestamp display
- Retry logic for failed syncs
- Offline indicator on booking cards
