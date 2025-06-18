import mongoose from "mongoose";

const extraDetailsSchema = new mongoose.Schema({
  websiteName: { type: String, unique: true, required: true },
  price: { type: Number, required: true },
});

const extraDetailsModel = mongoose.model("extraDetails", extraDetailsSchema);
export { extraDetailsModel };
