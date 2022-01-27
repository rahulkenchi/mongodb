const mongoose = require('mongoose')
const invoiceSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    receiverAddress: {
        type: String,
        required: true
    },
    invoiceDate: {
        type: String,
        required: true
    },
    dueDate: {
        type: String,
        required: true
    },
    products: {
        type: Array,
        required: true,
    },
    amount: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    invoice: {
        type: Date,
        default: Date.now
    },
    invoiceNumber: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("invoice", invoiceSchema)