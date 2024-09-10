const orderModel = require('./Model')
const cartModel = require('../cart/Model')
const productModel = require('../product/Model')

const createOrder = async (userId, email, phonenumber, shippingAddress, selectedItems, paymentMethod, totalPrice, voucherId) => {
    try {
        const order = await orderModel.create({
            userId: userId,
            email,
            phoneNumber: phonenumber,
            shippingAddress,
            items: selectedItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                sizeSelected: item.sizeSelected,
            })),
            totalPrice,
            paymentMethod: paymentMethod,
            status: 'pending',
            voucherId: voucherId,
            orderDate: new Date(),
        });
        for (const item of selectedItems) {
            const product = await productModel.findById(item.product._id);
            const sizeIndex = product.sizes.findIndex(size => size.size === item.sizeSelected);
            if (sizeIndex !== -1) {
                product.sizes[sizeIndex].quantity -= item.quantity;
                await product.save();
            } else {
                console.error(`Kích cỡ ${item.sizeSelected} không tồn tại cho sản phẩm ${item.product._id}`);
            }
        }
        await cartModel.findOneAndDelete({ userId });
        return order.populate('items.product', 'price image name');;
    } catch (error) {
        console.error('Lỗi khi tạo hóa đơn:', error.message);
        throw error;
    }
}
const getAllOrder = async () => {
    try {
        const orders = orderModel.find().populate('items.product', 'price image name');
        return orders
    } catch (error) {
        console.error('Get all order failed:', error.message);
        throw error;
    }
}
const getAllOrderById = async (userId) => {
    try {
        const orders = await orderModel.find({ userId: userId }).populate('items.product', 'price image name');
        return orders
    } catch (error) {
        console.error('Get order user failed:', error.message);
        throw error;
    }
}

const getOrderById = async (id) => {
    try {
        const order = await orderModel.findById(id).populate('items.product', 'price image name');
        return order
    } catch (error) {
        console.error('Get order failed:', error.message);
        throw error;
    }
}

// update sản phẩm
const updateOrder = async (id, phoneNumber, shippingAddress, status) => {
    try {
        const item = await orderModel.findById(id)
        if (item) {
            item.phoneNumber = phoneNumber !== undefined ? phoneNumber : item.phoneNumber;
            item.shippingAddress = shippingAddress !== undefined ? shippingAddress : item.shippingAddress;
            item.status = status !== undefined ? status : item.status;
            await item.save()
            return true
        }
    } catch (error) {
        console.log('Update order error: ', error);
    }
    return false
}

const getStatistics = async () => {
    try {
        const orders = await orderModel.find().populate('items.product', 'price');
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const totalOrders = orders.length;
        const monthlyRevenue = orders.reduce((acc, order) => {
            const month = new Date(order.orderDate).getMonth();
            acc[month] = (acc[month] || 0) + order.totalPrice;
            return acc;
        }, {});

        return { totalRevenue, totalOrders, monthlyRevenue };
    } catch (error) {
        console.error('Failed to get statistics:', error.message);
        throw error;
    }
};

const getOrdersByStatus = async (status) => {
    try {
        const orders = await orderModel.find({ status }).populate('items.product', 'price image name');
        return orders;
    } catch (error) {
        console.error('Failed to get orders by status:', error.message);
        throw error;
    }
}

const cancelOrder = async (userId, orderId) => {
    try {
        const order = await orderModel.findOne({ _id: orderId, userId: userId });
        if (!order) {
            return { success: false, message: 'Order not found.' };
        }

        if (order.status !== 'pending') {
            return { success: false, message: 'Only pending orders can be cancelled.' };
        }

        order.status = 'cancelled';
        await order.save();

        return { success: true, message: 'Order has been cancelled successfully.', order };
    } catch (error) {
        console.error('Failed to cancel order:', error.message);
        throw error;
    }
}


module.exports = { createOrder, getAllOrder, getAllOrderById, getOrderById, getStatistics, updateOrder, getOrdersByStatus, cancelOrder }