/**
 * Run the notification grouping test
 */

// Set up environment variables if needed
process.env.VAPID_PUBLIC_KEY = 'test_public_key';
process.env.VAPID_PRIVATE_KEY = 'test_private_key';

// Run the test
require('./tests/notification-grouping-test');
