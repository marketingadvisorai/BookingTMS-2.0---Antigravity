# Widget Booking Errors - FIXED

## Errors Found

### Error 1: `invalid input syntax for type uuid: ""`
**Cause:** venueId or gameId was empty string
**Fix:** Added validation to check if config.venueId exists before creating booking

### Error 2: `invalid input syntax for type time: "NaN:NaN"`
**Cause:** selectedTime was undefined or invalid, causing NaN when parsing
**Fix:** Added validation to check if time is selected and valid before creating booking

## Changes Made

### Added Validation in CalendarWidget.handleCompleteBooking:

1. ✅ Check if `config.venueId` exists
2. ✅ Check if `selectedGameData.id` exists  
3. ✅ Check if `selectedTime` is selected
4. ✅ Check if time parsing produces valid numbers (not NaN)
5. ✅ Check if customer name and email are filled
6. ✅ Added console.log to debug what data is being sent

### Now Shows Clear Error Messages:
- "Venue configuration is missing" - if no venueId
- "Please select a game" - if no game selected
- "Please select a time" - if no time selected
- "Invalid time selected" - if time parsing fails
- "Please fill in customer details" - if name/email missing

## Test Again

1. Open widget embed URL
2. Try to create a booking
3. Check browser console for the log: "Creating booking with: {...}"
4. If venueId is still missing, the widget config isn't loading properly
5. If all data is present, booking should be created successfully

## If Still Getting Errors

Check console log output - it will show exactly what data is being sent:
```javascript
{
  venue_id: "uuid-here" or undefined,
  game_id: "uuid-here" or undefined,
  booking_date: "2025-11-15",
  start_time: "14:00",
  end_time: "15:00"
}
```

If venue_id or game_id is undefined, the widget isn't receiving proper config from the Embed page.
