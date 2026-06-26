// Vercel Function — serves /.well-known/mcp/server-card.json
// Rewritten via vercel.json: /.well-known/mcp/server-card.json → /api/wk-mcp

module.exports = function(req, res) {
  var card = {
    "serverInfo": {
      "name": "Lucas y Leo Digital",
      "version": "1.0.0",
      "description": "Agencia de marketing digital con IA en Barcelona. Publicidad digital, automatizacion, desarrollo web y asesoria para pequenos negocios en Espana."
    },
    "transport": {
      "type": "http",
      "endpoint": "https://www.lucasyleodigital.com/.well-known/mcp"
    },
    "capabilities": {
      "resources": true,
      "tools": false,
      "prompts": false
    },
    "resources": [
      {
        "uri": "https://www.lucasyleodigital.com/llms.txt",
        "name": "Agency Overview (llms.txt)",
        "mimeType": "text/plain",
        "description": "Concise overview of Lucas y Leo Digital: services, founders, contact."
      },
      {
        "uri": "https://www.lucasyleodigital.com/llms-full.txt",
        "name": "Full Agency Content (llms-full.txt)",
        "mimeType": "text/plain",
        "description": "Extended content: full service descriptions, FAQ, pricing philosophy."
      },
      {
        "uri": "https://www.lucasyleodigital.com/agencia/",
        "name": "Servicios — Lucas y Leo Digital",
        "mimeType": "text/html",
        "description": "Detailed agency services: Google Ads, Meta Ads, AI automation, web development."
      },
      {
        "uri": "https://www.lucasyleodigital.com/",
        "name": "Lucas — Asesor Digital para Pequenos Negocios",
        "mimeType": "text/html",
        "description": "Personal page of Lucas, digital advisor for SMEs in Barcelona."
      }
    ],
    "contact": {
      "email": "info@lucasyleodigital.com",
      "phone": "+34624029617",
      "url": "https://www.lucasyleodigital.com"
    }
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).json(card);
};
