// Vercel Serverless Function — Markdown content negotiation
// Serves the homepage as Markdown when Accept: text/markdown is requested
// Triggered by vercel.json rewrite with has[header:accept=text/markdown]

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'llms-full.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Vary', 'Accept');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(content);
  } catch (err) {
    // Fallback: return inline minimal markdown
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Vary', 'Accept');
    res.status(200).send([
      '# Lucas y Leo Digital',
      '',
      '> Agencia de marketing digital con IA en Barcelona. Publicidad digital, automatización, desarrollo web y asesoría para pymes en España.',
      '',
      '## Servicios',
      '- Publicidad digital (Google Ads, Meta Ads, LinkedIn Ads)',
      '- Automatización con IA',
      '- Desarrollo web estratégico',
      '- SEO local',
      '- Asesoría digital para pymes',
      '',
      '## Contacto',
      '- Web: https://www.lucasyleodigital.com',
      '- Teléfono: +34 624 029 617',
      '- Email: info@lucasyleodigital.com',
      '',
      '## Sesión estratégica gratuita',
      'Reserva en: https://www.lucasyleodigital.com/#sesion',
    ].join('\n'));
  }
};
