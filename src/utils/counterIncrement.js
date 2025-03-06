import { extraModel } from "../models/extra.model.js";
const getNextSequence = async (collectionName) => {
    const counter = await extraModel.findOneAndUpdate(
        { collectionName },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true, returnDocument: "after" }
    );
    return counter.sequenceValue;
};


export {
    getNextSequence
}
