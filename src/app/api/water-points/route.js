import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WaterPoint from "@/models/WaterPoint";

// GET /api/water-points
// Optional filters: ?search=library&building=Hostel A&availability=Available
//                   &cleanliness=Clean&temperature=Cold
export async function GET(request) {
  try {
    await connectDB();

    // Read the filters from the URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const building = searchParams.get("building");
    const availability = searchParams.get("availability");
    const cleanliness = searchParams.get("cleanliness");
    const temperature = searchParams.get("temperature");

    // Build the MongoDB query step by step
    const query = {};

    if (search) {
      // Make special characters safe, then search name, building and ID
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { building: { $regex: safeSearch, $options: "i" } },
        { waterPointId: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (building && building !== "All") query.building = building;
    if (availability && availability !== "All") query.availability = availability;
    if (cleanliness && cleanliness !== "All") query.cleanliness = cleanliness;
    if (temperature && temperature !== "All") query.temperature = temperature;

    const waterPoints = await WaterPoint.find(query).sort({ waterPointId: 1 });

    return NextResponse.json({ success: true, data: waterPoints });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
