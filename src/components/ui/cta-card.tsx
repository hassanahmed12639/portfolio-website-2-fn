"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CtaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc?: string;
  title: string;
  description: string;
  inputPlaceholder?: string;
  buttonText: string;
  onButtonClick?: (email: string) => void;
}

const CtaCard = React.forwardRef<HTMLDivElement, CtaCardProps>(
  (
    {
      className,
      imageSrc,
      title,
      description,
      inputPlaceholder = "Email address",
      buttonText,
      onButtonClick,
      ...props
    },
    ref
  ) => {
    const [email, setEmail] = React.useState("");
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (onButtonClick) {
        onButtonClick(email);
      } else {
        const params = new URLSearchParams();
        if (email) params.set("email", email);
        router.push(`/dashboard/signup${params.toString() ? `?${params}` : ""}`);
      }
    };

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
      },
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-blue-500/20 text-card-foreground shadow-lg",
          className
        )}
        {...props}
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700" />
        {/* Animated moving gradient overlay */}
        <div
          className="absolute inset-0 opacity-70 bg-[length:200%_200%] animate-gradient-shift"
          style={{
            backgroundImage:
              "linear-gradient(115deg, #3b82f6 0%, #1e40af 25%, #60a5fa 50%, #1d4ed8 75%, #3b82f6 100%)",
            backgroundPosition: "0% 50%",
          }}
        />
        {imageSrc && (
          <>
            <img
              src={imageSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 to-blue-700/95" />
          </>
        )}

        <motion.div
          className="relative z-10 grid h-full grid-cols-1 items-center gap-5 p-5 font-sans md:grid-cols-2 md:gap-6 md:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-start text-left text-white">
            <motion.h2
              className="text-xl font-extrabold tracking-tight text-white md:text-2xl lg:text-3xl"
              variants={itemVariants}
            >
              {title}
            </motion.h2>
            <motion.p
              className="mt-2 max-w-xl text-base text-blue-100 md:text-lg"
              variants={itemVariants}
            >
              {description}
            </motion.p>
          </div>

          <motion.div
            className="flex w-full max-w-md flex-col items-center justify-center"
            variants={itemVariants}
          >
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                placeholder={inputPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 flex-grow border-blue-400/50 bg-white/10 text-white placeholder:text-blue-200/70 focus-visible:ring-blue-300 focus-visible:ring-offset-0"
                aria-label={inputPlaceholder}
                required
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 bg-white text-blue-600 font-bold hover:bg-blue-50"
              >
                {buttonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

CtaCard.displayName = "CtaCard";

export { CtaCard };
