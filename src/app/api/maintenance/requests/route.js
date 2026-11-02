import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import WaterPoint from "@/models/WaterPoint";
import WaterStatusReport from "@/models/WaterStatusReport";
import MaintenanceRequest from "@/models/MaintenanceRequest";
import { validateNewRequest } from "@/modules/maintenance/validateRequest";

// GET /api/maintenance/requests
// Optional: ?status=Pending  (or In Progress / Completed)
// Returns all maintenance requests with their water point details.
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = {};
    if (status && status !== "All") {
      query.status = status;
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

// POST /api/maintenance/requests
// Creates a maintenance request from a student report.
export async function POST(request) {
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

    // 3. Do not allow a second request for the same report
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

    // 4. Save the request. The water point ID comes from the REPORT,
    //    not from the browser, so it can always be trusted.
    const newRequest = await MaintenanceRequest.create({
      statusReportId: report._id,
      waterPointId: report.waterPointId,
      issueDescription: body.issueDescription.trim(),
      priority: body.priority,
      assignedTo: body.assignedTo.trim(),
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
