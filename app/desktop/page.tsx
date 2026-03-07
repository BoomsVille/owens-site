import type { Metadata } from "next";

import { getCompletedWork } from "@/lib/getCompletedWork";
import { DesktopExperience } from "@/components/DesktopExperience";

export const metadata: Metadata = {
  title: "Mac View",
  description: "Interactive desktop view of completed projects, services, and photo gallery."
};

export default async function DesktopPage() {
  const entries = await getCompletedWork();
  const seen = new Set<string>();
  const galleryImages = entries.flatMap((entry) => {
    const sourceImages = entry.galleries?.flatMap((gallery) => gallery.images) ?? entry.images;

    return sourceImages.flatMap((image) => {
      const slides = [image, ...(image.cardCarousel ?? [])];
      return slides
        .filter((slide) => {
          if (seen.has(slide.src)) return false;
          seen.add(slide.src);
          return true;
        })
        .map((slide) => ({ src: slide.src, alt: slide.alt }));
    });
  });

  return <DesktopExperience galleryImages={galleryImages} workEntries={entries} />;
}
