export interface FILTER {
  excludeIngredients: string[];
  category: string;
  prepTime: [number, number];
  sortBy: "latest" | "popular" | "rating";
  bookmarked: boolean;
}
export interface USER {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatar_url: string | null;
  stats: {
    recipes: number;
    followers: number;
    likes: number;
  };
}
