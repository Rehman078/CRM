import Stage from "../../models/Stage/stageModel.js";
import Opportunity from "../../models/Opportunity/opportunityModel.js";
import Pipline from "../../models/Pipline/piplineModel.js";
import sendMail from "../../nodemailer/nodemailerIntegration.js";
import { opportunityStageUpdateEmailTemplate } from "../../nodemailer/emailTemplate.js";
import { httpResponse } from "../../utils//index.js";
import mongoose from "mongoose";

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
    const stages = await Stage.find().populate("pipline_id", "name");
    return httpResponse.SUCCESS(res, stages, "All Pipeline Stages");
  } catch (err) {
    console.error(err);
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

const getStageByPiplineId  = async (req, res) => {
  try {
    const { pipline_id } = req.query; 

    if (!pipline_id) {
      return httpResponse.BAD_REQUEST(res, null, "Pipline ID is required.");
    }

    const stages = await Stage.find({ pipline_id }).populate("pipline_id", "name");

    if (!stages.length) {
      return httpResponse.NOT_FOUND(res, null, "No stages found for this pipline.");
    }

    return httpResponse.SUCCESS(res, stages, "Stages of Pipline fetched successfully.");
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const updateStage = async (req, res) => {
  try {
    const id = req.params.id;
    const { stage, pipline_id } = req.body;
    const { _id: userId } = req.user;

    // Update the stage
    const updatestage = await Stage.findByIdAndUpdate(
      id,
      { stage, pipline_id, updated_by: userId },
      { new: true, runValidators: true }
    );

    if (!updatestage) {
      return httpResponse.NOT_FOUND(res, null, "Stage not found");
    }

    // Retrieve related opportunities in parallel
    const opportunitiesPromise = Opportunity.find({
      pipelineId: pipline_id,
    }).populate("created_by", "email name");

    // Get the stage details once to avoid redundant queries in loop
    const stageFromPipeline = await Stage.findOne({
      pipline_id,
      stage,
    });

    const opportunities = await opportunitiesPromise;

    // Send email notifications in parallel using Promise.all
    const emailPromises = opportunities.map(async (opportunity) => {
      if (opportunity.created_by?.email) {
        await sendMail(
          opportunity.created_by.email,
          "Opportunity Stage Updated",
          opportunityStageUpdateEmailTemplate(
            opportunity.created_by.name,
            opportunity.name,
            stageFromPipeline.stage
          )
        );
      }
    });

    await Promise.all(emailPromises);

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
  getStageByPiplineId,
  updateStage,
  deleteStage,

};
