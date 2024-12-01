export interface BlogCard {
  title: string,
  description: string,
  currentSlug: string,
  mainImage: any,
  publishedAt: string
}

export interface BlogAuthor {
  _ref: string,
  _type: string
}

export interface FullBlog {
  title: string,
  description: string,
  author: BlogAuthor,
  currentSlug: string,
  mainImage: any,
  publishedAt: string,
  body: any
}

export interface AuthorInfo {
  name: string,
  currentSlug: string,
  image: any,
  github: string,
  twitter: string,
  id: string
}
