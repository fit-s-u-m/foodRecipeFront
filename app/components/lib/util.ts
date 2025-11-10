import type { FILTER } from "~/types/types";

export async function uploadToCloudinary(files: File[]) {
  const cloudName = "dabbqob1j";
  const uploadPreset = "food-Recipe";

  const uploadPromises = Array.from(files).map(async (file): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url; // return the uploaded URL
  });

  // Run all uploads in parallel
  const urls = await Promise.all(uploadPromises);

  // You now have all the uploaded image URLs
  // eslint-disable-next-line no-console
  console.log("Uploaded URLs:", urls);
  return urls;
}
export function buildWhere(filter: FILTER, user_id?: string) {
  const where: any = {};

  if (filter.bookmarked) {
    if (user_id) {
      where.recipe_bookmarks = {
        user_id: { _eq: user_id },
      };
    }
  }

  if (filter.prepTime) {
    const [lb, ub] = filter.prepTime;
    where.prep_time_minutes = {
      _gte: lb,
      _lte: ub,
    };
  }
  if (filter.categories && filter.categories.length > 0) {
    where.recipe_categories = {
      category: {
        name: {
          _in: filter.categories,
        },
      },
    };
  }
  if (filter.ingredients && filter.ingredients.length > 0) {
    where.recipe_ingredients = {
      ingredient: {
        name: {
          _in: filter.ingredients,
        },
      },
    };
  }
  if (filter.excludeIngredients && filter.excludeIngredients.length > 0) {
    where._not = {
      recipe_ingredients: {
        ingredient: { // follow the relationship
          name: { _in: filter.excludeIngredients },
        },
      },
    };
  }
  if (filter.searchTerm && filter.searchTerm.trim() !== "") {
    if (filter.searchItem === "ingredients") {
      where.name = {
        _ilike: `%${filter.searchTerm}%`,
      };
    }

    if (filter.searchItem === "category") {
      where.name = {
        _ilike: `%${filter.searchTerm}%`,
      };
    }

    if (filter.searchItem === "recipe") {
      where.title = {
        _ilike: `%${filter.searchTerm}%`,
      };
    }
    if (filter.searchItem === "chef") {
      where.username = {
        _ilike: `%${filter.searchTerm}%`,
      };
    }
  }
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(where, null, 2));
  return where;
}

function normalizeQueryArray(value: string | string[] | null | undefined): string[] {
  if (!value)
    return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}
export function applyRouteFilters(query: any) {
  return {
    bookmarked: !!query.bookmarked,
    prepTime: Array.isArray(query.prepTime)
      ? query.prepTime.map(Number)
      : query.prepTime
        ? [Number(query.prepTime), Number(query.prepTime)]
        : [2, 300],
    ingredients: normalizeQueryArray(query.ingredients),
    excludeIngredients: normalizeQueryArray(query.excludeIngredients),
    categories: normalizeQueryArray(query.categories),
  };
}
