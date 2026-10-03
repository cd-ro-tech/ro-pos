import { t } from './i18n';
export type ExportColumn={key:string;label:string;align?:string};
export async function exportWorkbook(rows:any[],columns:ExportColumn[],name:string){
 const XLSX=await import('xlsx');
 if(rows.some(row=>row.currency_code)&&!columns.some(c=>c.key==='currency_code'))columns=[...columns,{key:'currency_code',label:'币种'}];
 const fields=columns.filter(c=>c.key!=='actions');
 if(!rows.length||!fields.length)throw new Error('没有可导出的勾选记录');
 const sheet=XLSX.utils.aoa_to_sheet([fields.map(c=>t(c.label)),...rows.map(row=>fields.map(c=>{
  const value=row[c.key];
  if(value==null)return '';
  if(typeof value==='boolean')return t(value?'启用':'停用');
  if(typeof value==='number')return Number.isFinite(value)?value:'';
  return typeof value==='object'?JSON.stringify(value):String(value);
 }))]);
 sheet['!autofilter']={ref:sheet['!ref']!};
 sheet['!cols']=fields.map(c=>({wch:c.align==='right'?16:24}));
 const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,t(name).replace(/[\\/?*\[\]:]/g,' ').slice(0,31)||'数据');
 return {filename:t(name)+'.xlsx',content:XLSX.write(book,{type:'base64',bookType:'xlsx'}),count:rows.length};
}
export function downloadWorkbook(result:{filename:string;content:string}){
 const blob=new Blob([Uint8Array.from(atob(result.content),c=>c.charCodeAt(0))],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=result.filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
