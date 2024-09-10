
const brandModel = require('./Model')

const getAllBrands = async () => {
    try {
        // return data 
        // select * from categories
        return await brandModel.find()
    } catch (error) {
        console.log(error);
    }
}

module.exports = {getAllBrands}
