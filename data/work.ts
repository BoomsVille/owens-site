export type WorkImageSlide = {
  src: string;
  alt: string;
  caption?: string;
};

export type WorkImage = {
  src: string;
  alt: string;
  caption?: string;
  cardLabel?: string;
  cardCarousel?: WorkImageSlide[];
};

export type WorkLink = {
  label: string;
  href: string;
};

export type WorkGallery = {
  title: string;
  images: WorkImage[];
};

export type WorkTestimonial = {
  quote: string;
  name: string;
};

export type BrandWork = {
  brand: string;
  slug: string;
  status: "Completed" | "In Progress";
  overview: string;
  services: string[];
  deliverables: string[];
  links?: WorkLink[];
  galleries?: WorkGallery[];
  testimonial?: WorkTestimonial;
  notes?: string;
  images: WorkImage[];
};

// Add new brands here as you complete more work.
// For local images, drop files in /public/work/<slug>/ and reference with:
// src: "/work/<slug>/<file-name>.jpg"
export const completedWork: BrandWork[] = [
  {
    brand: "SIXTOWNS Distillery & Bar",
    slug: "sixtowns-distillery-bar",
    status: "Completed",
    overview:
      "Delivered a full brand operations and growth system across digital presence, photography, customer ordering, and in-venue tools.",
    services: [
      "Website Management",
      "PWA + iOS + Android App Management",
      "Product Photography",
      "Email Marketing",
      "Social Media Management",
      "Design Production"
    ],
    deliverables: [
      "Website management and updates",
      "Product photography assets",
      "Email marketing campaigns",
      "Social media management",
      "Design of banners, menus, and retail tools",
      "Table POS material design",
      "Ordering screen design",
      "SIXTOWNS PWA + iOS + Android app support",
      "Customer table-size ordering flow"
    ],
    links: [
      { label: "Website", href: "https://www.sixtownsgin.co.uk" },
      { label: "PWA + iOS + Android App", href: "https://app.sixtownsgin.co.uk" },
      { label: "Instagram", href: "https://www.instagram.com/sixtownsgin" },
      { label: "Facebook", href: "https://www.facebook.com/sixtownsgin" }
    ],
    testimonial: {
      quote:
        "The full website, app, and content rollout gave us a cleaner brand presence and stronger day-to-day marketing output.",
      name: "SIXTOWNS Team"
    },
    galleries: [
      {
        title: "Design",
        images: [
          {
            src: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
            alt: "Distillery and bar interior ambience",
            cardLabel: "Photography",
            caption: "Venue and bar presence",
            cardCarousel: [
              {
                src: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80",
                alt: "Premium drinks lineup at bar",
                caption: "Food and drink campaign visuals"
              },
              {
                src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
                alt: "Cocktail lifestyle photography",
                caption: "In-venue and social-ready photography"
              }
            ]
          },
          {
            src: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80",
            alt: "Premium drinks lineup at bar",
            cardLabel: "Design",
            caption: "Food and drink campaign visuals",
            cardCarousel: [
              {
                src: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1600&q=80",
                alt: "Cocktail close-up on bar",
                caption: "Cocktail focus for social visuals"
              },
              {
                src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
                alt: "Styled food and drink table shot",
                caption: "Food and drink content set"
              }
            ]
          },
          {
            src: "/sixtowns/development/sixtowns-development-sixtownsgin.jpg",
            alt: "SIXTOWNS main website case study slide",
            cardLabel: "Development",
            caption: "sixtownsgin.co.uk",
            cardCarousel: [
              {
                src: "/sixtowns/development/sixtowns-development-app-sixtownsgin-co-uk.png",
                alt: "SIXTOWNS app case study slide",
                caption: "app.sixtownsgin.co.uk"
              },
              {
                src: "/sixtowns/development/sixtowns-development-bar-sixtownsgin-co-uk.png",
                alt: "SIXTOWNS bar ordering case study slide",
                caption: "bar.sixtownsgin.co.uk"
              }
            ]
          }
        ]
      }
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
        alt: "Distillery and bar interior ambience",
        caption: "Venue and bar presence"
      },
      {
        src: "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=1600&q=80",
        alt: "Bottled spirits product lineup",
        caption: "Product photography output"
      },
      {
        src: "https://images.unsplash.com/photo-1565806612752-2f7e2d7fd41b?auto=format&fit=crop&w=1600&q=80",
        alt: "Digital menu and ordering screen concept",
        caption: "Ordering and customer experience tools"
      }
    ]
  },
  {
    brand: "UNRVIALLED SPIRITS",
    slug: "unrvialled-spirits",
    status: "Completed",
    overview:
      "Built a full digital and visual rollout for the brand, from website presence to product-facing design assets.",
    services: ["Web Development", "Photography", "Social Media Content", "Product Design", "Email Marketing"],
    deliverables: [
      "Website build",
      "Product photography set",
      "Social media image pack",
      "Product label design",
      "Direct bottle print design",
      "Email marketing campaigns"
    ],
    links: [
      { label: "Website", href: "https://www.unrivalledspirits.co.uk" },
      { label: "Instagram", href: "https://www.instagram.com/unrivalledspirits" },
      { label: "Facebook", href: "https://www.facebook.com/unrivalledspirits" }
    ],
    testimonial: {
      quote:
        "The product visuals and digital presentation raised our brand quality immediately across web and social.",
      name: "UNRIVALLED SPIRITS"
    },
    images: [
      {
        src: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1600&q=80",
        alt: "Spirits bottle product shot on dark backdrop",
        caption: "Product photography direction"
      },
      {
        src: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80",
        alt: "Premium spirits bottles lined in bar setting",
        caption: "Brand presentation visuals"
      },
      {
        src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
        alt: "Lifestyle cocktail shot for social campaigns",
        caption: "Social content image pack"
      }
    ]
  },
  {
    brand: "MS Interiors",
    slug: "ms-interiors",
    status: "Completed",
    overview:
      "Built a complete launch-ready digital presence for the business, covering identity, online setup, and social foundations.",
    services: [
      "Website Design",
      "Branding",
      "Social Media Setup",
      "Google Business Profile Setup",
      "Business Email Setup"
    ],
    deliverables: [
      "Website design and build",
      "Branding pack",
      "Social media account setup",
      "Google Business Profile setup",
      "Business email setup"
    ],
    links: [{ label: "Website", href: "https://msinteriors.co.uk" }],
    testimonial: {
      quote:
        "Everything was handled end-to-end, from website to setup, which made launch simple and professional.",
      name: "MS Interiors"
    },
    images: [
      {
        src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
        alt: "Interior design workspace with material palette",
        caption: "Brand visual direction"
      },
      {
        src: "https://images.unsplash.com/photo-1600566753052-e8f5f3f57f4d?auto=format&fit=crop&w=1600&q=80",
        alt: "Modern interior room style shot",
        caption: "Website and social visual style"
      },
      {
        src: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80",
        alt: "Interior styling details for content creation",
        caption: "Content and profile assets"
      }
    ]
  },
  {
    brand: "SCB Digger and Driver",
    slug: "scb-digger-and-driver",
    status: "Completed",
    overview:
      "Delivered the same full setup package to establish a professional and conversion-ready online presence for the business.",
    services: [
      "Website Design",
      "Branding",
      "Social Media Setup",
      "Google Business Profile Setup",
      "Business Email Setup"
    ],
    deliverables: [
      "Website design and build",
      "Branding pack",
      "Social media account setup",
      "Google Business Profile setup",
      "Business email setup"
    ],
    links: [{ label: "Website", href: "https://scbdiggernnddriver.co.uk" }],
    testimonial: {
      quote:
        "The new site and business setup gave us a stronger first impression and clearer online presence.",
      name: "SCB Digger and Driver"
    },
    images: [
      {
        src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
        alt: "Construction machinery and operator at work site",
        caption: "Field service visual identity"
      },
      {
        src: "https://images.unsplash.com/photo-1551135049-8a33b5883817?auto=format&fit=crop&w=1600&q=80",
        alt: "Heavy equipment in operation on building site",
        caption: "Website and social imagery"
      },
      {
        src: "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=1600&q=80",
        alt: "Operator and equipment close-up for service branding",
        caption: "Business profile and contact assets"
      }
    ]
  }
];
