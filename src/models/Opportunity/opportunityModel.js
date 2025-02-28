import mongoose from "mongoose";

const OpportunitySchema = new mongoose.Schema(
  {
    name: {type:String, required:true},
    expected_revenue: { type: Number, required: true },
    close_date: { type: Date, required: true }, 
    pipelineId: { type: mongoose.Schema.Types.ObjectId, ref: "Pipline", required: true }, 
    stageId: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", required: true },
    type: { type:String, enum: ["Contact", "Lead", "Activity"], required: true},
    assignedTo:{type: mongoose.Schema.Types.ObjectId, required: true},
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default:null},
  },
  { timestamps: true }
);

const Opportunity = mongoose.model("Opportunity", OpportunitySchema);
export default Opportunity;
