// Normalize Input — Wax | Wane bulk listing generator
//
// Accepts either:
//   1) Webhook JSON body:  { "items": [ {...}, {...} ] }   or a single object
//   2) Manual run "Sample Input" node output (same shape)
//   3) Raw CSV text in field `csv` — header row required
//
// Emits one n8n item per product, with a normalized schema downstream nodes rely on.

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { cell += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (c === '\r') { /* ignore */ }
      else cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  if (!rows.length) return [];
  const header = rows.shift().map(h => h.trim());
  return rows
    .filter(r => r.some(v => v && v.trim().length))
    .map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

function asArray(v) {
  if (v == null) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(s => String(s).trim()).filter(Boolean);
  if (typeof v === 'string') {
    return v.split(/\r?\n|\||;/).map(s => s.trim()).filter(Boolean);
  }
  return [String(v)];
}

function normalize(raw, idx) {
  const sku = String(raw.sku || raw.SKU || raw.itemSku || raw.item_sku || `WW-${Date.now()}-${idx + 1}`).trim();
  const productName = String(raw.productName || raw.product_name || raw.name || raw.title || '').trim();
  const brand = String(raw.brand || raw.brand_name || 'Wax | Wane').trim();
  const brandLine = String(raw.brandLine || raw.brand_line || raw.line || '').trim();
  const category = String(raw.category || raw.product_type || raw.feed_product_type || '').trim();
  const sizeLabel = String(raw.size || raw.size_label || '').trim();
  const colorLabel = String(raw.color || '').trim();
  const price = Number(raw.price ?? raw.standard_price ?? raw.list_price ?? 0) || 0;
  const quantity = Number(raw.quantity ?? raw.qty ?? 0) || 0;
  const weightLb = Number(raw.weightLb ?? raw.shipping_weight ?? raw.weight ?? 0) || 0;
  const productId = String(raw.productId || raw.gtin || raw.upc || raw.ean || raw.external_product_id || '').trim();
  const productIdType = String(raw.productIdType || raw.external_product_id_type || (productId.length === 12 ? 'UPC' : productId.length === 13 ? 'EAN' : productId ? 'GTIN' : '')).trim();
  const manufacturer = String(raw.manufacturer || brand).trim();
  const partNumber = String(raw.partNumber || raw.part_number || sku).trim();
  const mainImageUrl = String(raw.mainImageUrl || raw.main_image_url || raw.image || '').trim();
  const features = asArray(raw.features || raw.bullets || raw.bullet_points);
  const ingredients = asArray(raw.ingredients);
  const targetAudience = asArray(raw.targetAudience || raw.target_audience_keywords);
  const keywords = asArray(raw.keywords || raw.generic_keywords);
  const specs = (raw.specs && typeof raw.specs === 'object') ? raw.specs : {};
  const shortSummary = String(raw.shortSummary || raw.summary || '').trim();
  const longDescription = String(raw.longDescription || raw.description || raw.product_description || '').trim();

  return {
    sku, productName, brand, brandLine, category,
    sizeLabel, colorLabel, price, quantity, weightLb,
    productId, productIdType, manufacturer, partNumber, mainImageUrl,
    features, ingredients, targetAudience, keywords, specs,
    shortSummary, longDescription,
  };
}

const out = [];
for (const item of items) {
  const body = item.json || {};
  let rawList = [];
  if (Array.isArray(body)) rawList = body;
  else if (Array.isArray(body.items)) rawList = body.items;
  else if (typeof body.csv === 'string' && body.csv.includes(',')) rawList = parseCsv(body.csv);
  else if (body.productName || body.product_name || body.sku) rawList = [body];
  else if (body.body && (Array.isArray(body.body.items) || body.body.productName)) {
    rawList = Array.isArray(body.body.items) ? body.body.items : [body.body];
  }

  if (!rawList.length) {
    throw new Error('No products found in input. Provide { items: [...] } or a CSV string in `csv`.');
  }
  rawList.forEach((raw, idx) => out.push({ json: normalize(raw, idx) }));
}

return out;
