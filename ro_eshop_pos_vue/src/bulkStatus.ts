export type BulkStatusRow = { id:number; name:string; allowed:boolean; reason:string };
// A repeated target state is a visible no-op, never a silent skip.
export function planBulkStatus(rows:any[], ids:number[], active:boolean):BulkStatusRow[] {
 return [...new Set(ids)].map(id=>{
  const row=rows.find(item=>item.id===id);
  return {id,name:row?.name || `#${id}`,allowed:!!row && (row.active!==false)!==active,
   reason:!row?'记录不存在，可能已被删除':(row.active!==false)===active?(active?'已启用，无需重复操作':'已停用，无需重复操作'):''};
 });
}
