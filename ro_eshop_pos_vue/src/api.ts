import { ref } from 'vue';
import { activeCurrency } from './currency';
import { formatMoney } from './i18n';
export const session=ref<any>(null), storeId=ref(-1), notice=ref('');
export const money=(value:any,currency=activeCurrency.value)=>formatMoney(value,currency);
export const errorText=(error:any)=>error?.message||'操作未完成，请重试';
export async function api(operation:string,values:Record<string,any>={},options:{signal?:AbortSignal}={}):Promise<any>{
 if(options.signal?.aborted)throw new DOMException('查询已取消','AbortError');
 return (await import('./standalone')).standaloneApi(operation,values);
}
