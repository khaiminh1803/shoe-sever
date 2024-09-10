var express = require('express');
var router = express.Router();
const productController = require('../../components/product/Controller')
const categoryController = require('../../components/category/Controller')
const brandController = require('../../components/brand/Controller')
const orderController = require('../../components/order/Controller')
const uploadFile = require('../../middle/UploadFile')
const CONFIG = require('../../config/Config')

// http://localhost:3000/cpanel/products
// http://localhost:3000/cpanel/products
// hiển thị trang danh sách sản phẩm 
router.get('/', async function (req, res, next) {
    try {
        const products = await productController.getAllProducts();
        res.render('product/listProduct', { products })
    } catch (error) {

    }
});


// http://localhost:3000/cpanel/products/new
// hiển thị trang thêm mới sản phẩm
router.get('/new', async (req, res, next) => {
    try {
        const categories = await categoryController.getAllCategories();
        const brands = await brandController.getAllBrands();
        res.render('product/addProduct', { categories, brands })
    } catch (error) {
        next(error);
    }
})

// http://localhost:3000/cpanel/products/new
// xử lý trang thêm mới sản phẩm
router.post('/new', uploadFile.array('image', 10), async (req, res, next) => {
    try {
        let { name, price, description, brand, category } = req.body;
        console.log(req.files);

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `${CONFIG.CONSTANTS.IP}images/${file.filename}`);
        }

        let sizes = [];
        if (req.body['sizes.size'] && req.body['sizes.quantity']) {
            if (Array.isArray(req.body['sizes.size']) && Array.isArray(req.body['sizes.quantity'])) {
                sizes = req.body['sizes.size'].map((size, index) => ({
                    size: size,
                    quantity: req.body['sizes.quantity'][index]
                }));
            } else {
                sizes.push({
                    size: req.body['sizes.size'],
                    quantity: req.body['sizes.quantity']
                });
            }
        }
        await productController.addProduct(name, price, description, images, sizes, brand, category);
        return res.redirect('/cpanel/products');
    } catch (error) {
        console.log('Add new product error', error);
        next(error);
    }
})

// xóa sản phẩm theo id
// http://localhost:3000/cpanel/products/:id/delete
router.get('/:id/delete', async function (req, res, next) {
    try {
        const { id } = req.params
        const result = await productController.deleteProductById(id)
        return res.json({ result })
    } catch (error) {
        return res.json({ result: false })
    }
});

// http://localhost:3000/cpanel/products/:id/edit
// hiển thị trang cập nhật sản phẩm
router.get('/:id/edit', async (req, res, next) => {
    try {
        const { id } = req.params
        const product = await productController.getProductById(id)
        let brands = await brandController.getAllBrands()
        let categories = await categoryController.getAllCategories();
        for (let index = 0; index < categories.length; index++) {
            const element = categories[index]
            categories[index].selected = false
            if (element._id.toString() == product.category._id.toString()) {
                categories[index].selected = true
            }
        }

        for (let index = 0; index < brands.length; index++) {
            const element = brands[index]
            brands[index].selected = false
            if (element._id.toString() == product.brand._id.toString()) {
                brands[index].selected = true
            }
        }
        res.render('product/editProduct', { product, categories, brands })
    } catch (error) {
        next(error);
    }
})

router.post('/:id/edit', uploadFile.array('image', 10), async (req, res, next) => {
    try {
        let { name, price, description, brand, category } = req.body;
        let { id } = req.params

        // Existing images from the form
        // let images = req.body.existingImages || [];
        const products = await productController.getProductById(id);
        let images = products.image;


        if (!Array.isArray(images)) {
            images = [images];
        }

        // Handle removed images
        if (req.body.removeImages) {
            let removeImages = req.body.removeImages;
            if (!Array.isArray(removeImages)) {
                removeImages = [removeImages];
            }
            images = images.filter(image => !removeImages.includes(image));
        }

        // Handle new uploaded images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `${CONFIG.CONSTANTS.IP}images/${file.filename}`);
            images = images.concat(newImages);
        }

        let sizes = [];
        if (req.body['sizes.size'] && req.body['sizes.quantity']) {
            if (Array.isArray(req.body['sizes.size']) && Array.isArray(req.body['sizes.quantity'])) {
                sizes = req.body['sizes.size'].map((size, index) => ({
                    size: size,
                    quantity: req.body['sizes.quantity'][index]
                }));
            } else {
                sizes.push({
                    size: req.body['sizes.size'],
                    quantity: req.body['sizes.quantity']
                });
            }
        }

        await productController.updateProduct(id, name, price, description, images, sizes, brand, category);
        return res.redirect('/cpanel/products');
    } catch (error) {
        console.log('Edit product error', error);
        next(error);
    }
});

// http://localhost:3000/cpanel/products
// hiển thị trang danh sách sản phẩm 
router.get('/statistic', async function (req, res, next) {
    try {
        const stats = await orderController.getStatistics();
        res.render('product/statistic', {stats})
    } catch (error) {
        res.status(500).send('Error fetching statistics');
    }
});

// http://localhost:3000/cpanel/products/bill
router.get('/bill', async function (req, res, next) {
    try {
        const status = req.query.status;
        let orders;
        if (status && status !== 'all') {
            orders = await orderController.getOrdersByStatus(status);
        } else {
            orders = await orderController.getAllOrder();
        }
        res.render('product/bill', { orders, selectedStatus: status });
    } catch (error) {
        console.error('Failed to retrieve orders:', error.message);
        next(error);
    }
});




// http://localhost:3000/cpanel/products/:id/editBill
// hiển thị trang cập nhật hóa đơn
router.get('/:id/editBill', async (req, res, next) => {
    try {
        const { id } = req.params
        const order = await orderController.getOrderById(id)
        const status = [
            { value: 'pending', selected: order.status === 'pending' },
            { value: 'confirmed', selected: order.status === 'confirmed' },
            { value: 'shipped',selected: order.status === 'shipped' },
            { value: 'delivered',selected: order.status === 'delivered' },
            { value: 'cancelled',selected: order.status === 'cancelled' },
            { value: 'refused',selected: order.status === 'refused' },
        ];
        res.render('product/editBill', { order, status})
    } catch (error) {
        next(error);
    }
})

// xử lý trang cập nhật hóa đơn
router.post('/:id/editBill', async (req, res, next) => {
    try {
        let { id } = req.params;
        let { phoneNumber, shippingAddress, status } = req.body;
        console.log('>>>> Edit params: ', phoneNumber, shippingAddress, status);
        
        const updateSuccess = await orderController.updateOrder(id, phoneNumber, shippingAddress, status);
        if (updateSuccess) {
            return res.redirect('/cpanel/products/bill');
        } else {
            return res.status(500).send('Update failed');
        }
    } catch (error) {
        console.log('Update order error', error);
        next(error);
    }
});

module.exports = router;