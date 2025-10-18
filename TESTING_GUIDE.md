# Testing Guide for System Restructuring

## Pre-Testing Setup

### 1. Clear Browser Data (Optional)

To test fresh initialization:

```javascript
// Open browser console and run:
indexedDB.deleteDatabase("RipedV2DB");
localStorage.clear();
```

### 2. Login

- Navigate to `/login`
- Login with valid credentials
- Note your username (will be used for visitor sync)

---

## Test Scenarios

### Test 1: System Initialization

**Steps:**

1. Open the application (fresh load)
2. Watch console for initialization messages
3. Open browser DevTools → Application → IndexedDB → RipedV2DB

**Expected Results:**

- ✅ Console shows: "🚀 Starting system initialization..."
- ✅ Console shows: "✅ IndexedDB is working properly"
- ✅ Console shows: "✅ Location data initialization completed"
- ✅ Console shows: "✅ System initialization completed"
- ✅ IndexedDB shows new tables:
  - `provinces` (with data)
  - `amphoe` (with data)
  - `tambon` (with data)
  - `activities` (with data if online)
  - `visitors` (empty initially)

**To Check:**

```javascript
// In browser console:
const db = await indexedDB.open("RipedV2DB", 4);
// Should show version 4
```

---

### Test 2: Location Data Validation

**Steps:**

1. In DevTools → IndexedDB → RipedV2DB
2. Check `provinces` store
3. Check `amphoe` store
4. Check `tambon` store

**Expected Results:**

- ✅ Provinces store has records with `prov_code` and `prov_name`
- ✅ Amphoe store has records with `amp_code`, `amp_name`, and `prov_code`
- ✅ Tambon store has records with `tam_code`, `tam_name`, and `amp_code`

**Sample Check:**

```javascript
// In browser console:
const provinces = await $nuxt.$indexedDB.getProvinces();
console.log("Provinces count:", provinces.length);
console.log("First province:", provinces[0]);
```

---

### Test 3: Activities Data

**Steps:**

1. Wait for initialization to complete
2. Check console for activities messages
3. Check `activities` store in IndexedDB

**Expected Results:**

- ✅ Console shows: "✅ Updated X activities"
- ✅ Activities store contains records
- ✅ Each activity has: `no`, `month_age`, `time`, `title`, `objective`

**Sample Check:**

```javascript
// In browser console:
const activities = await $nuxt.$indexedDB.getActivities();
console.log("Activities count:", activities.length);
console.log("Sample activity:", activities[0]);
```

---

### Test 4: Activities Auto-Update

**Steps:**

1. Keep browser open for 1+ hour
2. Watch console at the 1-hour mark

**Expected Results:**

- ✅ Console shows: "⏰ Auto-updating activities..." (after 1 hour)
- ✅ Activities are refreshed
- ✅ Timestamp in `settings` store updated

**To Manually Trigger (for testing):**

```javascript
// In browser console (don't wait 1 hour):
await $nuxt.$systemInit.updateActivitiesFromAPI();
```

---

### Test 5: Visitors Sync (Online)

**Steps:**

1. Ensure you're online
2. Check console for sync messages
3. Check `visitors` store in IndexedDB

**Expected Results:**

- ✅ Console shows: "🔄 Syncing visitors for {username}..."
- ✅ Console shows: "✅ Visitors sync completed: X new, Y updated"
- ✅ Visitors store contains data
- ✅ Each visitor has `dataSource: 'api'` and `lastSyncedAt`

**Sample Check:**

```javascript
// In browser console:
const visitors = await $nuxt.$indexedDB.getVisitors();
console.log("Visitors count:", visitors.length);
console.log("First visitor:", visitors[0]);
console.log(
  "Data sources:",
  visitors.map((v) => v.dataSource)
);
```

---

### Test 6: Manual Sync Button

**Steps:**

1. Find sync button in header (between online status and user menu)
2. Click the sync button
3. Watch for loading state and toast message

**Expected Results:**

- ✅ Button shows spinning icon while syncing
- ✅ Button text changes to "กำลังซิงค์..."
- ✅ Toast shows success message: "ซิงค์ข้อมูลสำเร็จ"
- ✅ Console shows sync activity

**Offline Test:**

- Turn off network
- Button should be disabled
- Tooltip shows "ไม่สามารถซิงค์ได้ขณะออฟไลน์"

---

### Test 7: Edit Patient - Location Dropdowns

**Steps:**

1. Click on any patient to open edit modal
2. Check that location dropdowns are present
3. Try selecting a province

**Expected Results:**

- ✅ Modal shows 3 new dropdowns:
  - จังหวัด (Province)
  - อำเภอ (Amphoe) - disabled initially
  - ตำบล (Tambon) - disabled initially
- ✅ Province dropdown is populated with options
- ✅ Selecting a province enables amphoe dropdown
- ✅ Amphoe dropdown shows only amphoes for selected province

---

### Test 8: Cascading Location Selection

**Steps:**

1. Open edit patient modal
2. Select a province (e.g., กรุงเทพมหานคร)
3. Select an amphoe
4. Select a tambon
5. Change province

**Expected Results:**

- ✅ Selecting province filters amphoe dropdown
- ✅ Selecting amphoe filters tambon dropdown
- ✅ Changing province resets amphoe and tambon selections
- ✅ Changing amphoe resets tambon selection

**Console Check:**

```javascript
// Check filtering works:
const amphoes = await $nuxt.$indexedDB.getAmphoesByProvince("10"); // Bangkok
console.log("Bangkok amphoes:", amphoes.length);
```

---

### Test 9: Save Patient Edit (Online)

**Steps:**

1. Ensure you're online
2. Open edit modal for a patient with `stid`
3. Edit phone, address, and select locations
4. Click save
5. Check console and toast

**Expected Results:**

- ✅ Toast shows: "บันทึกและซิงค์ข้อมูลสำเร็จ"
- ✅ Console shows API call to PUT endpoint
- ✅ Modal closes
- ✅ In IndexedDB, visitor record updated with:
  - New values for edited fields
  - `dataSource: 'api'`
  - Updated `lastSyncedAt`

**API Payload Check (in Network tab):**

```json
{
  "variable": [
    [
      "tel",
      "address",
      "prov_code",
      "amp_code",
      "tam_code",
      "latitude",
      "longitude"
    ]
  ],
  "value": [["new_phone", "new_address", "10", "1001", "100101", "", ""]],
  "pk": [["stid"]],
  "pkval": [["some_stid"]],
  "tb": "homevisitor_sample_students"
}
```

---

### Test 10: Save Patient Edit (Offline)

**Steps:**

1. Turn off network (DevTools → Network → Offline)
2. Open edit modal
3. Edit data
4. Click save

**Expected Results:**

- ✅ Data saves locally
- ✅ Toast shows: "บันทึกข้อมูลสำเร็จ (จะซิงค์เมื่อออนไลน์)"
- ✅ In IndexedDB, visitor record has:
  - New values
  - `dataSource: 'local'`
- ✅ No API call made

**Check Unsynced:**

```javascript
// In browser console:
const unsynced = await $nuxt.$indexedDB.getUnsyncedVisitors();
console.log("Unsynced visitors:", unsynced.length);
```

---

### Test 11: Smart Merge Strategy

**Setup:**

1. Edit a visitor offline (creates local edit)
2. Go back online
3. Click manual sync button

**Expected Results:**

- ✅ Local editable fields preserved:
  - tel
  - address
  - prov_code, amp_code, tam_code
  - latitude, longitude
- ✅ Read-only fields updated from API:
  - prefix, fname, surname, nickname
  - birth dates, gender, etc.
- ✅ Record keeps `dataSource: 'local'` (because it has local edits)
- ✅ `lastSyncedAt` updated

**Console Check:**

```javascript
// Before sync:
const visitor = await $nuxt.$indexedDB.getVisitor("some_stid");
console.log("Before sync:", visitor);

// After sync (check if local edits preserved):
const updated = await $nuxt.$indexedDB.getVisitor("some_stid");
console.log("After sync:", updated);
console.log("Data source:", updated.dataSource); // Should be 'local' if edited
```

---

### Test 12: Loading States

**Steps:**

1. Open page (fresh load)
2. Watch for loading component
3. Click sync button
4. Watch for loading state

**Expected Results:**

- ✅ Loading component appears during initialization
- ✅ Loading message: "กำลังเริ่มต้นระบบ..."
- ✅ Loading message: "กำลังซิงค์ข้อมูล..." during sync
- ✅ Loading component disappears when complete

---

### Test 13: Error Handling

**Test API Failure:**

1. Open DevTools → Network
2. Set network throttling to "Offline"
3. Reload page

**Expected Results:**

- ✅ Location data loads from cache (if previously loaded)
- ✅ Activities load from cache
- ✅ No crashes or white screen
- ✅ Graceful degradation

**Test Invalid Data:**

1. Try saving with invalid phone format
2. Try saving with very long address

**Expected Results:**

- ✅ Validation errors shown
- ✅ Form doesn't submit
- ✅ Error messages clear when corrected

---

### Test 14: Responsive Design

**Steps:**

1. Resize browser to mobile width
2. Check sync button
3. Check edit modal

**Expected Results:**

- ✅ Sync button text hides on mobile (icon only)
- ✅ Modal is scrollable
- ✅ Dropdowns work on mobile
- ✅ Layout doesn't break

---

### Test 15: Console Output Validation

**During Full App Flow:**

Expected console messages:

```
🚀 Starting system initialization...
✅ IndexedDB is working properly
📍 Initializing location data...
✅ Location data already exists (or fetched)
📋 Initializing activities data...
🔄 Fetching activities from API...
✅ Updated X activities
✅ Activities auto-update enabled (1 hour interval)
✅ System initialization completed
🔄 Syncing visitors for [username]...
📥 Received X visitors from API
✅ Visitors sync completed: X new, Y updated
```

**No Errors Expected:**

- ❌ No IndexedDB errors
- ❌ No API timeout errors (unless actually offline)
- ❌ No undefined errors
- ❌ No Vue warnings

---

## Performance Checks

### Database Size

```javascript
// Check database size:
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate();
  console.log("Storage used:", (estimate.usage / 1024 / 1024).toFixed(2), "MB");
  console.log(
    "Storage quota:",
    (estimate.quota / 1024 / 1024).toFixed(2),
    "MB"
  );
}
```

### Data Counts

```javascript
// Check all data counts:
const counts = {
  provinces: (await $nuxt.$indexedDB.getProvinces()).length,
  amphoes: (await $nuxt.$indexedDB.getAmphoes()).length,
  tambons: (await $nuxt.$indexedDB.getTambons()).length,
  activities: (await $nuxt.$indexedDB.getActivities()).length,
  visitors: (await $nuxt.$indexedDB.getVisitors()).length,
};
console.table(counts);
```

---

## Common Issues & Solutions

### Issue: Location data not loading

**Solution:**

```javascript
// Manually trigger location fetch:
await $nuxt.$systemInit.initializeLocationData();
```

### Issue: Activities not updating

**Solution:**

```javascript
// Manually update activities:
await $nuxt.$systemInit.updateActivitiesFromAPI();
```

### Issue: Visitors not syncing

**Check:**

1. Is user logged in? Check `$nuxt.$auth.user`
2. Is online? Check `$nuxt.$store.state.isOnline`
3. Username valid? Check `$nuxt.$auth.user.username`

**Manual sync:**

```javascript
await $nuxt.$systemInit.syncVisitors($nuxt.$auth.user.username);
```

### Issue: IndexedDB version mismatch

**Solution:**

```javascript
// Delete database and reload:
indexedDB.deleteDatabase("RipedV2DB");
location.reload();
```

---

## Automated Testing Script

Run in browser console for comprehensive check:

```javascript
async function testSystem() {
  console.log("🧪 Starting system tests...\n");

  // Test 1: IndexedDB
  console.log("Test 1: IndexedDB");
  try {
    await $nuxt.$indexedDB.setSetting("test", { value: "test" });
    const result = await $nuxt.$indexedDB.getSetting("test");
    console.log(result.value === "test" ? "✅ Pass" : "❌ Fail");
  } catch (e) {
    console.log("❌ Fail:", e.message);
  }

  // Test 2: Location Data
  console.log("\nTest 2: Location Data");
  const provinces = await $nuxt.$indexedDB.getProvinces();
  const amphoes = await $nuxt.$indexedDB.getAmphoes();
  const tambons = await $nuxt.$indexedDB.getTambons();
  console.log(
    `Provinces: ${provinces.length} ${provinces.length > 0 ? "✅" : "❌"}`
  );
  console.log(`Amphoes: ${amphoes.length} ${amphoes.length > 0 ? "✅" : "❌"}`);
  console.log(`Tambons: ${tambons.length} ${tambons.length > 0 ? "✅" : "❌"}`);

  // Test 3: Activities
  console.log("\nTest 3: Activities");
  const activities = await $nuxt.$indexedDB.getActivities();
  console.log(
    `Activities: ${activities.length} ${activities.length > 0 ? "✅" : "❌"}`
  );

  // Test 4: Visitors
  console.log("\nTest 4: Visitors");
  const visitors = await $nuxt.$indexedDB.getVisitors();
  console.log(`Visitors: ${visitors.length}`);
  const synced = visitors.filter((v) => v.dataSource === "api").length;
  const unsynced = visitors.filter((v) => v.dataSource === "local").length;
  console.log(`  Synced: ${synced} ✅`);
  console.log(`  Unsynced: ${unsynced} ${unsynced > 0 ? "⚠️" : "✅"}`);

  // Test 5: Store State
  console.log("\nTest 5: Store State");
  console.log(
    `System initialized: ${$nuxt.$store.state.systemInitialized ? "✅" : "❌"}`
  );
  console.log(
    `Online: ${$nuxt.$store.state.isOnline ? "✅ (online)" : "⚠️ (offline)"}`
  );
  console.log(`Syncing: ${$nuxt.$store.getters.isSyncing ? "⚠️" : "✅"}`);

  console.log("\n✅ Tests complete!");
}

testSystem();
```

---

## Debugging Tools

### Enable Verbose Logging

Add to browser console:

```javascript
localStorage.setItem("debug", "riped:*");
```

### Watch Sync Status

```javascript
setInterval(() => {
  console.log("Sync Status:", $nuxt.$store.getters.syncStatus);
}, 5000);
```

### Monitor IndexedDB Changes

```javascript
// Watch a specific visitor:
const stid = "some_stid";
setInterval(async () => {
  const visitor = await $nuxt.$indexedDB.getVisitor(stid);
  console.log("Visitor status:", {
    dataSource: visitor?.dataSource,
    lastSync: visitor?.lastSyncedAt,
  });
}, 2000);
```

---

## Sign-off Checklist

Before considering implementation complete:

- [ ] All initialization messages appear in console
- [ ] All IndexedDB stores created and populated
- [ ] Location dropdowns work with cascading selection
- [ ] Save works in online mode with API call
- [ ] Save works in offline mode (local only)
- [ ] Sync button works and shows correct states
- [ ] Activities auto-update interval is running
- [ ] Smart merge preserves local edits
- [ ] No console errors during normal operation
- [ ] Loading states appear and disappear correctly
- [ ] Toast messages are appropriate and clear
- [ ] Responsive design works on mobile
- [ ] Offline mode degrades gracefully
- [ ] API errors are caught and handled
- [ ] Documentation is complete and accurate

---

## Support

If you encounter issues:

1. Check browser console for error messages
2. Check Network tab for failed API calls
3. Check IndexedDB in Application tab
4. Verify online/offline status
5. Try clearing data and reloading
6. Check authentication status

For additional help, refer to:

- `SYSTEM_RESTRUCTURE_IMPLEMENTATION.md` - Implementation details
- `INDEXEDDB_DOCUMENTATION.md` - IndexedDB usage
- Browser DevTools → Console for live debugging
