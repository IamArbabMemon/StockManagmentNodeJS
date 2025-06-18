import mongoose from 'mongoose';

const extraSchema = new mongoose.Schema({
    collectionName: { type: String, required: true, unique: true },
    sequenceValue: { type: Number, default: 0, required: true },
    usdCurrentRate: { type: Number, default: 279.80 },
});

const extraModel = mongoose.model("extra", extraSchema);
export {
    extraModel
}
