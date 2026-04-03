import { runFalsificationLoop } from '../lib/parser/__tests__/falsification';

async function main() {
  console.log('[LAB] Initializing System Test...');
  try {
    runFalsificationLoop();
    console.log('[LAB] System test complete. Thresholds met.');
  } catch (error) {
    console.error('[LAB] System test FAILED:', error);
    process.exit(1);
  }
}

main();
