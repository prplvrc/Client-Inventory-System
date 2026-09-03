import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { API_URL } from "../services/api";

interface Product {
  id: number;
  product: string;
  category: string;
  categoryId?: number;
  price: number;
  status: string;
  bom: string | null;
}

interface Category {
  id: number;
  name: string;
  status?: string;
}

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  status: string;
}

interface RecipeItem {
  ingredientId: string;
  quantity: string;
}

interface ProductDetails {
  id: number;
  product: string;
  categoryId: number;
  category: string;
  price: number;
  status: string;
  bom: {
    id: number;
    items: {
      id: number;
      ingredientId: number;
      quantity: number;
      ingredient: Ingredient;
    }[];
  } | null;
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ProductForm({
  product,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [productName, setProductName] = useState(
    product?.product ?? ""
  );

  const [categoryId, setCategoryId] = useState(
    product?.categoryId?.toString() ?? ""
  );

  const [price, setPrice] = useState(
    product?.price?.toString() ?? ""
  );

  const [status, setStatus] = useState(
    product?.status ?? "ACTIVE"
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] =
    useState(true);
  const [loadingIngredients, setLoadingIngredients] =
    useState(true);
  const [loadingProduct, setLoadingProduct] = useState(
    Boolean(product)
  );

  const [error, setError] = useState("");

  const isEditing = Boolean(product);

  // ========================================
  // Fetch categories
  // ========================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        if (!API_URL) {
          throw new Error(
            "VITE_API_URL is not configured."
          );
        }

        const response = await fetch(
          `${API_URL}/categories`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories."
          );
        }

        const result: Category[] =
          await response.json();

        setCategories(result);

        // If categoryId wasn't already provided
        // by the product object, find it using
        // the category name.
        if (
          product &&
          !product.categoryId
        ) {
          const selectedCategory = result.find(
            (category) =>
              category.name.toLowerCase() ===
              product.category.toLowerCase()
          );

          if (selectedCategory) {
            setCategoryId(
              selectedCategory.id.toString()
            );
          }
        }
      } catch (err) {
        console.error(
          "Fetch categories error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [API_URL, product]);

  // ========================================
  // Fetch ingredients
  // ========================================

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoadingIngredients(true);

        if (!API_URL) {
          throw new Error(
            "VITE_API_URL is not configured."
          );
        }

        const response = await fetch(
          `${API_URL}/ingredients`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch ingredients."
          );
        }

        const result: Ingredient[] =
          await response.json();

        setIngredients(result);
      } catch (err) {
        console.error(
          "Fetch ingredients error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load ingredients."
        );
      } finally {
        setLoadingIngredients(false);
      }
    };

    fetchIngredients();
  }, [API_URL]);

  // ========================================
  // Fetch product details when editing
  // ========================================

  useEffect(() => {
    if (!product) {
      setLoadingProduct(false);
      return;
    }

    const fetchProductDetails = async () => {
      try {
        setLoadingProduct(true);

        if (!API_URL) {
          throw new Error(
            "VITE_API_URL is not configured."
          );
        }

        const response = await fetch(
          `${API_URL}/products/${product.id}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch product details."
          );
        }

        const result: ProductDetails =
          await response.json();

        // Make sure category is correct
        setCategoryId(
          result.categoryId.toString()
        );

        // Load recipe
        if (result.bom?.items) {
          setRecipe(
            result.bom.items.map((item) => ({
              ingredientId:
                item.ingredientId.toString(),
              quantity:
                item.quantity.toString(),
            }))
          );
        } else {
          setRecipe([]);
        }
      } catch (err) {
        console.error(
          "Fetch product details error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load product details."
        );
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProductDetails();
  }, [API_URL, product?.id]);

  // ========================================
  // Add recipe item
  // ========================================

  const addRecipeItem = () => {
    setRecipe((current) => [
      ...current,
      {
        ingredientId: "",
        quantity: "",
      },
    ]);
  };

  // ========================================
  // Update recipe item
  // ========================================

  const updateRecipeItem = (
    index: number,
    field: keyof RecipeItem,
    value: string
  ) => {
    setRecipe((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ========================================
  // Remove recipe item
  // ========================================

  const removeRecipeItem = (index: number) => {
    setRecipe((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  // ========================================
  // Submit
  // ========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error(
          "VITE_API_URL is not configured."
        );
      }

      // ========================================
      // Product validation
      // ========================================

      if (!productName.trim()) {
        throw new Error(
          "Product name is required."
        );
      }

      if (!categoryId) {
        throw new Error(
          "Please select a category."
        );
      }

      const numericPrice = Number(price);

      if (
        price === "" ||
        !Number.isFinite(numericPrice)
      ) {
        throw new Error(
          "Please enter a valid price."
        );
      }

      if (numericPrice < 0) {
        throw new Error(
          "Price cannot be negative."
        );
      }

      // ========================================
      // Recipe validation
      // ========================================

      const seenIngredients = new Set<number>();

      for (const item of recipe) {
        if (!item.ingredientId) {
          throw new Error(
            "Please select an ingredient for every recipe row."
          );
        }

        const ingredientId = Number(
          item.ingredientId
        );

        const quantity = Number(
          item.quantity
        );

        if (
          !Number.isFinite(quantity) ||
          quantity <= 0
        ) {
          throw new Error(
            "Recipe quantities must be greater than zero."
          );
        }

        if (
          seenIngredients.has(ingredientId)
        ) {
          throw new Error(
            "The same ingredient cannot be added more than once."
          );
        }

        seenIngredients.add(ingredientId);
      }

      const productData = {
        product: productName.trim(),
        categoryId: Number(categoryId),
        price: numericPrice,
        status,
        recipe: recipe.map((item) => ({
          ingredientId: Number(
            item.ingredientId
          ),
          quantity: Number(item.quantity),
        })),
      };

      const url = product
        ? `${API_URL}/products/${product.id}`
        : `${API_URL}/products`;

      const response = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const contentType =
        response.headers.get(
          "content-type"
        );

      let result: {
        message?: string;
        [key: string]: unknown;
      } = {};

      if (
        contentType?.includes(
          "application/json"
        )
      ) {
        result = await response.json();
      } else {
        const text =
          await response.text();

        console.error(
          "Non-JSON product response:",
          text
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            (product
              ? "Failed to update product."
              : "Failed to create product.")
        );
      }

      console.log(
        product
          ? "Product updated:"
          : "Product created:",
        result
      );

      onSuccess();

    } catch (err) {
      console.error(
        "Save product error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Available categories
  // ========================================

  const availableCategories =
    categories.filter((category) => {
      if (!isEditing) {
        return category.status === "ACTIVE";
      }

      return (
        category.status === "ACTIVE" ||
        category.id.toString() === categoryId
      );
    });

  // ========================================
  // Available ingredients for a row
  // ========================================

  const getAvailableIngredients = (
    currentIndex: number
  ) => {
    const selectedIds = recipe
      .filter(
        (_, index) => index !== currentIndex
      )
      .map((item) =>
        Number(item.ingredientId)
      );

    return ingredients.filter(
      (ingredient) =>
        ingredient.status === "ACTIVE" ||
        (
          ingredient.id ===
          Number(
            recipe[currentIndex]?.ingredientId
          )
        ) ||
        !selectedIds.includes(
          ingredient.id
        )
    );
  };

  // ========================================
  // Get selected ingredient
  // ========================================

  const getSelectedIngredient = (
    ingredientId: string
  ) => {
    return ingredients.find(
      (ingredient) =>
        ingredient.id ===
        Number(ingredientId)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-3">

          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Product Management
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={16} />
          </button>

        </div>

        {/* HEADER */}
        <div className="border-b border-[#e3dc9e] bg-[#EFEABB]/60 px-4 py-3">

          <h3 className="text-sm font-bold text-gray-900">
            {isEditing
              ? "Edit Product"
              : "Add New Product"}
          </h3>

          <p className="text-[11px] text-gray-600">
            {isEditing
              ? "Update product details and recipe."
              : "Fill out the product details and recipe."}
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mx-4 mt-3 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] space-y-4 overflow-y-auto p-4"
        >

          <div className="grid grid-cols-2 gap-3">

            {/* PRODUCT ID */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Product ID
              </label>

              <input
                type="text"
                value={
                  product?.id ?? "Auto"
                }
                disabled
                className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs text-gray-500"
              />
            </div>

            {/* STATUS */}
            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Status *
              </label>

              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                required
                disabled={loading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none disabled:bg-gray-100"
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>

            {/* PRODUCT NAME */}
            <div className="col-span-2">

              <label
                htmlFor="productName"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Product Name *
              </label>

              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }
                placeholder="e.g. Goto"
                required
                disabled={loading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none disabled:bg-gray-100"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Category *
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value
                  )
                }
                required
                disabled={
                  loadingCategories ||
                  loading
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none disabled:bg-gray-100"
              >
                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : availableCategories.length ===
                        0
                    ? "No active categories"
                    : "Select Category"}
                </option>

                {availableCategories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                      {category.status ===
                      "INACTIVE"
                        ? " (Inactive)"
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* PRICE */}
            <div>
              <label
                htmlFor="price"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Price (₱) *
              </label>

              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                disabled={loading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none disabled:bg-gray-100"
              />
            </div>

          </div>

          {/* ========================================
              RECIPE / INGREDIENTS
          ======================================== */}

          <div className="rounded-lg border border-[#e3dc9e] bg-[#EFEABB]/30 p-3">

            <div className="mb-3 flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-gray-900">
                  Recipe / Ingredients
                </p>

                <p className="text-[10px] text-gray-500">
                  Define the ingredients needed to make one product.
                </p>
              </div>

              <button
                type="button"
                onClick={addRecipeItem}
                disabled={
                  loading ||
                  loadingIngredients ||
                  ingredients.length === 0
                }
                className="flex items-center gap-1 rounded-md border border-[#d6d09b] bg-[#EFEABB] px-2.5 py-1.5 text-[11px] font-semibold text-gray-900 transition hover:bg-[#e3dc9e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={12} />
                Add Ingredient
              </button>

            </div>

            {loadingIngredients ||
            loadingProduct ? (
              <div className="rounded-md border border-gray-200 bg-white p-3 text-center text-[11px] text-gray-500">
                Loading recipe data...
              </div>
            ) : recipe.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 bg-white p-4 text-center">

                <p className="text-[11px] text-gray-500">
                  No ingredients added yet.
                </p>

                <button
                  type="button"
                  onClick={addRecipeItem}
                  disabled={
                    loading ||
                    ingredients.length === 0
                  }
                  className="mt-2 text-[11px] font-semibold text-gray-700 hover:text-black disabled:opacity-50"
                >
                  + Add first ingredient
                </button>

              </div>
            ) : (
              <div className="space-y-2">

                {recipe.map(
                  (item, index) => {
                    const selected =
                      getSelectedIngredient(
                        item.ingredientId
                      );

                    return (
                      <div
                        key={index}
                        className="rounded-md border border-gray-200 bg-white p-2"
                      >

                        <div className="grid grid-cols-[1fr_75px_30px] gap-2">

                          {/* INGREDIENT */}
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-gray-600">
                              Ingredient
                            </label>

                            <select
                              value={
                                item.ingredientId
                              }
                              onChange={(e) =>
                                updateRecipeItem(
                                  index,
                                  "ingredientId",
                                  e.target.value
                                )
                              }
                              disabled={loading}
                              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-[11px] text-gray-900 focus:border-black focus:outline-none"
                            >

                              <option value="">
                                Select ingredient
                              </option>

                              {getAvailableIngredients(
                                index
                              ).map(
                                (
                                  ingredient
                                ) => (
                                  <option
                                    key={
                                      ingredient.id
                                    }
                                    value={
                                      ingredient.id
                                    }
                                  >
                                    {
                                      ingredient.name
                                    }
                                  </option>
                                )
                              )}

                            </select>
                          </div>

                          {/* QUANTITY */}
                          <div>
                            <label className="mb-1 block text-[10px] font-medium text-gray-600">
                              Quantity
                            </label>

                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateRecipeItem(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              min="0"
                              step="0.0001"
                              placeholder="0.0000"
                              disabled={loading}
                              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-[11px] text-gray-900 focus:border-black focus:outline-none"
                            />
                          </div>

                          {/* DELETE */}
                          <div className="flex items-end justify-center pb-1">

                            <button
                              type="button"
                              onClick={() =>
                                removeRecipeItem(
                                  index
                                )
                              }
                              disabled={loading}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Remove ingredient"
                            >
                              <Trash2
                                size={14}
                              />
                            </button>

                          </div>

                        </div>

                        {/* UNIT */}
                        {selected && (
                          <p className="mt-1 text-[10px] text-gray-400">
                            Unit:{" "}
                            {
                              selected.unit
                            }
                          </p>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            )}

            {ingredients.length === 0 &&
              !loadingIngredients && (
                <p className="mt-2 text-[10px] text-red-500">
                  No ingredients are available. Add ingredients from Inventory first.
                </p>
              )}

          </div>

          {/* ========================================
              ACTIONS
          ======================================== */}

          <div className="mt-6 flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingCategories ||
                loadingIngredients ||
                loadingProduct ||
                availableCategories.length === 0
              }
              className="rounded-md border border-[#d6d09b] bg-[#EFEABB] px-4 py-1.5 text-xs font-semibold text-gray-900 hover:bg-[#e3dc9e] disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Product"
                : "Save Product"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ProductForm;
