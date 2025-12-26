// Utility functions to trigger cart and wishlist updates
export const triggerCartUpdate = (action = 'update', item = null) => {
    const event = new CustomEvent('cart-updated', {
        detail: { action, item }
    });
    window.dispatchEvent(event);

    // Also update localStorage
    if (action === 'add' && item) {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = currentCart.find((i) => i.id === item.id);

        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            currentCart.push(item);
        }

        localStorage.setItem('cart', JSON.stringify(currentCart));
    }

    // You can add more logic for 'remove' and 'update' actions
    if (action === 'remove' && item) {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = currentCart.filter((i) => i.id !== item.id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
};

export const triggerWishlistUpdate = () => {
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
};

// Helper function to add item to cart
export const addToCart = (product) => {
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        // Add other product properties as needed
    };

    triggerCartUpdate('add', cartItem);
    return cartItem;
};

// Helper function to add item to wishlist
export const addToWishlist = (product) => {
    const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        // Add other product properties as needed
    };

    const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = currentWishlist.some((item) => item.id === product.id);

    if (!exists) {
        currentWishlist.push(wishlistItem);
        localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
        triggerWishlistUpdate();
    }

    return wishlistItem;
};