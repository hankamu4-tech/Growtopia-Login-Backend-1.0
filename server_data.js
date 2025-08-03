const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.text());

app.post('/server_data.php', (req, res) => {
  const raw = req.body;

  const metaLine = raw.split('\n').find(line => line.startsWith('meta|'));
  if (!metaLine) return res.status(400).send('Missing meta');

  const meta = metaLine.replace('meta|', '').split('&');
  const metaData = {};
  meta.forEach(item => {
    const [key, value] = item.split('=');
    metaData[key] = value;
  });

  const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress.replace('::ffff:', '');
  const { Name, Key } = metaData;

  const keys = JSON.parse(fs.readFileSync('Key.json', 'utf8'));

  if (keys[Key] === 'valid') {
    const whitelist = JSON.parse(fs.readFileSync('wl.json', 'utf8'));
    whitelist[clientIP] = Name;
    fs.writeFileSync('wl.json', JSON.stringify(whitelist, null, 2));

    console.log(`Access granted for ${clientIP} as ${Name}`);
    res.send('server|your.backend.ip\nport|17091\n...');
  } else {
    console.log(`Access denied for ${clientIP} (invalid key)`);
    res.status(403).send('Invalid key');
  }
});

module.exports = app;
￼Enter
