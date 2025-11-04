// graphql/queries.ts

import { gql } from "graphql-tag";
// or your GraphQL client
export const UPDATE_USER_AVATAR_BY_ID = gql`
  mutation MyMutation(
    $user_id: uuid!,
    $avatar_url: String!,
  ) {
    update_users_by_pk(
      pk_columns: { id: $user_id },
      _set: {
        avatar_url: $avatar_url,
      }
    ) {
      id
      avatar_url
      bio
      created_at
      username
      email
    }
  }
`;
export const UPDATE_USER_BY_ID = gql`
  mutation MyMutation(
    $user_id: uuid!,
    $bio: String!,
    $username: String!,
    $email: String!
  ) {
    update_users_by_pk(
      pk_columns: { id: $user_id },
      _set: {
        bio: $bio,
        username: $username,
        email: $email
      }
    ) {
      id
      avatar_url
      bio
      created_at
      username
      email
    }
  }
`;
export const GET_CHEFS_AND_ID = gql`
  query GetChefs($limit: Int, $where: users_bool_exp!) {
    users(
      limit: $limit
      where: {
        _and: [
          { recipes_aggregate: { count: { predicate: { _gt: 0 } } } }
          $where
        ]
      }
    ) {
      username
      email
      avatar_url
      user_id
    }
  }
`;

export const GET_USER_BY_ID = gql`
query GetUserById($user_id: uuid!){
 users(where: {id: {_eq: $user_id}}) {
    id
    avatar_url
    bio
    email
    username
    created_at
    display_name
    recipes_aggregate{aggregate{count}}
    recipe_likes_aggregate{aggregate{count}}
    user_following_aggregate{aggregate{count}}
  }
}
`;
// -----------------------
// Recipe Queries
// -----------------------
// where: {
//     prep_time_minutes: {_gte: 10, _lte: 10},
//     recipe_bookmarks: {user_id: {_eq: ""}}}
export const GET_RECIPES = gql`
  query GetRecipes(
        $user_id: uuid!, 
        $limit: Int,
        $offset: Int,
        $where: recipes_bool_exp
    ) {
    recipes (
        limit:$limit, 
        offset:$offset,
        order_by: {
          recipe_likes_aggregate: { count: desc_nulls_last },
          recipe_ratings_aggregate: { avg: { rating: desc_nulls_last } },
          recipe_images_aggregate: {count: desc_nulls_last},
          created_at: desc
        },
        where: $where
    ) {
      id
      title
      description
      prep_time_minutes
      updated_at
      recipe_id
      recipe_ingredients {
        ingredient {
          name
        }
      }
      created_at
      user{
        username
        avatar_url
        user_id
      }
      recipe_categories {
        category {
          name
        }
      }
      recipe_images {
        url
      }
      recipe_steps {
        content
        step_index
      }

      # Total number of likes for this recipe (Correct)
      recipe_likes_aggregate {
        aggregate {
          count
        }
      }
      # Avarage rating
      recipe_ratings_aggregate {
            aggregate {
              avg {
                rating
              }
            }
       }

      # All comments on this recipe (Correct)
      recipe_comments {
        content
        user_id
      }

      # Check if the CURRENT user has bookmarked this recipe
      recipe_bookmarks(where: {user_id: {_eq: $user_id}}){
        id
      }

      # Check if the CURRENT user has liked this recipe
      recipe_likes(where: {user_id: {_eq: $user_id}}) {
        id
      }
    }
  }
`;
export const GET_RECIPES_BY_ID = gql`
  query GetRecipes($user_id: uuid!,$recipe_id:Int!) {
    recipes(where: {recipe_id: {_eq: $recipe_id}}) {
      id
      title
      description
      prep_time_minutes
      updated_at
      recipe_id
      recipe_ingredients {
        ingredient {
          name
        }
      }
      recipe_categories {
        category {
          name
        }
      }
      # Avarage rating
      recipe_ratings_aggregate {
            aggregate {
              avg {
                rating
              }
            }
          }
      recipe_images {
        url
      }
      recipe_steps {
        content
        step_index
      }

      # Total number of likes for this recipe (Correct)
      recipe_likes_aggregate {
        aggregate {
          count
        }
      }

      # All comments on this recipe (Correct)
      recipe_comments {
        id
        content
        user{
          username
          avatar_url
        }
        created_at
      }

      # Check if the CURRENT user has bookmarked this recipe
      recipe_bookmarks(where: {user_id: {_eq: $user_id}}){
        id
      }

      # Check if the CURRENT user has liked this recipe
      recipe_likes(where: {user_id: {_eq: $user_id}}) {
        id
      }
      recipe_ratings(where: {user_id: {_eq: $user_id}}) {
        rating
      }
    }
  }
`;

export const GET_RECIPE_BY_ID = gql`
  query GetRecipeById($id: ID!) {
    recipe(id: $id) {
      id
      title
      description
      featured_image
      prep_time_minutes
      steps {
        step_index
        content
      }
      ingredients {
        name
        amount
      }
      likes
      bookmarked
      comments {
        id
        body
        user {
          id
          display_name
        }
      }
    }
  }
`;

export const GET_INGREDIENTS = gql`
  query MyQuery ($limit: Int, $where: ingredients_bool_exp) {
    ingredients (limit:$limit, where:$where){
      name
      id
    }
  }
`;
export const GET_CATEGORIES = gql`
  query MyQuery($limit: Int, $where: categories_bool_exp) {
    categories(limit:$limit, where:$where) {
      name
      id
    }
  }
`;
export const INSERT_RECIPE = gql`
mutation InsertRecipe(
  $user_id: uuid!,
  $title: String!,
  $description: String!,
  $prep_time_minutes: Int!,
  $images: [recipe_images_insert_input!] = [],
  $ingredients: [recipe_ingredients_insert_input!] = [],
  $categories: [recipe_categories_insert_input!] = [],
  $steps: [recipe_steps_insert_input!] = []
) {
  insert_recipes(
    objects: {
      user_id: $user_id
      title: $title
      description: $description
      prep_time_minutes: $prep_time_minutes
      recipe_images: { data: $images }         # array of { url: "..." }
      recipe_ingredients: { data: $ingredients } # array of { ingredient_id: "..." }
      recipe_categories: { data: $categories }   # array of { category_id: "..." }
      recipe_steps: { data: $steps }             # array of { step_text: "..." }
    }
  ) {
    returning {
      id
      title
    }
    affected_rows
  }
}

`;

export const GET_USERS = gql`
query MyQuery {
  users {
    username
    avatar_url
    user_follower_aggregate {
      aggregate {
        count
      }
    }
    recipes {
      title
      recipe_categories {
        category {
          name
        }
      }
      recipe_images {
        url
      }
      description
      prep_time_minutes
      recipe_id
    }
    recipe_ratings_aggregate {
      aggregate {
        avg {
          rating
        }
      }
    }
  }
}
`;

// id: { _neq: $user_id }
export const GET_CHEFS = gql`
  query GetChefs($user_id: uuid!) {
    users(
      where: {
        recipes_aggregate: { count: { predicate: { _gt: 0 } } }
      }
    ) {
      id
      username
      avatar_url
      user_id

      # Whether the current user follows this chef
      user_following(where: { follower_id: { _eq: $user_id } }) {
        follower_id
      }

      # Number of followers this chef has
      user_following_aggregate {
        aggregate {
          count
        }
      }

      recipes (
        order_by: {
          recipe_likes_aggregate: { count: desc_nulls_last },
          recipe_ratings_aggregate: { avg: { rating: desc_nulls_last } },
          recipe_images_aggregate: {count: desc_nulls_last}
          created_at: desc
        }
        limit: 3
        ) {
          title
          description
          prep_time_minutes
          recipe_id
          recipe_categories {
            category {
              name
            }
          }
          recipe_images {
            url
          }
      }

      recipe_ratings_aggregate {
        aggregate {
          avg {
            rating
          }
        }
      }
    }
  }
`;
export const GET_CHEF = gql`
query GetChefProfile($chef_id: Int!, $current_user_id: uuid!) {
  users(where: { user_id: { _eq: $chef_id } }) {
    id
    user_id
    username
    avatar_url

    # Does the current user follow this chef?
    user_following(where: { follower_id: { _eq: $current_user_id } }) {
      follower_id
    }

    # Total followers of the chef
    user_following_aggregate {
      aggregate {
        count
      }
    }

    # All recipes of this chef
    recipes(order_by: { created_at: desc }) {
      recipe_id
      title
      description
      prep_time_minutes

      recipe_images {
        url
      }

      recipe_categories {
        category {
          name
        }
      }

      # Did the current user like this recipe?
      recipe_likes(where: { user_id: { _eq: $current_user_id } }) {
        id
      }

      # Did the current user bookmark this recipe?
      recipe_bookmarks(where: { user_id: { _eq: $current_user_id } }) {
        id
      }

      # Average rating of the recipe
      recipe_ratings_aggregate {
        aggregate {
          avg {
            rating
          }
        }
      }
    }
  }
}

`;
export const FOLLOW_CHEF = gql`
mutation FollowChef($follower_id: uuid!, $following_id: uuid!) {
  insert_user_follows(
    objects: { follower_id: $follower_id, following_id: $following_id }
  ) {
    affected_rows
  }
}
`;

export const UNFOLLOW_CHEF = gql`
mutation UnfollowChef($follower_id: uuid!, $following_id: uuid!) {
  delete_user_follows(
    where: {
      follower_id: { _eq: $follower_id },
      following_id: { _eq: $following_id }
    }
  ) {
    affected_rows
  }
}
`;
export const BOOKMARK_RECIPE = gql`
  mutation Bookmark ($recipe_id:uuid!,$user_id:uuid!) {
   insert_recipe_bookmarks_one(
      object: {
        recipe_id: $recipe_id,
        user_id: $user_id}
      ) { id }
  }
`;

export const UNBOOKMARK_RECIPE = gql`
mutation UnBookmark_Recipe($recipe_id: uuid!, $user_id: uuid!) {
   delete_recipe_bookmarks(
    where: {
      user_id: { _eq: $user_id },
      recipe_id: { _eq: $recipe_id }
    }
  ) { affected_rows }
}
`;

export const LIKE_RECIPE = gql`
  mutation LikeRecipe ($recipe_id:uuid!,$user_id:uuid!) {
     insert_recipe_likes_one(
      object: {
        recipe_id: $recipe_id,
        user_id: $user_id}
      ) { id }
  }
`;

export const UNLIKE_RECIPE = gql`
mutation Unlike_Recipe($recipe_id: uuid!, $user_id: uuid!) {
   delete_recipe_likes(
    where: {
      user_id: { _eq: $user_id },
      recipe_id: { _eq: $recipe_id }
    }
  ) { affected_rows }
}
`;
export const RATE_RECIPE = gql`
mutation RateRecipe($recipe_id: uuid!, $user_id: uuid!, $rating: smallint!) {
  insert_recipe_ratings_one(
    object: {
      recipe_id: $recipe_id,
      user_id: $user_id,
      rating: $rating
    },
    on_conflict: {
      constraint: recipe_ratings_recipe_id_user_id_key,  # <--- use your UNIQUE(recipe_id, user_id)
      update_columns: rating
    }
  ) {
    recipe_id
    user_id
    rating
  }
}
`;

export const COMMENT_RECIPE = gql`
  mutation CommentRecipe ($recipe_id:uuid!,$user_id:uuid!,$content:String!) {
    insert_recipe_comments(objects: {content: $content, recipe_id: $recipe_id, user_id: $user_id}) {
        affected_rows
      }
    }
`;
export const ADD_INGREDIENT = gql`
  mutation ADD_INGREDIENT ($name: String!) {
    insert_ingredients(objects: {name: $name}) {
      affected_rows
    }
  }
`;
export const ADD_CATEGORY = gql`
  mutation ADD_CATEGORY ($name: String!) {
   insert_categories(objects: {name: $name}) {
      affected_rows
    }
  }
`;
export const TOTAL_RECIPES = gql`
query myquery ( $where: recipes_bool_exp){
  recipes_aggregate (where:$where) {
      aggregate {
        count
      }
    }
}
`;
