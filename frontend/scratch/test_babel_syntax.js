const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\kumar\\OneDrive\\Documents\\Desktop\\autism proj\\NIVARA\\frontend';

const files = [
  'src/constants/colors.js',
  'src/constants/spacing.js',
  'src/constants/typography.js',
  'src/constants/safetyConstants.js',
  'src/theme/lightTheme.js',
  'src/theme/darkTheme.js',
  'src/theme/index.js',
  'src/components/common/AppButton.jsx',
  'src/components/common/AppCard.jsx',
  'src/components/common/AppHeader.jsx',
  'src/components/common/AppInput.jsx',
  'src/components/common/Badge.jsx',
  'src/components/common/Loading.jsx',
  'src/components/common/EmptyState.jsx',
  'src/components/common/ErrorState.jsx',
  'src/components/common/ConfirmModal.jsx',
  'src/components/common/SafeAreaWrapper.jsx',
  'src/components/common/Avatar.jsx',
  'src/components/common/Divider.jsx',
  'src/services/api/safetyApi.js',
  'src/services/location/locationService.js',
  'src/services/location/backgroundLocation.js',
  'src/services/location/geofenceService.js',
  'src/services/bluetooth/bluetoothService.js',
  'src/services/bluetooth/bandService.js',
  'src/services/bluetooth/separationService.js',
  'src/store/safetyStore.js',
  'src/hooks/useSafety.js',
  'src/hooks/useLocation.js',
  'src/hooks/useBluetooth.js',
  'src/components/safety/EmergencyButton.jsx',
  'src/components/safety/EmergencyAlert.jsx',
  'src/components/safety/EmergencyContactCard.jsx',
  'src/components/safety/BandConnectionStatus.jsx',
  'src/components/safety/BandStatusCard.jsx',
  'src/components/safety/SeparationAlert.jsx',
  'src/components/safety/SafetyEventCard.jsx',
  'src/components/safety/SafeZoneCard.jsx',
  'src/components/safety/SafeZoneMarker.jsx',
  'src/components/safety/SafetyStatusCard.jsx',
  'src/components/safety/LocationCard.jsx',
  'src/components/safety/LocationMap.jsx',
  'src/components/caregiver/ChildStatusCard.jsx',
  'src/components/caregiver/ChildLocationCard.jsx',
  'src/components/caregiver/DeviceStatusCard.jsx',
  'src/components/caregiver/SafetyOverview.jsx',
  'src/components/caregiver/RecentSafetyActivity.jsx',
  'src/components/caregiver/CaregiverAlertCard.jsx',
  'src/screens/safety/SafetyHomeScreen.jsx',
  'src/screens/safety/EmergencyScreen.jsx',
  'src/screens/safety/LiveLocationScreen.jsx',
  'src/screens/safety/SafeZonesScreen.jsx',
  'src/screens/safety/AddSafeZoneScreen.jsx',
  'src/screens/safety/GPSBandScreen.jsx',
  'src/screens/safety/EmergencyContactsScreen.jsx',
  'src/screens/safety/SafetyEventDetailsScreen.jsx',
  'src/screens/caregiver/CaregiverDashboard.jsx',
  'src/screens/caregiver/ChildProfileScreen.jsx',
  'src/screens/caregiver/ChildStatusScreen.jsx',
  'src/screens/caregiver/DeviceStatusScreen.jsx',
  'src/screens/caregiver/SafetyOverviewScreen.jsx',
  'src/navigation/SafetyNavigator.jsx',
  'src/navigation/CaregiverNavigator.jsx',
  'src/navigation/routes.js'
];

let errors = 0;
for (const f of files) {
  const filePath = path.join(baseDir, f);
  const code = fs.readFileSync(filePath, 'utf8');
  try {
    babel.transformSync(code, {
      filename: filePath,
      presets: ['babel-preset-expo'],
    });
    console.log(`[SYNTAX OK] ${f}`);
  } catch (err) {
    console.error(`[SYNTAX ERROR] ${f}:`, err.message);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\nFAILED with ${errors} syntax errors.`);
  process.exit(1);
} else {
  console.log('\n>>> 100% OF PART 2 FILES PASSED BABEL COMPILATION WITH ZERO ERRORS! <<<');
}
