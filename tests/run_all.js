/**
 * POINT D'ENTRÉE DES TESTS OUTBOUND SNIPER (npm test)
 * Outbound Sniper / Tests
 */
require('./helpers');
const fs = require('node:fs');
const { DATA_DIR } = require('./helpers');

(async () => {
  const failed = (await require('./engine.test')()) + (await require('./server.test')());
  fs.rmSync(DATA_DIR, { recursive: true, force: true });
  console.log(failed === 0 ? '🎉 TOUS LES TESTS OUTBOUND SNIPER ONT RÉUSSI' : `❌ ${failed} test(s) en échec`);
  process.exit(failed === 0 ? 0 : 1);
})();
