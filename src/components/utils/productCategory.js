const normalize = (value) => value?.trim?.().toLowerCase?.() || "";

const productCategories = (product) => {
  const categories = Array.isArray(product?.categories) ? product.categories : [];
  return [...categories, product?.category].filter(Boolean);
};

export const isInProductBranch = (product, parentName) => {
  const parent = normalize(parentName);

  return productCategories(product).some((category) => {
    const categoryParent = normalize(category.parent_name);
    const categoryName = normalize(category.name);
    return categoryParent === parent || categoryName === parent;
  });
};

// A product can belong to more than one category. Match every assignment so
// collection pages do not hide products whose primary category is different.
export const matchesProductCategory = (product, parentName, categoryNames) => {
  const parent = normalize(parentName);
  const acceptedNames = (Array.isArray(categoryNames) ? categoryNames : [categoryNames])
    .map(normalize);

  return productCategories(product).some((category) => {
    const categoryParent = normalize(category.parent_name);
    const categoryName = normalize(category.name);

    return categoryParent === parent && acceptedNames.includes(categoryName);
  });
};
