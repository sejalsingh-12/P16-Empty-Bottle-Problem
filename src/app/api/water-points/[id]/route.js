import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WaterPoint from "@/models/WaterPoint";

// GET /api/water-points/WP-001  ->  details of ONE water point
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const waterPoint = await WaterPoint.findOne({ waterPointId: id });

    if (!waterPoint) {
      return NextResponse.json(
        { success: false, message: "Water point not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: waterPoint });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
