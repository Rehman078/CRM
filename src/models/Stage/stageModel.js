import mongoose from "mongoose";

const stageSchema = mongoose.Schema({
    stage:{type:String, required:true},
    pipline_id:{type: mongoose.Schema.Types.ObjectId, ref: 'Pipline', required:true},
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

const Stage = mongoose.model("Stage", stageSchema);
export default Stage;