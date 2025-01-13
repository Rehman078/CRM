import Stage from "../../models/Stage/stageModel.js";
import { httpResponse } from "../../utils//index.js";

const createStage = async (req, res) => {
  try {
    const { stage, pipline_id } = req.body;
    const { _id: userId, role } = req.user;

    const createStage = new Stage({
      stage,
      pipline_id,
      created_by: userId,
    });

    await createStage.save();
    return httpResponse.CREATED(res, createStage, "Stage Created Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

const getStage = async (req, res) => {
  try {
    const stages = await Stage.find()
    return httpResponse.SUCCESS(res, stages, "All Pipeline Stages");
  } catch (err) {
    console.error(err);
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

const updateStage = async (req, res) => {
  try {
    const id = req.params.id;
    const {  stage, pipline_id, } = req.body;
    const { _id: userId } = req.user;
    const updatestage = await Stage.findByIdAndUpdate(
      id,
      {  stage, pipline_id, updated_by: userId },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatestage)
      return httpResponse.NOT_FOUND(res, null, "stage not found");
    return httpResponse.SUCCESS(res, updatestage, "Stage updated successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

const deleteStage = async (req, res) => {
  try {
    const id = req.params.id;
    const deletestage = await Stage.findByIdAndDelete(id);
    if (!deletestage)
      return httpResponse.NOT_FOUND(res, null, "stage not found");
    return httpResponse.SUCCESS(res, deletestage, "Stage deleted Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};
export default {
  createStage,
  getStage,
  updateStage,
  deleteStage,
};
