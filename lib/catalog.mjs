export const sourceHosts = new Set(['www.brother-usa.com', 'brothermobilesolutions.com', 'download.brother.com']);
export const normalize = value => String(value).toLowerCase().replace(/[^a-z0-9.]+/g, '');
export function matches(record, { query = '', width = '', background = '' } = {}) {
  const haystack = normalize([record.sku, record.widthMm + 'mm', record.ink, 'on', record.background, record.family, record.finish, record.adhesive].join(' '));
  return query.trim().split(/\s+/).filter(Boolean).every(word => haystack.includes(normalize(word))) &&
    (!width || record.widthMm === Number(width)) && (!background || record.background === background);
}
export function validateUrl(value, hosts = sourceHosts) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !hosts.has(url.hostname)) throw new Error('Unapproved HTTPS source URL: ' + value);
}
export function validateCatalog(data) {
  if (data.version !== 1 || data.model !== 'PT-D210' || data.market !== 'US') throw new Error('Unexpected catalog scope');
  if (JSON.stringify(data.supportedWidths) !== '[3.5,6,9,12]') throw new Error('Unsupported model widths');
  validateUrl(data.modelSource); validateUrl(data.manualSource);
  if (!Array.isArray(data.records) || !data.records.length) throw new Error('Empty catalog');
  const ids = new Set(), variants = new Set();
  for (const r of data.records) {
    if (!/^tze-\d{3}$/.test(r.id) || r.sku.toLowerCase() !== r.id || ids.has(r.id)) throw new Error('Invalid or duplicate SKU');
    ids.add(r.id);
    const variant = [r.widthMm, r.ink, r.background, r.adhesive, r.finish].join('|');
    if (variants.has(variant)) throw new Error('Duplicate variant');
    variants.add(variant);
    if (r.family !== 'TZe' || ![6,9,12].includes(r.widthMm) || r.lengthM !== 8 || r.adhesive !== 'Standard' || r.finish !== 'Laminated') throw new Error('Unsupported tape specification');
    if (!['Black','White'].includes(r.ink) || !['White','Clear','Black'].includes(r.background)) throw new Error('Invalid color');
    if (r.status !== 'verified' || typeof r.evidence !== 'string' || r.evidence.length < 40) throw new Error('Unverified record');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.reviewedAt) || new Date(r.reviewedAt).toISOString().slice(0,10) !== r.reviewedAt || Date.parse(r.reviewedAt) > Date.now()) throw new Error('Invalid review date');
    validateUrl(r.sourceUrl);
    if (new URL(r.sourceUrl).pathname !== '/products/media/tapes/' + r.id.replace('-', '') + '/') throw new Error('Product source mismatch');
  }
  for (const r of data.excluded) { validateUrl(r.sourceUrl); if(ids.has(r.id)) throw new Error('Excluded record published'); }
  return true;
}
export function validateConfig(config) {
  if (typeof config.publicationApproved !== 'boolean' || typeof config.hostingApproved !== 'boolean') throw new Error('Missing approval gate');
  if (config.siteUrl) {
    const u = new URL(config.siteUrl);
    if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || u.pathname !== '/') throw new Error('Site URL must be an HTTPS origin');
  }
  if (config.analytics.enabled || config.aiPublishing.enabled) throw new Error('Hosted analytics/model execution is not approved or implemented in V1');
  if (config.searchConsoleVerification && !/^[A-Za-z0-9_-]+$/.test(config.searchConsoleVerification)) throw new Error('Invalid verification token');
  const a = config.affiliate;
  if (a.enabled && (!a.agreementApproved || !a.publisherId || !Object.keys(a.links).length || !a.approvedHosts.length)) throw new Error('Affiliate acceptance, identifier and approved links required');
  if (a.enabled) for (const link of Object.values(a.links)) validateUrl(link, new Set(a.approvedHosts));
  return true;
}
export function affiliateLink(record, config) {
  validateConfig(config);
  return config.affiliate.enabled ? config.affiliate.links[record.id] || null : null;
}
export function requireRelease(config) {
  validateConfig(config);
  if (!config.publicationApproved || !config.hostingApproved || !config.siteUrl) throw new Error('Release blocked: explicit publication and hosting approval plus live origin required');
  if (!config.publicContactApproved || !config.hostingProvider || !config.hostingPrivacyUrl) throw new Error('Release blocked: approved public contact and hosting privacy information required');
  const privacy = new URL(config.hostingPrivacyUrl);
  if (privacy.protocol !== 'https:' || privacy.username || privacy.password) throw new Error('Hosting privacy URL must be HTTPS');
}
