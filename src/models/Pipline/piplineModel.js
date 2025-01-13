
import mongoose from "mongoose";

const piplineSchema = mongoose.Schema({
    name:{type:String, required:true},
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true }
)

const Pipline = mongoose.model("Pipline", piplineSchema);

export default Pipline;