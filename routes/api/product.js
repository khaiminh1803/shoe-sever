var express = require('express');
var router = express.Router();
const productController = require('../../components/product/Controller')
const cartController = require('../../components/cart/Controller')
const orderController = require('../../components/order/Controller')
const voucherContronller = require('../../components/voucher/Controller')
const favoriteController = require('../../components/favorite/Controller')
const config = require('../../middle/config')
// http://localhost:3000/api/products
// http://localhost:3000/api/products/get-all
router.get('/get-all', async function (req, res, next) {
    try {
        const products = await productController.getAllProducts()
        return res.status(200).json({ result: true, products })
    } catch (error) {
        return res.status(500).json({ result: false, products: null })
    }
});

// http://localhost:3000/api/products/getallorder
router.get('/getallorder', async function (req, res, next) {
    try {
        const orders = await orderController.getAllOrder()
        return res.status(200).json({ result: true, orders })
    } catch (error) {
        return res.status(500).json({ result: false, orders: null })
    }
});

// http://localhost:3000/api/products/get-all/:id/detail
router.get('/get-all/:id/detail', async function (req, res, next) {
    try {
        const { id } = req.params
        const productDetail = await productController.getProductById(id);

        if (productDetail) {
            return res.status(200).json({ result: true, productDetail });
        } else {
            return res.status(404).json({ result: false, productDetail: null });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ result: false, productDetail: null });
    }
});

// http://localhost:3000/api/products/search?name=shoe
router.get('/search', async function (req, res, next) {
    try {
        const { name } = req.query
        const products = await productController.searchProduct(name)
        return res.status(200).json({ result: true, products })
    } catch (error) {
        return res.status(500).json({ result: false, products: null })
    }
});

// http://localhost:3000/api/products/filter?category=Shoes&size=36&less=500&greater=100
router.get('/filter', async function (req, res, next) {
    try {
        const { categoryName, size, min, max } = req.query;
        const products = await productController.filterProduct(categoryName, size, Number(min), Number(max));
        if (products && products.length > 0) {
            return res.status(200).json({ result: true, products });
        } else {
            return res.status(400).json({ result: false, message: 'No products found', products: [] });
        }
    } catch (error) {
        return res.status(500).json({ result: false, products: null });
    }
});

// http://localhost:3000/api/products/filterByBrand?brandName=Adidas
router.get('/filterByBrand', async function (req, res, next) {
    try {
        const { brandName } = req.query;
        const products = await productController.getProductsByBrand(brandName);
        if (products) {
            return res.status(200).json({ result: true, products });
        } else {
            return res.status(400).json({ result: false, products: null });
        }
    } catch (error) {
        return res.status(500).json({ result: false, products: null });
    }
});

// http://localhost:3000/api/products/cart/addToCart
router.post('/cart/addToCart', async function (req, res, next) {
    try {
        const { userId, productId, sizeSelected } = req.body
        const cartItem = await cartController.addItem(userId, productId, sizeSelected);
        if (cartItem) {
            return res.status(200).json({ result: true, cartItem });
        } else {
            return res.status(400).json({ result: false, cartItem: null });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ result: false, cartItem: null });
    }
});

// http://localhost:3000/api/products/cart/getAllItems/:id
router.get('/cart/getAllItems/:userId', async function (req, res, next) {
    try {
        const { userId } = req.params
        const cart = await cartController.getAllItems(userId);
        if (cart) {
            return res.status(200).json({ result: true, cart });
        } else {
            return res.status(404).json({ result: false, cart: null });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ result: false, cart: null });
    }
});

// http://localhost:3000/api/products/cart/remove
router.delete('/cart/remove', async (req, res) => {
    const { userId, itemId } = req.body;
    try {
        const updatedCart = await cartController.removeItem(userId, itemId);
        if (updatedCart) {
            return res.status(200).json({ result: true, updatedCart });
        } else {
            return res.status(404).json({ result: true, updatedCart: null });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ result: false, updatedCart: null });
    }
});

// API tăng số lượng sản phẩm
// http://localhost:3000/api/products/cart/increase
router.post('/cart/increase', async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        const updatedCart = await cartController.increaseItemQuantity(userId, itemId);
        return res.status(200).json({ result: true, updatedCart });
    } catch (error) {
        return res.status(500).json({ result: false, updatedCart: null });
    }
});

// API giảm số lượng sản phẩm
// http://localhost:3000/api/products/cart/decrease
router.post('/cart/decrease', async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        const updatedCart = await cartController.decreaseItemQuantity(userId, itemId);
        return res.status(200).json({ result: true, updatedCart });
    } catch (error) {
        return res.status(500).json({ result: false, updatedCart: null });
    }
});

// router.post('/cart/updateTotalPrice', async (req, res) => {
//     const { userId, totalPrice, selectedItems } = req.body;
//     try {
//         const updatedCart = await cartController.updateTotalPrice(userId, totalPrice, selectedItems);
//         return res.status(200).json({ result: true, updatedCart });
//     } catch (error) {
//         return res.status(500).json({ result: false, error: error.message });
//     }
// });


router.post('/order', async (req, res) => {
    const { userId, email, phonenumber, shippingAddress, selectedItems, paymentMethod, totalPrice, voucherId } = req.body;
    try {
        const order = await orderController.createOrder(userId, email, phonenumber, shippingAddress, selectedItems, paymentMethod, totalPrice, voucherId);
        return res.status(200).json({ result: true, order });
    } catch (error) {
        return res.status(500).json({ result: false, error: error.message });
    }
});

// http://localhost:3000/api/products/orderUser
router.get('/orderUser', async function (req, res, next) {
    try {
        const {userId} = req.query
        const orders = await orderController.getAllOrderById(userId)
        return res.status(200).json({ result: true, orders })
    } catch (error) {
        return res.status(500).json({ result: false, orders: null })
    }
});

// http://localhost:3000/api/products/orderUser/:id/detail
router.get('/orderUser/:id/detail', async function (req, res, next) {
    try {
        const { id } = req.params
        const orderDetail = await orderController.getOrderById(id);

        if (orderDetail) {
            return res.status(200).json({ result: true, orderDetail });
        } else {
            return res.status(404).json({ result: false, orderDetail: null });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ result: false, orderDetail: null });
    }
});

// http://localhost:3000/api/products/cancelOrder
router.post('/cancelOrder', async function (req, res, next) {
    try {
        const { userId, orderId } = req.body;
        console.log("alo123", userId, orderId);
        
        const result = await orderController.cancelOrder(userId, orderId);
        if (result.success) {
            return res.status(200).json({ result: true, message: result.message, order: result.order });
        } else {
            return res.status(400).json({ result: false, message: result.message });
        }
    } catch (error) {
        console.error('Failed to cancel order:', error.message);
        return res.status(500).json({ result: false, error: error.message });
    }
});




// http://localhost:3000/api/products/getAllVoucher
router.get('/getAllVoucher', async function (req, res, next) {
    try {
        const vouchers = await voucherContronller.getAllVoucher()
        return res.status(200).json({ result: true, vouchers })
    } catch (error) {
        return res.status(500).json({ result: false, vouchers: null })
    }
});

// http://localhost:3000/api/products/addFavorite
router.post('/addFavorite', async function (req, res, next) {
    try {
        const {userId, productId} = req.body
        const favorite = await favoriteController.addFavorite(userId, productId)
        return res.status(200).json({ result: true, favorite })
    } catch (error) {
        return res.status(500).json({ result: false, favorite: null })
    }
});

// http://localhost:3000/api/products/favorite/:id
router.get('/favorite/:userId', async function (req, res, next) {
    try { 
        const {userId} = req.params
        const favorite = await favoriteController.getFavoriteByUserId(userId)
        return res.status(200).json({ result: true, favorite })
    } catch (error) {
        return res.status(500).json({ result: false, favorite: null })
    }
});

// http://localhost:3000/api/products/removeFavorite
router.delete('/removeFavorite', async function (req, res, next) {
    try {
        const { userId, productId } = req.body;
        const removedFavorite = await favoriteController.removeFavorite(userId, productId);
        return res.status(200).json({ result: true, removedFavorite });
    } catch (error) {
        return res.status(500).json({ result: false, removedFavorite: null });
    }
});





module.exports = router;