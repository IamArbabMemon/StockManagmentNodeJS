// import { ErrorResponse } from "../utils/errorResponse.js";
// import { extraDetailsModel } from "../models/extraDetails.model.js";


// const addDetails = async (req, res, next) => {
//     try {

//         const { websiteName, price } = req.body;
//         console.log(req.body)
 
//         const details = await extraDetailsModel.create({ websiteName, price });

//         return res.status(200).json({ success: true, message: "details has been created", data: details });

//     } catch (error) {
//         next(error);
//     }
// }

// export {
//     addDetails
// }import { ErrorResponse } from "../utils/errorResponse.js";

import { extraDetailsModel } from "../models/extraDetails.model.js";

// Create
const addDetails = async (req, res, next) => {
    try {
        const { websiteName, price } = req.body;
        const details = await extraDetailsModel.create({ websiteName, price });
        return res.status(200).json({ success: true, message: "Details created", data: details });
    } catch (error) {
        next(error);
    }
};

// Read All
const getAllDetails = async (req, res, next) => {
    try {
        const details = await extraDetailsModel.find();
        return res.status(200).json({ success: true, data: details });
    } catch (error) {
        next(error);
    }
};

// Read Single
const getDetailById = async (req, res, next) => {
    try {
        const detail = await extraDetailsModel.findById(req.params.id);
        if (!detail)
        throw new ErrorResponse("Detail not found", 404);

        return res.status(200).json({ success: true, data: detail });
    } catch (error) {
        next(error);
    }
};

// Update
const updateDetail = async (req, res, next) => {
    try {
        const updatedDetail = await extraDetailsModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        );

        if (!updatedDetail) 
            throw new ErrorResponse("Detail not found", 404);
        
        return res.status(200).json({ success: true, message: "Detail updated", data: updatedDetail });
    } catch (error) {
        next(error);
    }
};

// Delete
const deleteDetail = async (req, res, next) => {
    try {
        const deleted = await extraDetailsModel.findByIdAndDelete(req.params.id);
        if (!deleted)
             throw new ErrorResponse("Detail not found", 404);
            
        return res.status(200).json({ success: true, message: "Detail deleted" });
    } catch (error) {
        next(error);
    }
};

export {
    addDetails,
    getAllDetails,
    getDetailById,
    updateDetail,
    deleteDetail
};
