import { locale } from './i18n';

export function sortRows<T extends Record<string,any>>(rows:T[],key:string,direction:string):T[]{
  if(!key || !direction)return rows;
  return [...rows].sort((a,b)=>{const x=a[key]??'',y=b[key]??'';const order=typeof x==='number' && typeof y==='number'?x-y:String(x).localeCompare(String(y),locale.value,{numeric:true});return direction==='asc'?order:-order;});
}
