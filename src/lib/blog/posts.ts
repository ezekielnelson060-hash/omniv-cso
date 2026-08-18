import { postsA, type BlogPost } from "./posts-data-a";
import { postsB } from "./posts-data-b";
import { postsC } from "./posts-data-c";

export type { BlogPost };

export const posts: BlogPost[] = [...postsA, ...postsB, ...postsC];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function allSlugs(): string[] {
  return posts.map((p) => p.slug);
}
