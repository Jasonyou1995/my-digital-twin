import data from '../../public/data/publications.json' with { type: 'json' };
import { PROFILE } from './profile.js';

// Small, auditable retrieval corpus. No visitor URLs are fetched, no private data is indexed.
// Bibliographic metadata is evidence of title/status only, not evidence of full paper results.
const documents = [
  { id: 'profile', title: 'Public professional profile', url: '/#work', text: PROFILE, always: true },
  ...data.publications.filter(p => p.show !== false).map(p => ({
    id: `paper-${p.id}`, title: p.title,
    url: p.doi ? `https://doi.org/${p.doi}` : p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : '/#research',
    text: `${p.title}\nAuthors: ${p.authors}\nStatus: ${data.statusLabels[p.status] || p.status}. Venue: ${p.venue}, ${p.year}.${p.note ? ` ${p.note}` : ''}\nEvidence boundary: bibliographic metadata only. Do not infer methods, numerical results, implementation details, or conclusions from the title.`,
  })),
  ...data.talks.map((t, i) => ({ id: `talk-${i}`, title: t.event, url: t.url || '/#talks', text: `${t.event} (${t.year}): ${t.title}${t.location ? `, ${t.location}` : ''}. Talk metadata only; no transcript is available.` })),
];

const TOPIC_ALIASES = [
  ['stablecoin reserve risk', /稳定币|穩定幣|ステーブル|moneda estable|monedas estables|moeda estável|moedas estáveis|monnaie stable|стейбл|عملات مستقرة|العملات المستقرة/iu],
  ['blockchain trust oracle', /区块链|區塊鏈|预言机|預言機|ブロックチェーン|cadena de bloques|chaîne de blocs|блокчейн|оракул|بلوك|أوراكل/iu],
  ['agent ai safety', /智能体|智能體|代理|エージェント|agente|агент|وكلاء|وكيل/iu],
  ['research paper', /研究|论文|論文|investigación|pesquisa|recherche|исслед|بحث|أبحاث/iu],
];
const terms = text => (text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []).filter(t => !['what','with','about','that','this','your','does','have','from','could','would','please','explain'].includes(t));

export function retrieveKnowledge(messages) {
  let query = messages.slice(-5).map(m => m.content).join(' ');
  for (const [alias, pattern] of TOPIC_ALIASES) if (pattern.test(query)) query += ` ${alias}`;
  const words = [...new Set(terms(query))];
  const ranked = documents.filter(d => !d.always).map(d => {
    const title = d.title.toLowerCase();
    const body = d.text.toLowerCase();
    return { ...d, score: words.reduce((sum, term) => sum + (title.includes(term) ? 4 : body.includes(term) ? 1 : 0), 0) };
  }).sort((a,b) => b.score - a.score);
  const selected = [documents[0], ...ranked.filter(d => d.score > 0).slice(0, 5)];
  // The complete small catalogue avoids English lexical retrieval hiding non-English paper queries.
  const catalogue = documents.filter(d => d.id.startsWith('paper-') || d.id.startsWith('talk-')).map(d => `[${d.id}] ${d.text}`).join('\n\n');
  return { sources: selected.map(({id,title,url}) => ({id,title,url})), context: selected.map(d => `[${d.id}] ${d.text}`).join('\n\n') + '\n\nPUBLIC CATALOGUE (metadata only):\n' + catalogue };
}

export function sourceForId(id) { const d=documents.find(d=>d.id===id); return d ? {id:d.id,title:d.title,url:d.url} : null; }
