// Vercel Function — serves /.well-known/api-catalog
// RFC 9727 — API Catalog with application/linkset+json
// Rewritten via vercel.json: /.well-known/api-catalog → /api/wk-catalog

module.exports = function(req, res) {
  var catalog = {
    "linkset": [
      {
        "anchor": "https://www.lucasyleodigital.com/",
        "https://www.iana.org/assignments/relation/service-doc": [
          {
            "href": "https://www.lucasyleodigital.com/agencia/",
            "type": "text/html",
            "title": "Lucas y Leo Digital — Servicios de Marketing Digital"
          }
        ],
        "https://www.iana.org/assignments/relation/describedby": [
          {
            "href": "https://www.lucasyleodigital.com/llms.txt",
            "type": "text/plain",
            "title": "Machine-readable agency overview (llms.txt)"
          },
          {
            "href": "https://www.lucasyleodigital.com/llms-full.txt",
            "type": "text/plain",
            "title": "Full machine-readable agency content (llms-full.txt)"
          }
        ],
        "https://www.iana.org/assignments/relation/mcp-server-card": [
          {
            "href": "https://www.lucasyleodigital.com/.well-known/mcp/server-card.json",
            "type": "application/json",
            "title": "MCP Server Card"
          }
        ]
      }
    ]
  };

  res.setHeader('Content-Type', 'application/linkset+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(JSON.stringify(catalog));
};
