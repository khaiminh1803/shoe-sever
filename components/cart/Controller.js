const cartModel = require('./Model')


const getAllItems = async (userId) => {
    try {
        // const cart = await cartModel.findOne({ userId }).populate('items.product', 'name price')
        // return cart
        return await cartModel.findOne({ userId }).populate('items.product', 'name price image')
    } catch (error) {
        console.log('Get all items error: ', error);
        throw error;
    }
}

const addItem = async (userId, productId, sizeSelected, quantity = 1) => {
    try {
        let cart = await cartModel.findOne({ userId })
        if (!cart) {
            cart = new cartModel({ userId, items: [] })
        }
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId && item.sizeSelected === sizeSelected);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                sizeSelected: sizeSelected
            });
        }
        await cart.save();
        return await cart.populate('items.product');
    } catch (error) {
        console.log('Add to cart: ', error);
        throw error;
    }
}

const removeItem = async (userId, itemId) => {
    try {
        let cart = await cartModel.findOne({ userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        const productIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
        if (productIndex > -1) {
            // Xóa sản phẩm khỏi giỏ hàng
            cart.items.splice(productIndex, 1);
        }
        // Cập nhật giỏ hàng trong database
        await cart.save();
        return await cart.populate('items.product');
    } catch (error) {
        console.log('Remove from cart error: ', error);
        throw error;
    }
}

// Tăng số lượng sản phẩm trong giỏ hàng
const increaseItemQuantity = async (userId, itemId) => {
    try {
        let cart = await cartModel.findOne({ userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += 1;
        } else {
            throw new Error('Item not found in cart');
        }

        await cart.save();
        return await cart.populate('items.product');
    } catch (error) {
        console.log('Increase item quantity error: ', error);
        throw error;
    }
}

// Giảm số lượng sản phẩm trong giỏ hàng
const decreaseItemQuantity = async (userId, itemId) => {
    try {
        let cart = await cartModel.findOne({ userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex > -1) {
            if (cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            } else {
                // throw new Error('Quantity cannot be less than 1');
                // Nếu số lượng bằng 1, xóa item khỏi giỏ hàng
                cart.items.splice(itemIndex, 1);
            }
        } else {
            throw new Error('Item not found in cart');
        }

        await cart.save();
        return await cart.populate('items.product');
    } catch (error) {
        console.log('Decrease item quantity error: ', error);
        throw error;
    }
}




module.exports = { addItem, getAllItems, removeItem, increaseItemQuantity, decreaseItemQuantity }
