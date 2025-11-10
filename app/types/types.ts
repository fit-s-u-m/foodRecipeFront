export interface FILTER {
  excludeIngredients?: string[];
  categories?: string[];
  prepTime?: number[];
  bookmarked?: boolean;
  ingredients?: string[];
  searchTerm?: string;
  searchItem?: "chef" | "category" | "recipe" | "ingredients";
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
export interface NameId {
  id: string;
  name: string;
}
export interface USERS_RES {
  username: string | null;
  user_follower_aggregate: { aggregate: { count: number } };
  recipies: {
    category_id: string | null;
    recipe_images: { url: string }[];
    description: string;
    title: string;
    prep_time_minutes: number;
    recipe_id: number;

  }[];
  recipe_ratings_aggregate: { aggregate: { avg: { rating: null | number } } };

}
export interface GET_CHEFS_QUERY {
  users: {
    id: string;
    user_id: number;
    username: string;
    avatar_url: string | null;
    recipes: {
      recipe_id: number;
      title: string;
      description: string;
      prep_time_minutes: number;
      recipe_images: { url: string }[];
    }[];
    user_following_aggregate: {
      aggregate: {
        count: number;
      };
    };
    recipe_ratings_aggregate: {
      aggregate: {
        avg: {
          rating: number | null;
        } | null;
      };
    };
    user_following: { follower_id: string }[];
  }[];
}
export interface GET_RECIPES_QUERY {
  recipes: {
    title: string;
    created_at: string;
    description: string;
    featured_image: string | null;
    recipe_id: number;
    prep_time_minutes: number;
    recipe_likes_aggregate: {
      aggregate: {
        count: number;
      };
    };
    user: { username: string; avatar_url: string; user_id: number };
    recipe_images: { url: string }[];
    recipe_categories: { category: { name: string } }[];
    recipe_ingredients: { ingredient: { name: string } }[];
    recipe_comments: { content: string; user_id: string }[];
    recipe_bookmarks: { id: number }[];
    recipe_likes: { id: number }[];
  }[];
}
export interface GetChefResponse {
  users: {
    id: string;
    user_id: number;
    username: string;
    avatar_url: string | null;
    user_following: { follower_id: number }[];
    user_following_aggregate: { aggregate: { count: number } };
    recipes: {
      recipe_id: number;
      title: string;
      description: string;
      prep_time_minutes: number;
      recipe_images: { url: string }[];
      recipe_categories: { category: { name: string } }[];
      recipe_likes: { id: number }[];
      recipe_bookmarks: { id: number }[];
      recipe_ratings_aggregate: { aggregate: { avg: { rating: number | null } } };
    }[];
  }[];
}

export interface TOTAL_CHEFS_TYPE {
  users_aggregate: {
    aggregate: {
      count: number;
    };
  };

}
