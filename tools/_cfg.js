// Lee js/config/config.js (sin navegador) y devuelve FP.config.cloud: lo usa test-sync-conflicts.js para comprobar la configuración real.
const fs = require('fs'), vm = require('vm'); const c = { console }; c.globalThis = c; vm.createContext(c);
vm.runInContext(fs.readFileSync(require('path').resolve(__dirname, '../js/config/config.js'), 'utf8'), c); module.exports = c.FP.config.cloud;
