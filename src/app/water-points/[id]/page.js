import WaterPointDetails from "@/modules/water-discovery/WaterPointDetails";

export default async function WaterPointDetailsPage({ params }) {
  const { id } = await params;

  return <WaterPointDetails id={id} />;
}
