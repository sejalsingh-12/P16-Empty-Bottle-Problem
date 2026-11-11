import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { requireLogin } from "@/lib/auth";
import Staff from "@/models/Staff";
import MaintenanceRequest from "@/models/MaintenanceRequest";
import { validateUpdate } from "@/modules/maintenance/validateRequest";

// PATCH /api/maintenance/requests/<request id>   (any logged-in staff member)
//  - An ADMIN can change status, note, priority and assigned staff of ANY request.
//  - A STAFF member can change ONLY the status and note of THEIR OWN requests.
// NOTE: this route never touches the WaterPoint. Water point status is
// verified separately through a new status report (Module 2).
export async function PATCH(request, { params }) {
  const { staff, error } = await requireLogin();
  if (error) return error;

  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid request ID." },
        { status: 400 }
      );
    }

    const maintenanceRequest = await MaintenanceRequest.findById(id);
    if (!maintenanceRequest) {
      return NextResponse.json(
        { success: false, message: "Maintenance request not found." },
        { status: 404 }
      );
    }

    const isAdmin = staff.role === "admin";

    // Staff may only touch requests assigned to THEM
    if (!isAdmin && String(maintenanceRequest.assignedToStaffId) !== staff.id) {
      return NextResponse.json(
        { success: false, message: "You can only update requests assigned to you." },
        { status: 403 }
      );
    }

    // A completed request is read-only
    if (maintenanceRequest.status === "Completed") {
      return NextResponse.json(
        { success: false, message: "This request is already completed and cannot be changed." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const errors = validateUpdate(body, isAdmin);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Please fix the errors in the form.", errors },
        { status: 400 }
      );
    }

    // Everyone can change the status and the note
    maintenanceRequest.status = body.status;
    maintenanceRequest.maintenanceNote = (body.maintenanceNote || "").trim();

    // Only an admin can change the priority and the assigned staff.
    // (If a normal staff member sends these fields, they are simply ignored.)
    if (isAdmin) {
      if (!mongoose.isValidObjectId(body.assignedToStaffId)) {
        return NextResponse.json(
          { success: false, message: "Invalid staff member." },
          { status: 400 }
        );
      }

      // Only look up the staff account if the assignee actually changed
      if (String(maintenanceRequest.assignedToStaffId) !== String(body.assignedToStaffId)) {
        const assignee = await Staff.findById(body.assignedToStaffId);
        if (!assignee || !assignee.isActive) {
          return NextResponse.json(
            { success: false, message: "Please choose an active staff member." },
            { status: 400 }
          );
        }
        maintenanceRequest.assignedToStaffId = assignee._id;
        maintenanceRequest.assignedTo = assignee.name;
      }

      maintenanceRequest.priority = body.priority;
    }

    // Save the completion date when the task is marked Completed
    if (body.status === "Completed") {
      maintenanceRequest.completedAt = new Date();
    }

    await maintenanceRequest.save();

    return NextResponse.json({
      success: true,
      message: "Maintenance request updated successfully!",
      data: maintenanceRequest,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
