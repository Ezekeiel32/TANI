import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { googleSyncQueue } from '@/lib/queue';
import { refreshAvailabilityCacheForTrainer } from '@/lib/availability';

export async function POST(req: NextRequest) {
  const channelId = req.headers.get('x-goog-channel-id');
  const resourceId = req.headers.get('x-goog-resource-id');
  const state = req.headers.get('x-goog-resource-state');
  
  if (!channelId || !resourceId) return new Response('missing headers', { status: 400 });

  const sync = await prisma.calendarSync.findFirst({ where: { channelId, resourceId } });
  if (!sync) return new Response('ok');

  // Trigger sync job
  if (state === 'exists' || state === 'update') {
    await googleSyncQueue.add('sync-calendar', { trainerId: sync.trainerId, action: 'sync' });
    // Also refresh availability cache opportunistically
    await refreshAvailabilityCacheForTrainer(sync.trainerId);
  }
  
  return new Response('ok');
}



