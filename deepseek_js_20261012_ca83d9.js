// language: JavaScript, file: server.js, runtime: Node 18+
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors()); // libera o HTML local a chamar esse backend

// Proxy genérico: /grab?u=https://alvo.com/arquivo.php
app.get('/grab', async (req, res) => {
  const alvo = req.query.u;
  if (!alvo) return res.status(400).json({ erro: 'faltou ?u=' });

  try {
    const r = await fetch(alvo, {
      redirect: 'follow',
      headers: {
        // finge ser browser — muitos servidores bloqueiam user-agent vazio
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    const texto = await r.text();
    // devolve status + corpo num JSON pra o front separar
    res.json({
      status: r.status,
      headers: Object.fromEntries(r.headers.entries()),
      texto,
    });
  } catch (e) {
    res.status(502).json({ erro: e.message });
  }
});

const PORT = 8787;
app.listen(PORT, () => console.log(`[+] backend vivo em http://localhost:${PORT}`));