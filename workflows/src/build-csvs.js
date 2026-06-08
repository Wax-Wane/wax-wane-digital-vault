// Build CSVs — assemble Amazon and Walmart bulk-listing CSVs from generated copy.
//
// Header sets target the common Amazon Beauty / Health & Personal Care flat-file
// schema and the Walmart Marketplace Setup-by-Match item-spec. Both are documented
// at vendor portals; replace headers if your category template differs.
//
// CSV escaping follows RFC 4180: wrap in quotes when value contains comma, quote,
// or newline; escape internal quotes by doubling.

const AMAZON_HEADERS = [
  'feed_product_type',
  'item_sku',
  'brand_name',
  'item_name',
  'external_product_id',
  'external_product_id_type',
  'manufacturer',
  'part_number',
  'product_description',
  'standard_price',
  'quantity',
  'main_image_url',
  'bullet_point1',
  'bullet_point2',
  'bullet_point3',
  'bullet_point4',
  'bullet_point5',
  'generic_keywords',
  'item_type',
  'target_audience_keywords',
];

const WALMART_HEADERS = [
  'SKU',
  'Product ID Type',
  'Product ID',
  'Product Name',
  'Brand',
  'Short Description',
  'Long Description',
  'Main Image URL',
  'Price',
  'Shipping Weight (lb)',
  'Site Description',
  'Key Features 1',
  'Key Features 2',
  'Key Features 3',
  'Key Features 4',
  'Key Features 5',
  'Manufacturer',
  'Color',
  'Size',
];

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowToCsv(row, headers) {
  return headers.map(h => csvEscape(row[h])).join(',');
}

function toCsv(rows, headers) {
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(rowToCsv(r, headers));
  return lines.join('\r\n') + '\r\n';
}

function toAmazonRow(p) {
  const c = p.copy || {};
  return {
    feed_product_type: p.category || 'beauty',
    item_sku: p.sku,
    brand_name: p.brand,
    item_name: c.amazonTitle,
    external_product_id: p.productId,
    external_product_id_type: p.productIdType,
    manufacturer: p.manufacturer,
    part_number: p.partNumber,
    product_description: c.amazonDescription,
    standard_price: p.price ? p.price.toFixed(2) : '',
    quantity: p.quantity || 0,
    main_image_url: p.mainImageUrl,
    bullet_point1: c.bullets[0] || '',
    bullet_point2: c.bullets[1] || '',
    bullet_point3: c.bullets[2] || '',
    bullet_point4: c.bullets[3] || '',
    bullet_point5: c.bullets[4] || '',
    generic_keywords: c.keywords,
    item_type: p.specs && p.specs.itemType ? p.specs.itemType : (p.category || 'beauty'),
    target_audience_keywords: (p.targetAudience || []).join(' '),
  };
}

function toWalmartRow(p) {
  const c = p.copy || {};
  return {
    'SKU': p.sku,
    'Product ID Type': p.productIdType,
    'Product ID': p.productId,
    'Product Name': c.walmartName,
    'Brand': p.brand,
    'Short Description': c.shortDescription,
    'Long Description': c.longDescription,
    'Main Image URL': p.mainImageUrl,
    'Price': p.price ? p.price.toFixed(2) : '',
    'Shipping Weight (lb)': p.weightLb || '',
    'Site Description': c.shortDescription,
    'Key Features 1': c.bullets[0] || '',
    'Key Features 2': c.bullets[1] || '',
    'Key Features 3': c.bullets[2] || '',
    'Key Features 4': c.bullets[3] || '',
    'Key Features 5': c.bullets[4] || '',
    'Manufacturer': p.manufacturer,
    'Color': p.colorLabel,
    'Size': p.sizeLabel,
  };
}

const all = items.map(i => i.json);
const amazonRows  = all.map(toAmazonRow);
const walmartRows = all.map(toWalmartRow);

const amazonCsv  = toCsv(amazonRows,  AMAZON_HEADERS);
const walmartCsv = toCsv(walmartRows, WALMART_HEADERS);

const summary = {
  generatedAt: new Date().toISOString(),
  count: all.length,
  haramoonCount: all.filter(p => p.copy && p.copy.isHaramoonLine).length,
  brandSuffixApplied: all.filter(p => p.copy && p.copy.brandSuffixApplied).length,
  voice: 'Clinical Glow / Quiet Luxury',
};

return [{
  json: {
    summary,
    amazon: { headers: AMAZON_HEADERS, rows: amazonRows, csv: amazonCsv },
    walmart: { headers: WALMART_HEADERS, rows: walmartRows, csv: walmartCsv },
  },
  binary: {
    amazon_listings_csv: {
      data: Buffer.from(amazonCsv, 'utf8').toString('base64'),
      mimeType: 'text/csv',
      fileName: `wax-wane-amazon-listings-${Date.now()}.csv`,
      fileExtension: 'csv',
    },
    walmart_listings_csv: {
      data: Buffer.from(walmartCsv, 'utf8').toString('base64'),
      mimeType: 'text/csv',
      fileName: `wax-wane-walmart-listings-${Date.now()}.csv`,
      fileExtension: 'csv',
    },
  },
}];
