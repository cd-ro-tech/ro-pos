export interface ProductService { id: number; name: string; price: number; integral: number }
export interface Product {
  id: number; name: string; spec: string; price: number; tax_rate: number;
  category_ids: number[]; template_id: number; barcode: string; sku: string;
  image: string; services: ProductService[];
}
export interface CartLine extends Product { qty: number; selectedServices: number[]; sale_price?: number; ro_pos_price_reason?: string }
export interface Category { id: number; name: string; parent_id: number; image?: string; product_count: number }
export interface OrderSummary {
  id: number | string; number: string; created_at: string; customer_name: string;
  total: number; currency_code: string; state: string; state_name: string;
  fulfillment_type: string; pickup_state: string; is_recharge: boolean;
  store_id: number; store_name: string;
}
export interface Payment {
  payment_id: number; payment_name: string; ro_pos_request_key: string;
  payment_type: string; total: number; ro_pos_status: string; ro_pos_message: string;
  ro_pos_transaction_id: string; ro_pos_cash_received: number; ro_pos_cash_change: number;
}
export interface OrderDetail extends OrderSummary {
  paid: number; remaining: number; payment_data: Payment[];
  lines: {id:number; name:string; qty:number; price:number; total:number; img:string; spec:string}[];
}
