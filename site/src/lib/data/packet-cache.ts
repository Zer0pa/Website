import path from 'node:path';

const PACKET_CACHE_ENV = 'ZEROPA_LANE_PACKET_CACHE_DIR';

export function resolvePacketCacheDir() {
  const override = process.env[PACKET_CACHE_ENV]?.trim();
  return override ? path.resolve(override) : path.join(process.cwd(), '.cache/packets');
}

export function packetCacheEnvName() {
  return PACKET_CACHE_ENV;
}
