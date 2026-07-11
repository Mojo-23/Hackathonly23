import { notFound } from "next/navigation";
import { getHackathonBySlug, hackathons } from "@/lib/mock-data";
import { EventDetailContent } from "./event-detail-content";

export function generateStaticParams() {
  return hackathons.map((h) => ({ slug: h.slug }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hackathon = getHackathonBySlug(slug);

  if (!hackathon) {
    notFound();
  }

  return <EventDetailContent hackathon={hackathon} />;
}
