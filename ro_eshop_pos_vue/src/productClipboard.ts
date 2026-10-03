const keys = ['name','eshop_categ_name','sale_price','barcode','default_code','product_attrs','description_sale'];
/** Parse Excel TSV without losing blank cells, quoted line breaks or leading zeros. */
export function parseClipboardMatrix(text: string): string[][] {
  if (text.length > 2_000_000) throw new Error('粘贴内容过大，请分批录入');
  const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false;
  for (let i=0; i<text.length; i++) {
    const c=text[i];
    if(c==='"' && (quoted || !cell)) { if(quoted && text[i+1]==='"') {cell+='"';i++;} else quoted=!quoted; }
    else if(!quoted && (c==='\t' || c==='\n' || c==='\r')) {
      row.push(cell);cell='';
      if(c!=='\t') {rows.push(row);row=[];if(c==='\r' && text[i+1]==='\n')i++;}
    } else cell+=c;
  }
  if(quoted) throw new Error('单元格引号不完整，请重新复制');
  row.push(cell);rows.push(row);
  if(/[\r\n]$/.test(text) && rows.at(-1)?.every(v=>v===''))rows.pop();
  if(!rows.length || rows.length>501)throw new Error('每批最多粘贴 500 行数据');
  return rows;
}
export function stripProductHeader(rows:string[][]):string[][] {
  const header=rows[0]?.map(v=>v.replace(/[\s*]/g,''));
  return header?.length===7 && header[0]==='商品名称' && ['分类','分类完整名称'].includes(header[1]) && ['售价','售价（元）'].includes(header[2]) ? rows.slice(1) : rows;
}
export function parseClipboardRows(text: string): Record<string, string | number>[] {
  const rows=stripProductHeader(parseClipboardMatrix(text)).filter(r=>r.some(v=>v.trim()));
  if(!rows.length || rows.length>500)throw new Error('每批请输入 1 至 500 行');
  return rows.map((r,i)=>{
    if(r.length>7)throw new Error(`第 ${i+1} 行超过 7 列，请按指定顺序复制`);
    return {...Object.fromEntries(keys.map((k,j)=>[k,(r[j]||'').trim()])),row_number:i+1};
  });
}
