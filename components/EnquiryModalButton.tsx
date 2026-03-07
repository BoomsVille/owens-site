"use client";

import { useEffect, useMemo, useState } from "react";

type EnquiryModalButtonProps = {
  buttonLabel?: string;
  className?: string;
  service?: string;
};

export function EnquiryModalButton({
  buttonLabel = "Start Your Enquiry",
  className = "led-btn-edge inline-flex rounded-full border border-accentBlue/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-accentBlueSoft transition-colors duration-300 hover:border-accentBlueSoft hover:text-mist",
  service
}: EnquiryModalButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const subject = useMemo(() => {
    if (service) return `New ${service} enquiry`;
    return "New project enquiry";
  }, [service]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lines = [
      name ? `Name: ${name}` : "",
      email ? `Email: ${email}` : "",
      business ? `Business: ${business}` : "",
      budget ? `Budget: ${budget}` : "",
      service ? `Service: ${service}` : "",
      "",
      message
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:owen@freelancedesign.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
    setOpen(false);
  };

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {buttonLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] bg-[#020713]/60 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
            <section className="led-card-edge w-full max-w-xl rounded-2xl border border-slateLine/80 bg-[#071127]/95 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accentBlueSoft">Start Your Enquiry</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="led-btn-edge rounded-full border border-slateLine px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-mistSoft transition-colors duration-200 hover:border-accentBlue hover:text-mist"
                >
                  Close
                </button>
              </div>

              <form onSubmit={submit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-slateLine/70 bg-slatePanel/45 px-3 py-2 text-sm text-mist outline-none placeholder:text-mistSoft/70 focus:border-accentBlue/70"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    className="w-full rounded-lg border border-slateLine/70 bg-slatePanel/45 px-3 py-2 text-sm text-mist outline-none placeholder:text-mistSoft/70 focus:border-accentBlue/70"
                    required
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={business}
                    onChange={(event) => setBusiness(event.target.value)}
                    placeholder="Business name"
                    className="w-full rounded-lg border border-slateLine/70 bg-slatePanel/45 px-3 py-2 text-sm text-mist outline-none placeholder:text-mistSoft/70 focus:border-accentBlue/70"
                  />
                  <input
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    placeholder="Budget (optional)"
                    className="w-full rounded-lg border border-slateLine/70 bg-slatePanel/45 px-3 py-2 text-sm text-mist outline-none placeholder:text-mistSoft/70 focus:border-accentBlue/70"
                  />
                </div>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell me about your project..."
                  className="h-32 w-full rounded-lg border border-slateLine/70 bg-slatePanel/45 px-3 py-2 text-sm text-mist outline-none placeholder:text-mistSoft/70 focus:border-accentBlue/70"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="led-btn-edge inline-flex rounded-full border border-accentBlue/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accentBlueSoft transition-colors duration-300 hover:border-accentBlueSoft hover:text-mist"
                  >
                    Send Enquiry
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
