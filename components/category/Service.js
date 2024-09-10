
const categoryModel = require('./Model')

const getAllCategories = async () => {
    try {
        // return data 
        // select * from categories
        return await categoryModel.find()
    } catch (error) {
        console.log(error);
    }
}

module.exports = {getAllCategories}
