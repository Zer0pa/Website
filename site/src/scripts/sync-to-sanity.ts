import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@sanity/client';
import { resolvePacketCacheDir } from '../lib/data/packet-cache';
import { LanePacket } from '../lib/types/lane';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-03-27',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function syncToSanity() {
  const PACKET_DIR = resolvePacketCacheDir();
  if (!fs.existsSync(PACKET_DIR)) {
    console.error('[SYNC] No packets found in .cache/packets');
    return;
  }

  const files = fs.readdirSync(PACKET_DIR).filter(f => f.endsWith('.json'));
  console.log(`[SYNC] Found ${files.length} packets to sync.`);

  for (const file of files) {
    const packet: LanePacket = JSON.parse(fs.readFileSync(path.join(PACKET_DIR, file), 'utf8'));
    console.log(`[SYNC] Syncing ${packet.laneIdentifier}...`);

    try {
      const laneId = `lane-${packet.laneIdentifier.toLowerCase()}`;
      const snapshotId = `laneSnapshot-${packet.laneIdentifier.toLowerCase()}`;
      const slug = packet.laneIdentifier.toLowerCase().replace('zpe-', '');

      // 1. Ensure the 'lane' editorial document exists
      const laneDoc = {
        _type: 'lane',
        _id: laneId,
        repoName: packet.laneIdentifier,
        repoUrl: packet.repoUrl,
        title: packet.laneTitle,
        slug: { _type: 'slug', current: slug },
        sourceMode: 'public_repo',
      };

      await client.createIfNotExists(laneDoc);

      // 2. Upsert the latest machine-owned snapshot for this lane
      const snapshotDoc = {
        _type: 'laneSnapshot',
        _id: snapshotId,
        lane: { _type: 'reference', _ref: laneId },
        ...packet,
      };

      await client.createOrReplace(snapshotDoc);
      console.log(`[SYNC] Upserted snapshot for ${packet.laneIdentifier}`);
    } catch (error) {
      console.error(`[SYNC] Error syncing ${packet.laneIdentifier}:`, error);
    }
  }

  // 3. Ensure site settings exist and track the latest sync time
  await client.createIfNotExists({
    _id: 'siteSettings',
    _type: 'siteSettings',
    featuredLaneIdentifier: 'ZPE-IMC',
    allowedRepos: [],
  });

  await client.patch('siteSettings').set({ lastSyncTimestamp: new Date().toISOString() }).commit();

  console.log('[SYNC] Complete.');
}

syncToSanity().catch(console.error);
