// Sample campus water points. These are added to MongoDB by /api/seed.
// The waterPointId is used by ALL modules, so never change these IDs.

const waterPointsData = [
  { waterPointId: "WP-001", name: "Library Entrance Cooler", building: "Main Library", floor: "Ground Floor", locationDetails: "Next to the main entrance, beside the security desk.", availability: "Available", cleanliness: "Clean", temperature: "Cold", isWorking: true },
  { waterPointId: "WP-002", name: "Library Reading Hall Dispenser", building: "Main Library", floor: "First Floor", locationDetails: "Near the reading hall, opposite the staircase.", availability: "Available", cleanliness: "Average", temperature: "Normal", isWorking: true },
  { waterPointId: "WP-003", name: "Science Block Corridor Cooler", building: "Science Block", floor: "Ground Floor", locationDetails: "In the main corridor, near the Physics lab.", availability: "Not Available", cleanliness: "Average", temperature: "Normal", isWorking: false },
  { waterPointId: "WP-004", name: "Engineering Block RO Plant", building: "Engineering Block", floor: "Ground Floor", locationDetails: "Behind the main staircase, near the canteen door.", availability: "Available", cleanliness: "Clean", temperature: "Cold", isWorking: true },
  { waterPointId: "WP-005", name: "Engineering Block Second Floor Cooler", building: "Engineering Block", floor: "Second Floor", locationDetails: "Beside the computer lab.", availability: "Available", cleanliness: "Dirty", temperature: "Warm", isWorking: true },
  { waterPointId: "WP-006", name: "Hostel A Water Cooler", building: "Hostel A", floor: "Ground Floor", locationDetails: "In the common area near the hostel office.", availability: "Available", cleanliness: "Clean", temperature: "Normal", isWorking: true },
  { waterPointId: "WP-007", name: "Hostel B Water Cooler", building: "Hostel B", floor: "First Floor", locationDetails: "Near the study room.", availability: "Not Available", cleanliness: "Dirty", temperature: "Warm", isWorking: false },
  { waterPointId: "WP-008", name: "Cafeteria Water Dispenser", building: "Cafeteria", floor: "Ground Floor", locationDetails: "Beside the tray counter.", availability: "Available", cleanliness: "Average", temperature: "Cold", isWorking: true },
  { waterPointId: "WP-009", name: "Sports Complex Cooler", building: "Sports Complex", floor: "Ground Floor", locationDetails: "Outside the gym, near the ground entrance.", availability: "Available", cleanliness: "Clean", temperature: "Cold", isWorking: true },
  { waterPointId: "WP-010", name: "Admin Block Water Cooler", building: "Admin Block", floor: "First Floor", locationDetails: "Near the Registrar's office waiting area.", availability: "Available", cleanliness: "Clean", temperature: "Normal", isWorking: true },
];

export default waterPointsData;
