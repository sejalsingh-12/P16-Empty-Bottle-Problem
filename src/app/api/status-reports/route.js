import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WaterPoint from "@/models/WaterPoint";
import WaterStatusReport from "@/models/WaterStatusReport";
import { validateReport } from "@/modules/water-status/validateReport";

// GET /api/status-reports
// Optional: ?waterPointId=WP-001  -> only reports for that water point
// Returns the newest reports first (maximum 50).
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const waterPointId = searchParams.get("waterPointId");

    const query = {};
    if (waterPointId && waterPointId !== "All") {
      query.waterPointId = waterPointId;
    }

    const reports = await WaterStatusReport.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/status-reports
// Saves a new report AND updates the water point with the latest status.
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // 1. Check the data (same function the form uses)
    const errors = validateReport(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Please fix the errors in the form.", errors },
        { status: 400 }
      );
    }

    // 2. Make sure the water point really exists
    const waterPoint = await WaterPoint.findOne({ waterPointId: body.waterPointId });
    if (!waterPoint) {
      return NextResponse.json(
        { success: false, message: "Water point not found." },
        { status: 404 }
      );
    }

    // 3. Save the report in the history collection
    const report = await WaterStatusReport.create({
      waterPointId: body.waterPointId,
      availability: body.availability,
      cleanliness: body.cleanliness,
      temperature: body.temperature,
      isWorking: body.isWorking,
      usageStatus: body.usageStatus,
      description: (body.description || "").trim(),
    });

    // 4. Update the water point with the latest reported status
    //    (this is what Module 1 shows on its cards and details page)
    waterPoint.availability = body.availability;
    waterPoint.cleanliness = body.cleanliness;
    waterPoint.temperature = body.temperature;
    waterPoint.isWorking = body.isWorking;
    waterPoint.usageStatus = body.usageStatus;
    waterPoint.lastReportedAt = new Date();
    await waterPoint.save();

    return NextResponse.json(
      { success: true, message: "Report submitted successfully!", data: report },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
