import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WaterPoint from "@/models/WaterPoint";
import WaterStatusReport from "@/models/WaterStatusReport";
import MaintenanceRequest from "@/models/MaintenanceRequest";
import {
  attentionFilter,
  buildProblemText,
  suggestPriority,
} from "@/modules/maintenance/maintenanceOptions";

// GET /api/maintenance/reports
// Returns the student reports (Module 2) that need maintenance attention.
// Each report also shows the water point name and whether a request exists.
export async function GET() {
  try {
    await connectDB();

    // 1. Newest student reports that match the "needs attention" rule
    const reports = await WaterStatusReport.find(attentionFilter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // 2. Which of these reports already have a maintenance request?
    const reportIds = reports.map((report) => report._id);
    const existingRequests = await MaintenanceRequest.find({
      statusReportId: { $in: reportIds },
    }).lean();
    const reportsWithRequest = existingRequests.map((r) => String(r.statusReportId));

    // 3. Get the water point details (name, building, floor)
    const waterPointIds = reports.map((report) => report.waterPointId);
    const waterPoints = await WaterPoint.find({
      waterPointId: { $in: waterPointIds },
    }).lean();

    // 4. Join everything together
    const data = reports.map((report) => {
      const waterPoint = waterPoints.find(
        (wp) => wp.waterPointId === report.waterPointId
      );

      return {
        _id: report._id,
        waterPointId: report.waterPointId,
        waterPointName: waterPoint ? waterPoint.name : "Unknown water point",
        building: waterPoint ? waterPoint.building : "",
        floor: waterPoint ? waterPoint.floor : "",
        availability: report.availability,
        cleanliness: report.cleanliness,
        temperature: report.temperature,
        isWorking: report.isWorking,
        usageStatus: report.usageStatus,
        description: report.description,
        createdAt: report.createdAt,
        problem: buildProblemText(report),
        suggestedPriority: suggestPriority(report),
        hasRequest: reportsWithRequest.includes(String(report._id)),
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
