import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { requireLogin, requireAdmin } from "@/lib/auth";
import Staff from "@/models/Staff";
import WaterPoint from "@/models/WaterPoint";
import WaterStatusReport from "@/models/WaterStatusReport";
import MaintenanceRequest from "@/models/MaintenanceRequest";
import { validateNewRequest } from "@/modules/maintenance/validateRequest";

// GET /api/maintenance/requests   (any logged-in staff member)
// Optional: ?status=Pending  (or In Progress / Completed)
//  - An ADMIN gets all requests.
//  - A STAFF member gets only the requests assigned to them.
export async function GET(request) {
  const { staff, error } = await requireLogin();
  if (error) return error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = {};
    if (status && status !== "All") {
      query.status = status;
    }

    // Staff (not admin) can only see their own requests
    if (staff.role !== "admin") {
      query.assignedToStaffId = staff.id;
    }

    const requests = await MaintenanceRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Get the water point details for all these requests
    const waterPointIds = requests.map((r) => r.waterPointId);
    const waterPoints = await WaterPoint.find({
      waterPointId: { $in: waterPointIds },
    }).lean();

    const data = requests.map((r) => {
      const waterPoint = waterPoints.find((wp) => wp.waterPointId === r.waterPointId);

      return {
        ...r,
        // The CURRENT status of the water point (so staff can verify it)
        waterPoint: waterPoint
          ? {
              name: waterPoint.name,
              building: waterPoint.building,
              floor: waterPoint.floor,
              availability: waterPoint.availability,
              cleanliness: waterPoint.cleanliness,
              temperature: waterPoint.temperature,
              isWorking: waterPoint.isWorking,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/maintenance/requests   (ADMIN ONLY)
// Creates a maintenance request from a student report and assigns it
// to a staff account.
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();

    const body = await request.json();

    // 1. Check the data
    const errors = validateNewRequest(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Please fix the errors in the form.", errors },
        { status: 400 }
      );
    }

    // 2. Make sure the student report exists
    if (!mongoose.isValidObjectId(body.statusReportId)) {
      return NextResponse.json(
        { success: false, message: "Invalid report ID." },
        { status: 400 }
      );
    }

    const report = await WaterStatusReport.findById(body.statusReportId);
    if (!report) {
      return NextResponse.json(
        { success: false, message: "Student report not found." },
        { status: 404 }
      );
    }

    // 3. Make sure the assigned person is a real, active staff account
    if (!mongoose.isValidObjectId(body.assignedToStaffId)) {
      return NextResponse.json(
        { success: false, message: "Invalid staff member." },
        { status: 400 }
      );
    }

    const assignee = await Staff.findById(body.assignedToStaffId);
    if (!assignee || !assignee.isActive) {
      return NextResponse.json(
        { success: false, message: "Please choose an active staff member." },
        { status: 400 }
      );
    }

    // 4. Do not allow a second request for the same report
    const existing = await MaintenanceRequest.findOne({
      statusReportId: body.statusReportId,
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "A maintenance request already exists for this report.",
        },
        { status: 409 }
      );
    }

    // 5. Save the request. The water point ID comes from the REPORT,
    //    and the staff name comes from the STAFF ACCOUNT, not from the browser.
    const newRequest = await MaintenanceRequest.create({
      statusReportId: report._id,
      waterPointId: report.waterPointId,
      issueDescription: body.issueDescription.trim(),
      priority: body.priority,
      assignedToStaffId: assignee._id,
      assignedTo: assignee.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Maintenance request created successfully!",
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    // Error 11000 = the database's unique rule caught a duplicate
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A maintenance request already exists for this report.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
