"use client";

import Link from "next/link";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIME = "#AAFF00";

export function HomeCTA() {
  return (
    <section className="w-full py-12 md:py-16 bg-black">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col text-center bg-[#0f0f0f] border border-white/[0.08] rounded-2xl p-6 lg:p-14 gap-8 items-center">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${LIME}20`, color: LIME }}
          >
            Get started
          </span>
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-semibold text-white">
              Ready to scale your marketing?
            </h3>
            <p className="text-base lg:text-lg leading-relaxed tracking-tight text-white/70 max-w-xl">
              Let&apos;s turn your campaigns into predictable growth. From tracking and attribution to creative strategy—I help brands grow through data-driven performance marketing.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" className="gap-2 h-12 px-6 font-semibold">
              <Link href="/contact">
                Jump on a call <PhoneCall className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild className="gap-2 h-12 px-6 font-semibold bg-[#AAFF00] text-[#0F0F0F] hover:bg-[#AAFF00]/90">
              <Link href="/contact">
                Get in touch <MoveRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
