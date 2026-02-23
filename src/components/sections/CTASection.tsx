"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, Plus, Copy, Zap } from "lucide-react";

interface ComponentProps {
  name?: string;
  role?: string;
  email?: string;
  avatarSrc?: string;
  statusText?: string;
  statusColor?: string;
  glowText?: string;
  className?: string;
}

export default function CTASection({
  name = "Hassan Ahmed",
  role = "performance marketer",
  email = "hassanonclouds@gmail.com",
  avatarSrc = "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ2l0aHViL2ltZ18yc2pLdFl5STR0MkZMcUNKaVNMQVJXRmNBSXIifQ",
  statusText = "Available for work",
  statusColor = "bg-accent",
  glowText = "Currently High on Creativity",
  className,
}: ComponentProps) {
  const [copied, setCopied] = useState(false);

  const timeText = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour12}:${m}${ampm}`;
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("relative w-full max-w-3xl mx-auto", className)}
    >
      <div className="pointer-events-none absolute inset-x-0 -bottom-8 top-[72%] rounded-[28px] bg-accent/20 shadow-[0_40px_80px_-16px_rgba(170,255,0,0.3)] z-0" />

      <div className="absolute inset-x-0 -bottom-8 z-0">
        <div className="flex items-center justify-center gap-2 bg-transparent py-3 text-center text-sm font-medium text-[#FFFFFF]">
          <Zap className="h-4 w-4 shrink-0 text-[#AAFF00]" /> <span className="truncate">{glowText}</span>
        </div>
      </div>

      <Card className="relative z-10 w-full overflow-visible rounded-[28px] border border-[#222222] bg-[#1A1A1A] text-[#FFFFFF] shadow-2xl">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-[#888888]">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full animate-pulse", statusColor)} />
              <span className="select-none truncate">{statusText}</span>
            </div>
            <div className="flex items-center gap-2 opacity-80 shrink-0">
              <Clock className="h-4 w-4" />
              <span className="tabular-nums">{timeText}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
              <Image
                src={avatarSrc}
                alt={`${name} avatar`}
                fill
                sizes="(max-width: 640px) 48px, 56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
                {name}
              </h3>
              <p className="mt-0.5 text-xs sm:text-sm text-[#888888]">{role}</p>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Button
              variant="secondary"
              className="h-11 sm:h-12 justify-start gap-3 rounded-2xl bg-accent text-designBg hover:bg-accentHover text-sm sm:text-base font-semibold px-6 md:px-8"
            >
              <Plus className="h-4 w-4 shrink-0" /> Hire Me
            </Button>

            <Button
              variant="secondary"
              onClick={handleCopy}
              className="h-11 sm:h-12 justify-start gap-3 rounded-2xl bg-accent text-designBg hover:bg-accentHover text-sm sm:text-base font-semibold px-6 md:px-8"
            >
              <Copy className="h-4 w-4 shrink-0" /> {copied ? "Copied" : "Copy Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
