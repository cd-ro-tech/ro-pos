export const categoryId=(row:any)=>Number(row.eshop_categ_id??row.id);
export function categoryDescendants(rows:any[],id:number){
 const ids=new Set<number>([id]);
 for(const parent of ids)for(const row of rows)if(Number(row.parent_id)===parent)ids.add(categoryId(row));
 return ids;
}
export function categoryTreeRows(rows:any[],expanded:number[],query=''){
 const term=query.trim().toLocaleLowerCase(),result:any[]=[],visited=new Set<number>();
 const visible=new Set<number>();
 if(term)for(const row of rows)if(String(row.eshop_categ_name||row.name).toLocaleLowerCase().includes(term)){
  let current=row;const seen=new Set<number>();
  while(current&&!seen.has(categoryId(current))){seen.add(categoryId(current));visible.add(categoryId(current));current=rows.find(r=>categoryId(r)===Number(current.parent_id));}
 }
 function visit(parent:number,depth:number){for(const row of rows){const id=categoryId(row),pid=Number(row.parent_id)||0;
  if(visited.has(id)||(pid!==parent&&!(parent===0&&!rows.some(r=>categoryId(r)===pid))))continue;
  visited.add(id);if(term&&!visible.has(id))continue;
  const children=rows.some(r=>Number(r.parent_id)===id);
  result.push({...row,id,eshop_categ_id:id,depth,children});
  if(term||expanded.includes(id))visit(id,depth+1);
 }}visit(0,0);return result;
}

// Sum direct product counts into each ancestor without counting a cycle twice.
export function categoryProductCounts(rows:any[]){
 const byId=new Map(rows.map(row=>[categoryId(row),row])),counts=new Map<number,number>();
 for(const row of rows){const count=Number(row.product_count)||0,seen=new Set<number>();let current:any=row;
  while(current&&!seen.has(categoryId(current))){const id=categoryId(current);seen.add(id);counts.set(id,(counts.get(id)||0)+count);current=byId.get(Number(current.parent_id));}
 }
 return counts;
}

// Effective visibility inherits disabled ancestors without changing child preferences.
export function disabledCategoryUids(categories: {uid:string;parent_uid?:string;active?:boolean}[]) {
 const disabled=new Set(categories.filter(row=>row.active===false).map(row=>row.uid));
 const children=new Map<string,string[]>();
 for(const row of categories)if(row.parent_uid)children.set(row.parent_uid,[...(children.get(row.parent_uid)||[]),row.uid]);
 for(const uid of disabled)for(const child of children.get(uid)||[])disabled.add(child);
 return disabled;
}
