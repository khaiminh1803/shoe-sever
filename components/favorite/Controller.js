const favoriteModel = require('./Model')
const userModel = require('../user/Model')
const productModel = require('../product/Model')

const getFavoriteByUserId = async (userId) => {
    try {
        const favorites = favoriteModel.find({ userId: userId }).populate('productId')
        return await favorites
    } catch (error) {
        console.log('Get favorites error: ', error);
        throw error;
    }
}

const addFavorite = async (userId, productId) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            console.log('User not found');
            return
        }
        const product = await productModel.findById(productId);
        if (!product) {
            console.log('Product not found');
            return
        }
        const existingFavorite = await favoriteModel.findOne({ userId, productId });
        if (existingFavorite) {
            console.log('Product has been added');
            return
        }
        const favorite = await favoriteModel.create({
            userId,
            productId
        });

        // Populating dữ liệu
        return await favorite.populate('productId');

    } catch (error) {
        console.log('Add favorite error: ', error);
        throw error;
    }
}

const removeFavorite = async (userId, productId) => {
    try {
        const favorite = await favoriteModel.findOneAndDelete({ userId, productId });
        if (!favorite) {
            throw new Error('Favorite not found');
        }
        return favorite; // Có thể trả về thông tin sản phẩm đã bị xóa
    } catch (error) {
        console.log('Remove favorite error: ', error);
        throw error;
    }
};

module.exports = { getFavoriteByUserId, addFavorite, removeFavorite };