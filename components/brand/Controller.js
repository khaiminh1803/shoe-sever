const brandService = require('./Service')

const getAllBrands = async () => {
    try {
        return brandService.getAllBrands()
    } catch (error) {
        throw error
    }
}

module.exports = {getAllBrands}