import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WaterPoint from "@/models/WaterPoint";
import waterPointsData from "@/data/waterPointsData";

// Open http://localhost:3000/api/seed in the browser to add sample data.
// It only adds data if the collection is EMPTY, so it is safe to open again.
export async function GET() {
  try {
    await connectDB();

    const count = await WaterPoint.countDocuments();

    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${count} water points. Nothing was added.`,
      });
    }

    await WaterPoint.insertMany(waterPointsData);

    return NextResponse.json({
      success: true,
      message: `${waterPointsData.length} water points added successfully!`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
