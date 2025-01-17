import {
  createOpportunityByRole,
  getOpportunityByRole,
  updateOpportunityByRole,
  deleteOpportunityByRole,
} from "../../utils/Opportunity/opptunityHelper.js";
import { httpResponse } from "../../utils/index.js";
import moment from 'moment';

const createOpportunity = async (req, res) => {
  try {
    const { name, expected_revenue, close_date, pipelineId, type, assignedTo } =
      req.body;
    const { _id: userId, role } = req.user;

    // Convert close_date from DD-MM-YYYY to a valid Date format
    const parsedDate = moment(close_date, 'DD-MM-YYYY', true);

    if (!parsedDate.isValid()) {
      return httpResponse.BAD_REQUEST(res, 'Invalid date format for close_date. Use DD-MM-YYYY.');
    }

    const opportunityData = {
      name,
      expected_revenue,
      close_date: parsedDate.toDate(), // Use parsed date
      pipelineId,
      type,
      assignedTo,
    };

    const opportunity = await createOpportunityByRole(userId, role, opportunityData);

    return httpResponse.CREATED(res, opportunity, "Opportunity created successfully");
  } catch (err) {
    console.error(err);
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};


const getOpportunity = async (req, res) => {
  try {
    const { type, assignedTo } = req.query;
    const { _id: userId, role } = req.user;

    if (!type || !assignedTo) {
      return httpResponse.BAD_REQUEST(res, null, "Please add type assignedTo");
    }
    const opportunities = await getOpportunityByRole(
      userId,
      role,
      type,
      assignedTo
    );
    if (!opportunities || opportunities.length === 0) {
      return httpResponse.NOT_FOUND(res, null, "No opportunities found");
    }
    return httpResponse.SUCCESS(
      res,
      opportunities,
      "opportunity retrived Successfully"
    );
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

const updateOpportunity = async (req, res) => {
  const id = req.params.id;
  const { name, expected_revenue, close_date, pipelineId, type, assignedTo } =
    req.body;
  const { _id: userId, role } = req.user;

  const updatedData = {
    name,
    name,
    expected_revenue,
    close_date,
    pipelineId,
    type,
    assignedTo,
    updated_by: userId,
  };
  try {
    return await updateOpportunityByRole(id, updatedData, userId, role, res);
  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    const id = req.params.id;
    const { _id: userId, role } = req.user;

    await deleteOpportunityByRole(id, userId, role, res);
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

export default {
  createOpportunity,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
