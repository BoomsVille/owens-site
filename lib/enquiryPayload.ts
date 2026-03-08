export type EnquiryRequestBody = {
  name: string;
  email: string;
  business?: string;
  budget?: string;
  message: string;
  service?: string;
  pageUrl?: string;
};

export function sanitizeEnquiry(body: Partial<EnquiryRequestBody>) {
  return {
    name: (body.name ?? "").trim().slice(0, 120),
    email: (body.email ?? "").trim().slice(0, 180),
    business: (body.business ?? "").trim().slice(0, 180),
    budget: (body.budget ?? "").trim().slice(0, 120),
    message: (body.message ?? "").trim().slice(0, 4000),
    service: (body.service ?? "").trim().slice(0, 120),
    pageUrl: (body.pageUrl ?? "").trim().slice(0, 500)
  };
}

export function validateEnquiry(body: ReturnType<typeof sanitizeEnquiry>) {
  if (!body.name || !body.email || !body.message) return false;
  if (!body.email.includes("@")) return false;
  return true;
}

