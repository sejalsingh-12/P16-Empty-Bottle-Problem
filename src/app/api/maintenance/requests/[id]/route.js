import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import MaintenanceRequest from "@/models/MaintenanceRequest";
import { validateUpdate } from "@/modules/maintenance/validateRequest";

// PATCH /api/maintenance/requests/<request id>
// Updates the status, assigned staff, priority and note of ONE request.
// NOTE: this route never touches the WaterPoint. Water point status is
// verified separately through a new student/staff report (Module 2).
export async function PATCH(request, { params }) {
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

    // A completed request is read-only
    if (maintenanceRequest.status === "Completed") {
      return NextResponse.json(
        { success: false, message: "This request is already completed and cannot be changed." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const errors = validateUpdate(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Please fix the errors in the form.", errors },
        { status: 400 }
      );
    }

    maintenanceRequest.status = body.status;
    maintenanceRequest.priority = body.priority;
    maintenanceRequest.assignedTo = body.assignedTo.trim();
    maintenanceRequest.maintenanceNote = (body.maintenanceNote || "").trim();

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
