import mongoose from 'mongoose';

const boxesSchema = new mongoose.Schema({
    gameName: {
        type: String,
    },

    productName: {
        type: String
    }

});

const boxesModel = mongoose.model("boxes", boxesSchema);
export {
    boxesModel
}
