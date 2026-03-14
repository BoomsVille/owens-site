export type ServicePage = {
  slug: string;
  navLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  outcomes: string[];
  idealFor: string[];
  notIdealFor: string[];
  includes: string[];
  deliverables: string[];
  timeline: { label: string; value: string }[];
  fromPrice: string;
  process: { step: string; title: string; detail: string }[];
  faqs: { question: string; answer: string }[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "web-development",
    navLabel: "Web Development",
    title: "Websites built to convert, not just look good.",
    subtitle: "Web Development",
    intro:
      "I build Shopify, WordPress/WooCommerce, and fully custom websites that explain your offer clearly, load quickly, and guide visitors toward enquiry. Even Shopify and WordPress stores include custom code refinements to get everything perfect.",
    outcomes: ["Clear positioning", "Higher trust", "Faster performance", "Better enquiry flow"],
    idealFor: [
      "Service brands needing a full website refresh",
      "Businesses with outdated or low-converting pages",
      "Founders who want one person to lead both design and build"
    ],
    notIdealFor: [
      "Large enterprise systems with multiple dev teams",
      "Projects with no approved content or offer clarity",
      "Ultra-low-budget brochure sites"
    ],
    includes: [
      "Discovery and offer mapping",
      "Shopify, WordPress/WooCommerce, or fully custom builds",
      "Custom code refinements for Shopify and WordPress stores",
      "Page architecture and conversion flow",
      "Design system and responsive UI",
      "High-performance development and QA",
      "Technical SEO setup and launch support"
    ],
    deliverables: [
      "Live website deployed",
      "Core pages: Home, About, Services, Work, Contact",
      "Reusable section blocks for future pages",
      "Basic CMS/content editing guide",
      "Post-launch support window"
    ],
    timeline: [
      { label: "Typical timeline", value: "2 to 6 weeks" },
      { label: "Kickoff requirement", value: "Goals + existing assets + key offers" },
      { label: "Review cadence", value: "Weekly checkpoints" }
    ],
    fromPrice: "From £150",
    process: [
      { step: "01", title: "Discovery", detail: "We define goals, audience, offers, and what conversion should look like." },
      { step: "02", title: "Design + Build", detail: "I design and build the site in one consistent system with feedback loops." },
      { step: "03", title: "Launch + Iterate", detail: "After launch, we tighten performance and messaging based on usage." }
    ],
    faqs: [
      { question: "How long does a build take?", answer: "Most websites are delivered in 2 to 6 weeks depending on scope and content readiness." },
      { question: "Can you work with my current branding?", answer: "Yes. I can work within your brand system or refine it where clarity is missing." },
      { question: "Do you support updates after launch?", answer: "Yes. Ongoing support can be monthly or ad-hoc depending on your workload." }
    ]
  },
  {
    slug: "social-media-management",
    navLabel: "Social Media Management",
    title: "Consistent social content that keeps you visible.",
    subtitle: "Social Media Management",
    intro:
      "I run your social output as a repeatable system, so your brand stays active, professional, and aligned with business goals.",
    outcomes: ["Consistent posting", "Stronger brand voice", "Better engagement quality", "Clear monthly direction"],
    idealFor: [
      "Brands posting inconsistently or without strategy",
      "Businesses needing predictable monthly output",
      "Teams that want done-for-you planning and publishing"
    ],
    notIdealFor: [
      "Brands expecting viral growth without volume or testing",
      "Accounts with no access to basic media assets",
      "Teams unwilling to provide quick approvals"
    ],
    includes: [
      "Monthly content strategy and themes",
      "Content calendar and scheduling",
      "Caption writing and publishing",
      "Platform-level optimization",
      "Monthly performance review and next steps"
    ],
    deliverables: [
      "Monthly content plan",
      "Scheduled posts and copy",
      "Brand-consistent visual direction",
      "KPI summary and recommendations"
    ],
    timeline: [
      { label: "Onboarding", value: "3 to 7 days" },
      { label: "Monthly cycle", value: "Plan -> Produce -> Publish -> Review" },
      { label: "Reporting", value: "Every 4 weeks" }
    ],
    fromPrice: "From £149 / month",
    process: [
      { step: "01", title: "Audit", detail: "We review current content, positioning gaps, and channel opportunities." },
      { step: "02", title: "Build The Engine", detail: "I create a repeatable content workflow with approvals and publishing cadence." },
      { step: "03", title: "Optimize Monthly", detail: "We adjust hooks, formats, and topics based on real performance." }
    ],
    faqs: [
      { question: "Do I need to be on every platform?", answer: "No. We prioritize the channels most likely to produce leads or attention." },
      { question: "Can you handle comments and DMs?", answer: "Yes, light community management can be included in scope." },
      { question: "How quickly will I see results?", answer: "Consistency improves quickly, while growth quality compounds over 2 to 3 months." }
    ]
  },
  {
    slug: "photography",
    navLabel: "Photography",
    title: "Brand and product photography that sells your offer clearly.",
    subtitle: "Photography",
    intro:
      "I deliver polished brand and product photography for bars, restaurants, and product-based businesses, including studio product shoots where you can send products in.",
    outcomes: ["Higher visual quality", "More cohesive brand image", "Reusable asset library", "Stronger first impression"],
    idealFor: [
      "Brands with weak or inconsistent imagery",
      "Bars and restaurants needing menu, drinks, and venue visuals",
      "Product-based businesses needing ecommerce-ready imagery",
      "Businesses relaunching site or campaign assets",
      "Teams needing one shoot for multi-channel use"
    ],
    notIdealFor: [
      "High-volume event coverage teams",
      "Projects without clear usage goals",
      "Same-day large-scale editing turnarounds"
    ],
    includes: [
      "Shot planning and direction",
      "On-site or location photography",
      "Studio product shoots (products can be sent in)",
      "Product and menu hero shots",
      "Lifestyle and in-context product imagery",
      "Professional editing and color consistency",
      "Web/social-ready export sets",
      "Structured delivery of final files"
    ],
    deliverables: [
      "Edited hero and supporting image set",
      "Portrait, environment, and product-focused shots",
      "Multiple aspect ratios for site and social",
      "Organized folder structure for internal use"
    ],
    timeline: [
      { label: "Pre-production", value: "2 to 5 days" },
      { label: "Shoot day(s)", value: "Half day to 2 days" },
      { label: "Final delivery", value: "3 to 10 days after shoot" }
    ],
    fromPrice: "From £99",
    process: [
      { step: "01", title: "Plan The Shot List", detail: "We align visuals to services, pages, and campaign priorities." },
      { step: "02", title: "Capture", detail: "Photography is executed with consistency and practical outputs in mind." },
      { step: "03", title: "Edit + Deliver", detail: "You receive polished files in ready-to-use formats and structure." }
    ],
    faqs: [
      { question: "Do you provide raw images?", answer: "Final edited files are standard. Raw files can be included if agreed upfront." },
      { question: "Can one shoot cover web and social?", answer: "Yes, sessions are designed to maximize multi-channel output." },
      { question: "Can you direct non-model team members?", answer: "Yes. Most shoots involve real teams and practical direction on set." }
    ]
  },
  {
    slug: "content-creation",
    navLabel: "Content Creation",
    title: "Content that looks sharp and communicates fast.",
    subtitle: "Content Creation",
    intro:
      "I create practical content packs that combine strong visuals with clear messaging so your brand looks cohesive everywhere.",
    outcomes: ["Sharper message clarity", "Higher content quality", "Consistent look and tone", "Faster campaign execution"],
    idealFor: [
      "Brands needing regular creative assets",
      "Businesses launching offers or campaigns",
      "Teams who need plug-and-play content batches"
    ],
    notIdealFor: [
      "One-off viral-only expectations",
      "Projects with no messaging direction",
      "Teams unable to review and approve quickly"
    ],
    includes: [
      "Creative concepts and hooks",
      "Short-form visual production",
      "Copy + visual alignment",
      "Platform-ready formatting",
      "Batch delivery for planned campaigns"
    ],
    deliverables: [
      "Monthly or campaign content pack",
      "Edited clips/images with captions/hooks",
      "Asset variations per channel",
      "Usage notes for scheduling and deployment"
    ],
    timeline: [
      { label: "Planning", value: "2 to 4 days" },
      { label: "Production", value: "3 to 10 days" },
      { label: "Delivery cadence", value: "Per campaign or monthly" }
    ],
    fromPrice: "From £99",
    process: [
      { step: "01", title: "Concept", detail: "We define message themes, hooks, and creative direction first." },
      { step: "02", title: "Produce", detail: "Assets are created in structured batches for consistent quality and pace." },
      { step: "03", title: "Deploy", detail: "Final files are delivered with practical usage guidance by platform." }
    ],
    faqs: [
      { question: "Is this separate from social management?", answer: "Yes, it can run standalone or as part of managed social delivery." },
      { question: "Can you match my current brand style?", answer: "Yes. I can work inside your style or tighten it where needed." },
      { question: "Do you offer retainer content production?", answer: "Yes. Monthly packs are available with fixed outputs and cadence." }
    ]
  }
];

export const servicePageMap = new Map(servicePages.map((item) => [item.slug, item]));
