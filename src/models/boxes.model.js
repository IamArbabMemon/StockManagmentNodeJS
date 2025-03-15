import mongoose from 'mongoose';

const boxesSchema = new mongoose.Schema({
    gameName: {
        type: String,
        unique: true
    },

    productName: {
        type: String
    }

});

const boxesModel = mongoose.model("boxes", boxesSchema);
export {
    boxesModel
}
