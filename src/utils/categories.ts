export interface CategoryMeta {
  name: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { name: 'Alimentação', icon: 'coffee', color: '#9B76F2' },
  { name: 'Transporte', icon: 'navigation', color: '#4C9990' },
  { name: 'Moradia', icon: 'home', color: '#6D38E8' },
  { name: 'Estudos', icon: 'book-open', color: '#E4B15B' },
  { name: 'Lazer', icon: 'film', color: '#6AB7A2' },
  { name: 'Assinaturas', icon: 'refresh-cw', color: '#B197FC' },
  { name: 'Saúde', icon: 'heart', color: '#D96B6B' },
  { name: 'Outros', icon: 'grid', color: '#7B7992' }
];

export const INCOME_CATEGORIES: CategoryMeta[] = [
  { name: 'Bolsa', icon: 'award', color: '#1C9B68' },
  { name: 'Estágio', icon: 'briefcase', color: '#6D38E8' },
  { name: 'Apoio familiar', icon: 'heart', color: '#4C9990' },
  { name: 'Freelance', icon: 'laptop', color: '#E4B15B' },
  { name: 'Salário', icon: 'dollar-sign', color: '#1C9B68' },
  { name: 'Outros', icon: 'plus-circle', color: '#7B7992' }
];

export const DEFAULT_CATEGORY_BUDGETS: Record<string, number> = {
  Moradia: 900,
  Alimentação: 500,
  Estudos: 250,
  Lazer: 150,
  Transporte: 200,
  Assinaturas: 200
};

const categoryLookup: Record<string, CategoryMeta> = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
  { name: 'Educação', icon: 'book-open', color: '#E4B15B' }
].reduce<Record<string, CategoryMeta>>((acc, item) => {
  if (!acc[item.name]) acc[item.name] = item;
  return acc;
}, {});

export function getCategoryMeta(name: string): CategoryMeta {
  return categoryLookup[name] || { name, icon: 'tag', color: '#6D38E8' };
}
