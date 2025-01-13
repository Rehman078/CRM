import Contact from "../../models/Contact/contactModel.js";
import ContactAsignment from "../../models/Contact/assignContactModel.js";
import { httpResponse } from "../index.js";

export const fetchContactsByRole = async (role, userId, res) => {
  try {
    let contactPipeline = [];

    if (role === "Admin" || role === "Manager") {
      // Pipeline for Admin and Manager
      contactPipeline = [
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "created_by_details",
          },
        },
        {
          $unwind: {
            path: "$created_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updated_by",
            foreignField: "_id",
            as: "updated_by_details",
          },
        },
        {
          $unwind: {
            path: "$updated_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "contactasignments",
            localField: "_id",
            foreignField: "contact_id",
            as: "assignments",
          },
        },
        { $unwind: { path: "$assignments", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "assignments.salerep_id",
            foreignField: "_id",
            as: "assignments.salerep_details",
          },
        },
        {
          $unwind: {
            path: "$assignments.salerep_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            phone: 1,
            created_by: {
              id: "$created_by_details._id",
              name: "$created_by_details.name",
              email: "$created_by_details.email",
            },
            updated_by: {
              $cond: {
                if: {
                  $and: [
                    "$updated_by_details._id",
                    "$updated_by_details.name",
                    "$updated_by_details.email",
                  ],
                },
                then: {
                  id: "$updated_by_details._id",
                  name: "$updated_by_details.name",
                  email: "$updated_by_details.email",
                },
                else: "$$REMOVE", // Removes the field entirely if no data
              },
            },
            assigned_to: {
              $cond: {
                if: {
                  $and: [
                    "$assignments.salerep_details._id",
                    "$assignments.salerep_details.name",
                    "$assignments.salerep_details.email",
                  ],
                },
                then: {
                  id: "$assignments.salerep_details._id",
                  name: "$assignments.salerep_details.name",
                  email: "$assignments.salerep_details.email",
                },
                else: "$$REMOVE", // Removes the field entirely if no data
              },
            },
          },
        },
      ];
    } else if (role === "SalesRep") {
      // Pipeline for SalesRep
      contactPipeline = [
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "created_by_details",
          },
        },
        {
          $unwind: {
            path: "$created_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updated_by",
            foreignField: "_id",
            as: "updated_by_details",
          },
        },
        {
          $unwind: {
            path: "$updated_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "contactasignments",
            localField: "_id",
            foreignField: "contact_id",
            as: "assignments",
          },
        },
        { $unwind: { path: "$assignments", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [{ "assignments.salerep_id": userId }, { created_by: userId }],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignments.salerep_id",
            foreignField: "_id",
            as: "assignments.salerep_details",
          },
        },
        {
          $unwind: {
            path: "$assignments.salerep_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            phone: 1,
            created_by: {
              id: "$created_by_details._id",
              name: "$created_by_details.name",
              email: "$created_by_details.email",
            },
            updated_by: {
              $cond: {
                if: {
                  $and: [
                    "$updated_by_details._id",
                    "$updated_by_details.name",
                    "$updated_by_details.email",
                  ],
                },
                then: {
                  id: "$updated_by_details._id",
                  name: "$updated_by_details.name",
                  email: "$updated_by_details.email",
                },
                else: "$$REMOVE", // Removes the field entirely if no data
              },
            },
            assigned_to: {
              $cond: {
                if: {
                  $and: [
                    "$assignments.salerep_details._id",
                    "$assignments.salerep_details.name",
                    "$assignments.salerep_details.email",
                  ],
                },
                then: {
                  id: "$assignments.salerep_details._id",
                  name: "$assignments.salerep_details.name",
                  email: "$assignments.salerep_details.email",
                },
                else: "$$REMOVE",
              },
            },
          },
        },
      ];
    } else {
      return httpResponse.UNAUTHORIZED(
        res,
        null,
        "Not authorized to view contacts"
      );
    }

    const contacts = await Contact.aggregate(contactPipeline);

    if (!contacts || contacts.length === 0) {
      const message =
        role === "SalesRep"
          ? "No contacts found for the sales representative"
          : "No contacts found";
      return httpResponse.NOT_FOUND(res, null, message);
    }

    return httpResponse.SUCCESS(
      res,
      contacts,
      "Contacts retrieved successfully"
    );
  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};

export const updateContactByRole = async (
  contactId,
  updatedData,
  userId,
  role,
  salerep_Ids,
  res
) => {
  try {
    let contact;
    if (role === "Admin" || role === "Manager") {
      contact = await Contact.findByIdAndUpdate(contactId, updatedData, {
        new: true,
        runValidators: true,
      });
      if (!contact) {
        return httpResponse.NOT_FOUND(res, null, "Contact not found");
      }
      if (salerep_Ids && Array.isArray(salerep_Ids)) {
        await ContactAsignment.deleteMany({ contact_id: contactId });

        const assignments = salerep_Ids.map((salerepId) => ({
          contact_id: contactId,
          salerep_id: salerepId,
          assigned_by: userId,
        }));
        await ContactAsignment.insertMany(assignments);
      }
      return httpResponse.SUCCESS(res, contact, "Contact updated successfully");
    }
    if (role === "SalesRep") {
      contact = await Contact.findOne({ _id: contactId, created_by: userId });
      contact = await ContactAsignment.findOne({
        contact_id: contactId,
        salerep_id: userId,
      });
      if (!contact) {
        return httpResponse.NOT_FOUND(
          res,
          null,
          "You are not authorized to update this contact"
        );
      }
      contact = await Contact.findByIdAndUpdate(contactId, updatedData, {
        new: true,
        runValidators: true,
      });

      return httpResponse.SUCCESS(res, contact, "Contact updated successfully");
    }
  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};

export const deleteContactByRole = async (contactId, userId, role, res) => {
  let contact;

  if (role === "Admin" || role === "Manager") {
    await ContactAsignment.deleteMany({ contact_id: contactId });
    contact = await Contact.findByIdAndDelete(contactId);
    if (!contact) {
      return httpResponse.NOT_FOUND(res, null, "contact not found");
    }
    return httpResponse.SUCCESS(res, null, "contact deleted successfully");
  }

  if (role === "SalesRep") {
    contact = await Contact.findById(contactId);
    if (!contact) {
      return httpResponse.NOT_FOUND(res, null, "contact not found");
    }

    if (contact.created_by.toString() !== userId.toString()) {
      return httpResponse.UNAUTHORIZED(
        res,
        null,
        "You can only delete contacts you created"
      );
    }

    await Contact.findByIdAndDelete(contactId);
    return httpResponse.SUCCESS(res, null, "contact deleted successfully");
  }

  // Unauthorized roles
  return httpResponse.UNAUTHORIZED(
    res,
    null,
    "You are not authorized to delete this contact"
  );
};
