export type ProductAttribute = { name: string; value: string };
export function productAttributes(value: unknown): ProductAttribute[] {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 12) throw new Error('每个变体最多 12 个属性');
  const names = new Set<string>();
  return value.map(row => {
    if (!row || typeof row.name !== 'string' || typeof row.value !== 'string') throw new Error('请完整填写属性和属性值');
    const name = row.name.trim(), content = row.value.trim();
    if (!name || !content || name.length > 40 || content.length > 80) throw new Error('请完整填写属性和属性值');
    if (names.has(name)) throw new Error('同一变体不能重复填写属性');
    names.add(name); return { name, value: content };
  });
}
export function variantSpec(value: ProductAttribute[]) { return value.map(a => `${a.name}: ${a.value}`).join(' / '); }
export function variantSignature(value: ProductAttribute[], spec: string) {
  return value.length ? JSON.stringify([...value].sort((a,b)=>a.name.localeCompare(b.name))) : spec.trim();
}
