const productModel = require('./Model')
const categoryModel = require('../category/Model')
const brandModel = require('../brand/Model')
// lấy danh sách sản phẩm từ database
const getAllProducts = async () => {
    try {
        // return data
        // select * from products
        return await productModel.find().populate('category', 'name').populate('brand', 'name')
    } catch (error) {
        console.log('Get all products error: ', error);
        throw error;
    }
}

const getProductById = async (id) => {
    try {
        return productModel.findById(id).populate('brand', 'name').populate('category', 'name')
    } catch (error) {
        console.log('Get product by id error', error);
        return null
    }
}

const searchProduct = async (keyword) => {
    try {
        let query = {
            // gt: greater than, lt: less than
            name: { $regex: keyword, $options: 'i' },
        }
        let products = await productModel.find(query).populate('brand', 'name').populate('category', 'name')
        return products
    } catch (error) {
        console.log('Search product error', error);
    }
    return null
}



// thêm mới sản phẩm
const addProduct = async (name, price, description, image, sizes, brand, category) => {
    try {
        const newProduct = new productModel({
            name,
            price,
            description,
            image,
            sizes,
            brand,
            category
        });
        await newProduct.save();
        return true;
    } catch (error) {
        console.log('Add new product failed', error);
        return false;
    }
};

// xóa sản phẩm theo id
const deleteProductById = async (id) => {
    try {
        await productModel.findByIdAndDelete(id)
        return true
    }
    catch (error) {
        console.log('Delete product error: ', error);
        throw error;
    }
    return false;
}

// update sản phẩm
const updateProduct = async (id, name, price, description, image, sizes, brand, category) => {
    try {
        const item = await productModel.findById(id)
        if (item) {
            item.name = name !== undefined ? name : item.name;
            item.price = price !== undefined ? price : item.price;
            item.description = description !== undefined ? description : item.description;
            item.image = image.length > 0 ? image : item.image;
            item.sizes = sizes.length > 0 ? sizes : item.sizes;
            item.brand = brand !== undefined ? brand : item.brand;
            item.category = category !== undefined ? category : item.category;

            // item.name = name ? name : item.name
            // item.price = price ? price : item.price
            // item.description = description ? description : item.description
            // item.image = image ? image : item.image
            // item.sizes = sizes ? sizes : item.sizes
            // item.brand = brand ? brand : item.brand
            // item.category = category ? category : item.category
            await item.save()
            return true
        }
    } catch (error) {
        console.log('Update product error: ', error);
    }
    return false
}

//lọc sản phẩm
const filterProduct = async (categoryName, size, min, max) => {
    try {
        const category = await categoryModel.findOne({ name: { $regex: categoryName, $options: 'i' } });
        let query = {
            price: { $gte: min, $lte: max },
            // "sizes.size": { $in: size },
            "sizes.size": size,
            category: category._id
        }
        let products = await productModel.find(query).populate('category')
        return products
    } catch (error) {
        console.log('Filter product error', error);
    }
    return null
}

const getProductsByBrand = async (brandName) => {
    try {
        const brand = await brandModel.findOne({ name: { $regex: brandName, $options: 'i' } });
        if (!brand) {
            return null; // Trả về null nếu không tìm thấy thương hiệu
        }
        let query = {
            brand: brand._id
        }
        let products = await productModel.find(query).populate('brand').populate('category');
        return products.length > 0 ? products : null; // Trả về null nếu không tìm thấy sản phẩm
    } catch (error) {
        console.log('Filter by brand error', error);
        return null;
    }
}

module.exports = { getAllProducts, getProductById, searchProduct, addProduct, deleteProductById, updateProduct, filterProduct, getProductsByBrand }