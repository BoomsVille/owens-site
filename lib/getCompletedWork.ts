import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";

import { completedWork, type BrandWork, type WorkImage, type WorkImageSlide } from "@/data/work";

const SIXTOWNS_SLUG = "sixtowns-distillery-bar";
const UNRIVALLED_SLUG = "unrvialled-spirits";
const MS_INTERIORS_SLUG = "ms-interiors";
const SCB_SLUG = "scb-digger-and-driver";
const SUPPORTED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const SIXTOWNS_CARD_FOLDERS = [
  { label: "photography", folder: "photography" },
  { label: "design", folder: "design" },
  { label: "development", folder: "development" }
] as const;

function toReadableLabel(fileName: string) {
  const stem = fileName.replace(/\.[^.]+$/, "");
  const withoutSeoPrefix = stem.replace(
    /^(sixtowns|unrivalled|msinteriors|scb)-(photography|design|development)-/i,
    ""
  );
  const normalized = withoutSeoPrefix.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : "SixTowns Photography";
}

function getDevelopmentSlideMeta(fileName: string, index: number) {
  const defaults = [
    { caption: "sixtownsgin.co.uk", alt: "SixTowns development - sixtownsgin.co.uk" },
    { caption: "app.sixtownsgin.co.uk", alt: "SixTowns development - app.sixtownsgin.co.uk" },
    { caption: "Bar ordering page (app)", alt: "SixTowns development - bar ordering page on the app" }
  ] as const;

  const preset = defaults[index];
  if (preset) return preset;

  const label = toReadableLabel(fileName);
  return {
    caption: label,
    alt: `SixTowns development - ${label}`
  };
}

function getSixtownsDevelopmentOrder(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.includes("app-sixtownsgin") || lower.includes("app.sixtownsgin")) return 1;
  if (
    lower.includes("bar-sixtownsgin") ||
    lower.includes("bar.sixtownsgin") ||
    lower.includes("bar-order") ||
    lower.includes("barordering")
  )
    return 2;
  if (lower.includes("sixtownsgin") || lower.includes("sixtowngin")) return 0;
  return 10;
}

async function loadSixtownsFolderSlides(folder: string): Promise<WorkImageSlide[]> {
  const folderDir = path.join(process.cwd(), "public", "sixtowns", folder);

  try {
    const entries = await readdir(folderDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    const orderedFiles =
      folder === "development"
        ? [...files].sort((a, b) => {
            const orderDiff = getSixtownsDevelopmentOrder(a) - getSixtownsDevelopmentOrder(b);
            if (orderDiff !== 0) return orderDiff;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
          })
        : files;

    return orderedFiles.map((fileName, index) => {
      const label = toReadableLabel(fileName);
      const developmentMeta = folder === "development" ? getDevelopmentSlideMeta(fileName, index) : null;
      return {
        src: `/sixtowns/${folder}/${encodeURIComponent(fileName)}`,
        alt: developmentMeta?.alt ?? `SixTowns ${folder} - ${label}`,
        caption: developmentMeta?.caption ?? label
      };
    });
  } catch {
    return [];
  }
}

async function loadFolderSlides(publicSubPath: string, urlBasePath: string, altPrefix: string): Promise<WorkImageSlide[]> {
  const folderDir = path.join(process.cwd(), "public", ...publicSubPath.split("/"));

  try {
    const entries = await readdir(folderDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

    return files.map((fileName) => {
      const label = toReadableLabel(fileName);
      return {
        src: `${urlBasePath}/${encodeURIComponent(fileName)}`,
        alt: `${altPrefix} - ${label}`,
        caption: label
      };
    });
  } catch {
    return [];
  }
}

function buildCarouselCard(slides: WorkImageSlide[], label: string): WorkImage | null {
  if (slides.length === 0) return null;
  const [primarySlide, ...remainingSlides] = slides;
  return {
    src: primarySlide.src,
    alt: primarySlide.alt,
    caption: primarySlide.caption,
    cardLabel: label,
    cardCarousel: remainingSlides
  };
}

export async function getCompletedWork(): Promise<BrandWork[]> {
  const sixtownsSlidesByLabel = new Map<string, WorkImageSlide[]>(
    await Promise.all(
      SIXTOWNS_CARD_FOLDERS.map(async ({ label, folder }) => [label, await loadSixtownsFolderSlides(folder)] as const)
    )
  );
  const hasAnyInjectedSlides = Array.from(sixtownsSlidesByLabel.values()).some((slides) => slides.length > 0);
  const unrivalledPhotographySlides = await loadFolderSlides("unrivalled/photography", "/unrivalled/photography", "Unrivalled photography");
  const unrivalledDesignSlides = await loadFolderSlides("unrivalled/design", "/unrivalled/design", "Unrivalled design");
  const unrivalledDevelopmentSlides = await loadFolderSlides("unrivalled/development", "/unrivalled/development", "Unrivalled development");
  const msInteriorsDevelopmentSlides = (
    await loadFolderSlides("msinteriors/development", "/msinteriors/development", "MS Interiors development")
  ).filter((slide) => !slide.src.toLowerCase().includes("full-screen"));
  const scbDevelopmentSlides = await loadFolderSlides("scb/development", "/scb/development", "SCB development");
  const hasUnrivalledPhotographySlides = unrivalledPhotographySlides.length > 0;
  const hasUnrivalledDesignSlides = unrivalledDesignSlides.length > 0;
  const hasUnrivalledDevelopmentSlides = unrivalledDevelopmentSlides.length > 0;
  const hasMsInteriorsDevelopmentSlides = msInteriorsDevelopmentSlides.length > 0;
  const hasScbDevelopmentSlides = scbDevelopmentSlides.length > 0;

  if (!hasAnyInjectedSlides && !hasUnrivalledPhotographySlides && !hasUnrivalledDesignSlides && !hasUnrivalledDevelopmentSlides && !hasMsInteriorsDevelopmentSlides && !hasScbDevelopmentSlides) return completedWork;

  return completedWork.map((entry) => {
    if (entry.slug === MS_INTERIORS_SLUG && hasMsInteriorsDevelopmentSlides) {
      const developmentCard = buildCarouselCard(msInteriorsDevelopmentSlides, "Development");
      if (!developmentCard) return entry;

      const cards: WorkImage[] = [developmentCard];
      return {
        ...entry,
        images: cards,
        galleries: [
          {
            title: "Portfolio",
            images: cards
          }
        ]
      };
    }

    if (entry.slug === SCB_SLUG && hasScbDevelopmentSlides) {
      const developmentCard = buildCarouselCard(scbDevelopmentSlides, "Development");
      if (!developmentCard) return entry;

      const cards: WorkImage[] = [developmentCard];
      return {
        ...entry,
        images: cards,
        galleries: [
          {
            title: "Portfolio",
            images: cards
          }
        ]
      };
    }

    if (entry.slug === UNRIVALLED_SLUG && (hasUnrivalledPhotographySlides || hasUnrivalledDesignSlides || hasUnrivalledDevelopmentSlides)) {
      const cards: WorkImage[] = [];
      const photographyCard = buildCarouselCard(unrivalledPhotographySlides, "Photography");
      const designCard = buildCarouselCard(unrivalledDesignSlides, "Design");
      const developmentCard = buildCarouselCard(unrivalledDevelopmentSlides, "Development");
      if (photographyCard) cards.push(photographyCard);
      if (designCard) cards.push(designCard);
      if (developmentCard) cards.push(developmentCard);

      return {
        ...entry,
        images: cards,
        galleries: [
          {
            title: "Portfolio",
            images: cards
          }
        ]
      };
    }

    if (entry.slug !== SIXTOWNS_SLUG || !entry.galleries?.length) {
      return entry;
    }

    const updatedGalleries = entry.galleries.map((gallery) => ({
      ...gallery,
      images: gallery.images.map((image) => {
        const cardLabel = image.cardLabel?.toLowerCase();
        if (!cardLabel) return image;

        const slides = sixtownsSlidesByLabel.get(cardLabel);
        if (!slides?.length) return image;

        const [primarySlide, ...remainingSlides] = slides;
        return {
          ...image,
          src: primarySlide.src,
          alt: primarySlide.alt,
          caption: primarySlide.caption,
          cardCarousel: remainingSlides
        };
      })
    }));

    return {
      ...entry,
      galleries: updatedGalleries
    };
  });
}
