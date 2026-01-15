const { networkInterfaces } = require('os');
const { spawn } = require('child_process');
const path = require("path");

function getWifiIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  throw new Error('Adresse IP WiFi non trouvée. Vérifiez vos connexions réseau.');
}

try {
  const wifiIP = getWifiIP();
  console.log(`Adresse IP WiFi détectée : ${wifiIP}`);

  // Construction correcte du chemin vers next.cmd
  const nextPath = path.join(__dirname, "..", "node_modules", ".bin", "next.cmd");

  // Exécution avec shell:true pour Windows
  spawn(nextPath, ["dev", "--hostname", "0.0.0.0", "--webpack"], {
    stdio: "inherit",
    shell: true
  });
    shell: true
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
