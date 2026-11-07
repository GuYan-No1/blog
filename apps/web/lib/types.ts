export interface Tag {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

/** 文章列表项：不含正文 */
export interface ArticleListItem {
  id: number;
  title: string;
  summary: string;
  cover_image: string;
  views: number;
  category: Category | null;
  tags: Tag[];
  created_at: string;
}

/** 文章详情：包含完整正文 */
export interface ArticleDetail extends ArticleListItem {
  content: string;
  updated_at: string;
}
