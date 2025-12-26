// Utility functions to update cart/wishlist and trigger updates

export const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
  if (!product || !selectedSize || !selectedColor) return false;

  try {
    const cart = JSON.parse(localStorage.getItem('cart_items') || '[]');

    // Check if same product with same options already exists
    const existingIndex = cart.findIndex(
      item =>
        item.product_id === Number(product.id) &&
        item.size_id === Number(selectedSize.id) &&
        item.color_id === Number(selectedColor.id)
    );

    const cartItem = {
      id: Number(product.id), // can be unique or same as product_id
      product_id: Number(product.id),
      name: product.name,
      price: Number(product.unit_price),
      image: product.thumbnail_image,
      quantity: Number(quantity),
      size: selectedSize.name,
      size_id: Number(selectedSize.id),
      color: selectedColor.name,
      color_id: Number(selectedColor.id),
    };

    if (existingIndex >= 0) {
      // Update quantity if same item exists
      cart[existingIndex].quantity += Number(quantity);
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart_items', JSON.stringify(cart));

    // Trigger update event
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
  }
};

export const removeFromCart = (productId, sizeId = null, colorId = null) => {
  try {
    const cart = JSON.parse(localStorage.getItem('cart_items') || '[]');

    const updatedCart = cart.filter(
      item =>
        item.product_id !== Number(productId) ||
        (sizeId !== null && item.size_id !== Number(sizeId)) ||
        (colorId !== null && item.color_id !== Number(colorId))
    );

    localStorage.setItem('cart_items', JSON.stringify(updatedCart));

    window.dispatchEvent(new CustomEvent('cartUpdated'));
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return false;
  }
};

export const updateCartQuantity = (productId, quantity, sizeId = null, colorId = null) => {
  try {
    const cart = JSON.parse(localStorage.getItem('cart_items') || '[]');

    const itemIndex = cart.findIndex(
      item =>
        item.product_id === Number(productId) &&
        (sizeId === null || item.size_id === Number(sizeId)) &&
        (colorId === null || item.color_id === Number(colorId))
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = Number(quantity);
      }

      localStorage.setItem('cart_items', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return false;
  }
};

export const addToWishlist = (product, selectedSize = null, selectedColor = null) => {
  if (!product) return false;

  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist_items') || '[]');

    const wishlistItem = {
      id: Number(product.id),
      product_id: Number(product.id),
      name: product.name,
      price: Number(product.unit_price),
      image: product.thumbnail_image,
      size: selectedSize?.name || null,
      size_id: selectedSize?.id ? Number(selectedSize.id) : null,
      color: selectedColor?.name || null,
      color_id: selectedColor?.id ? Number(selectedColor.id) : null,
    };

    // Avoid duplicates
    if (!wishlist.some(item => item.product_id === wishlistItem.product_id)) {
      wishlist.push(wishlistItem);
      localStorage.setItem('wishlist_items', JSON.stringify(wishlist));
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
};

export const removeFromWishlist = (productId) => {
  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist_items') || '[]');
    const updatedWishlist = wishlist.filter(item => item.product_id !== Number(productId));
    localStorage.setItem('wishlist_items', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};
