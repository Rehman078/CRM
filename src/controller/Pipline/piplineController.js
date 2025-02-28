
import Pipline from "../../models/Pipline/piplineModel.js";
import Stage from "../../models/Stage/stageModel.js";
import Opportunity from "../../models/Opportunity/opportunityModel.js";
import { httpResponse } from "../../utils/index.js";

const createPipline = async (req, res) => {
  try {
    const { name } = req.body;
    const {_id:userId, role} = req.user
    const existingPipeline = await Pipline.findOne({ name });
    if (existingPipeline) {
      return res
        .status(409)
        .json({ message: "Pipeline with this name already exists." });
    }
    const pipeline = new Pipline({ name, created_by:userId });
    await pipeline.save();
    return httpResponse.CREATED(res, pipeline, "Pipline Created Succssfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

const getAllPipline = async (req, res) => {
  try {
    const piplines = await Pipline.find().populate("created_by", "name email role")
    return httpResponse.SUCCESS(res, piplines, "All pipline get successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

const updatePipline = async(req, res) => {
    try{
        const id = req.params.id;
        const {name,  stage_id} =req.body;
        const {_id:userId } = req.user

        const pipline = await Pipline.findByIdAndUpdate(id, {name,  stage_id, updated_by:userId}, {
            new: true,
            runValidators: true,
          });

          if (!pipline) {
            return httpResponse.NOT_FOUND(res, "Pipeline not found.");
          }
          return httpResponse.SUCCESS(res, pipline, "Pipline updated successfully")
    }catch(err){
       return httpResponse.BAD_REQUEST(res, err.message)
    }
}

const deletePipline = async(req, res) => {
    try{
       
        const id = req.params.id;
        const deletePipline = await Pipline.findByIdAndDelete(id)
        if(!deletePipline) {
          return httpResponse.NOT_FOUND(res, "Pipeline not found.");
        }
        await Stage.deleteMany({ pipline_id: id });
        await Opportunity.deleteMany({pipelineId:id})
        return httpResponse.SUCCESS(res, deletePipline, "Pipeline deleted successfully");
    
    }catch(err){
return httpResponse.BAD_REQUEST(res, err.message)
    }
}
export default {
  createPipline,
  getAllPipline,
  updatePipline,
  deletePipline
};
