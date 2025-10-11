#!/usr/bin/env node
import './charge';
import './reminder';
import './google-sync';
import { googleSyncQueue } from '@/lib/queue';

console.log('All workers started');

// Keep process alive
process.on('SIGINT', () => {
  console.log('Shutting down workers...');
  process.exit(0);
});

// Schedule a daily sweep to renew expiring Google watch channels
(async () => {
  try {
    await googleSyncQueue.add(
      'sweep-renewals',
      { action: 'sweep', trainerId: '' },
      { repeat: { every: 24 * 60 * 60 * 1000 } }
    );
    console.log('Scheduled daily Google watch renewal sweep');
  } catch (e) {
    console.error('Failed to schedule renewal sweep', e);
  }
})();
