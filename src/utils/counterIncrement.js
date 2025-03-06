const getNextSequence = async (collectionName) => {
    const counter = await Counter.findOneAndUpdate(
        { collectionName },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true, returnDocument: "after" }
    );
    return counter.sequenceValue;
};


export {
    getNextSequence
}
