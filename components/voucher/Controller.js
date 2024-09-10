const voucherModel = require('./Model')

const getAllVoucher = async () => {
    try {
        // return data
        // select * from products
        return await voucherModel.find()
    } catch (error) {
        console.log('Get all voucher error: ', error);
        throw error;
    }
}

module.exports = {getAllVoucher}