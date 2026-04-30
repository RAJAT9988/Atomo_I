# TODO: Add light.cabin_centre_1 to Sir's Office Room

## Tasks
- [ ] Update server.js: Change room 1 haEntities.lights to { main: ['light.tz3210_ksuiwy91_ts0505b_light', 'light.cabin_centre_1'] }
- [ ] Update server.js: Remove 'cabin_centre_1' from room 2 haEntities.lights
- [ ] Update three.html: Add new 3D light Light_MainOffice_2 at position (3.0, CEILING - 0.2, -4.0)
- [ ] Update three.html: Add Light_MainOffice_2 to Group_Annex_NE_MainOffice
- [ ] Update three.html: Update initializeLights to set intensity for both Light_MainOffice_1 and Light_MainOffice_2
- [ ] Update three.html: Update syncRoomState to control both lights for room.id === 1
- [ ] Update three.html: Ensure toggleOffice toggles both lights
- [ ] Test the office light toggle to ensure both 3D lights turn on/off and sync with Home Assistant
