
import { ActivityService } from '../src/modules/inventory/services/activity.service.ts';
import { SessionService } from '../src/services/session.service.ts';
import { useVenues } from '../src/hooks/venue/useVenues.ts'; // This is a hook, so we can't run it in node easily, but we can check if it imports.

console.log('Verifying imports...');

try {
    console.log('ActivityService imported:', !!ActivityService);
    console.log('SessionService imported:', !!SessionService);
    console.log('useVenues imported:', !!useVenues);

    if (ActivityService && SessionService) {
        console.log('SUCCESS: Services imported successfully.');
    } else {
        console.error('FAILURE: Some services failed to import.');
        process.exit(1);
    }
} catch (error) {
    console.error('Error verifying imports:', error);
    process.exit(1);
}
