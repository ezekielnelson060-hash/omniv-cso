import { postsA, type BlogPost } from "./posts-data-a";
import { postsB } from "./posts-data-b";
import { postsC } from "./posts-data-c";
import { postsD } from "./posts-data-d";

export type { BlogPost };

export const posts: BlogPost[] = [
  ...postsD,
  ...postsA,
  ...postsB,
  ...postsC,
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function allSlugs(): string[] {
  return posts.map((p) => p.slug);
}
