// graphql/queries.ts

import { gql } from "graphql-tag"; // or your GraphQL client

// -----------------------
// Recipe Queries
// -----------------------
export const GET_RECIPES = gql`
  query GetRecipes($user_id: uuid!) {
    recipes {
      id
      title
      description
      featured_image
      prep_time_minutes
      updated_at

      # Total number of likes for this recipe (Correct)
      recipe_likes_aggregate {
        aggregate {
          count
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
// export const GET_RECIPES = gql`
//   query GetRecipes {
//     recipes {
//       id
//       title
//       description
//       featured_image
//       prep_time_minutes
//       updated_at
//       recipe_likes_aggregate {
//         aggregate {
//           count
//         }
//       }
//       recipe_comments {
//         content
//         user_id
//       }
//       recipe_bookmarks(where: {user_id: {_eq:  "28680b74-3b97-44ce-9ff3-7108d7c43551"}}){
//         id
//       }
//       recipe_likes(where: {user_id: {_eq: "28680b74-3b97-44ce-9ff3-7108d7c43551"}}) {
//         id
//       }
//     }
//   }
// `;

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

// -----------------------
// Recipe Mutations
// -----------------------
export const CREATE_RECIPE = gql`
  mutation CreateRecipe($input: RecipeInput!) {
    createRecipe(input: $input) {
      id
      title
    }
  }
`;

export const LIKE_RECIPE = gql`
  mutation LikeRecipe($recipeId: ID!) {
    likeRecipe(recipeId: $recipeId) {
      id
      likes
      liked
    }
  }
`;

export const BOOKMARK_RECIPE = gql`
  mutation BookmarkRecipe($recipeId: ID!) {
    bookmarkRecipe(recipeId: $recipeId) {
      id
      bookmarked
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($recipeId: ID!, $body: String!) {
    addComment(recipeId: $recipeId, body: $body) {
      id
      body
      user {
        id
        display_name
      }
    }
  }
`;

// -----------------------
// User / Chef Queries
// -----------------------
export const GET_CHEFS = gql`
  query GetChefs {
    users {
      id
      display_name
      bio
      avatar_url
      recipes {
        id
        title
        featured_image_url
      }
    }
  }
`;

export const FOLLOW_CHEF = gql`
  mutation FollowChef($chefId: ID!) {
    followChef(chefId: $chefId) {
      followerId
      followingId
    }
  }
`;

// get User by ID
export const GET_USER_BY_ID = gql`
    query MyQuery($userId: uuid!) {
      users(where: {id: {_eq: $userId}}) {
      avatar_url
      bio
      created_at
      display_name
      email
      username
    }
  }
`;
