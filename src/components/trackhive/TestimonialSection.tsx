"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// --- Types ---
interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

// --- Data ---
const testimonials: Testimonial[] = [
  {
    text: "TrackHive revolutionized our attribution. Server-side tracking recovered conversions we were losing to ad blockers. Meta match rates jumped from 50% to over 85%.",
    image: "/avatars/1.png",
    name: "Muhammad Ayaan Khan",
    role: "Operations Manager",
  },
  {
    text: "Implementing TrackHive was smooth and quick. The setup took minutes—no developers needed. Our team was trained and live in a single day.",
    image: "/avatars/2.png",
    name: "Ahmed Raza Malik",
    role: "IT Manager",
  },
  {
    text: "The support team is exceptional, guiding us through setup and providing ongoing assistance. Our Meta and TikTok events are now firing reliably.",
    image: "/avatars/3.png",
    name: "Ethan James Walker",
    role: "Customer Support Lead",
  },
  {
    text: "TrackHive's seamless integration with Meta CAPI and Google enhanced our attribution across the whole funnel. Highly recommend for ecommerce.",
    image: "/avatars/4.png",
    name: "Noah Alexander Smith",
    role: "CEO",
  },
  {
    text: "Its robust features and quick support have transformed our tracking. We finally have visibility into conversions that ad blockers were hiding.",
    image: "/avatars/5.png",
    name: "Oliver Daniel Brown",
    role: "Project Manager",
  },
  {
    text: "The smooth implementation exceeded expectations. We went live in under 5 minutes and recovered thousands in lost attribution within a week.",
    image: "/avatars/6.png",
    name: "Liam Christopher Johnson",
    role: "Business Analyst",
  },
  {
    text: "Our Meta and TikTok ads improved with a user-friendly setup and accurate server-side events. Customer feedback on our campaigns is now reliable.",
    image: "/avatars/7.png",
    name: "Lucas Michael Anderson",
    role: "Marketing Director",
  },
  {
    text: "They delivered a solution that exceeded expectations. TrackHive understood our needs—recovering conversions and improving match rates across Meta and Google.",
    image: "/avatars/8.png",
    name: "Mason William Taylor",
    role: "Sales Manager",
  },
  {
    text: "Using TrackHive, our attribution and Meta match rates significantly improved. Server-side events fixed the gaps ad blockers and iOS were creating.",
    image: "/avatars/9.png",
    name: "Henry Thomas Clark",
    role: "E-commerce Manager",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

// --- Sub-Components ---
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <motion.li
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(59, 130, 246, 0.2)",
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 17,
                    },
                  }}
                  whileFocus={{
                    scale: 1.03,
                    y: -8,
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(59, 130, 246, 0.2)",
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 17,
                    },
                  }}
                  className="p-10 rounded-3xl border max-w-xs w-full bg-white shadow-lg cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                  style={{
                    borderColor: "#e2e8f0",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                  }}
                >
                  <blockquote className="m-0 p-0">
                    <p
                      className="leading-relaxed font-normal m-0"
                      style={{ color: "#475569" }}
                    >
                      {text}
                    </p>
                    <footer className="flex items-center gap-3 mt-6">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-100 group-hover:ring-[#3B82F6]/30 transition-all duration-300">
                        <Image
                          fill
                          src={image}
                          alt={`Avatar of ${name}`}
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <cite
                          className="font-semibold not-italic tracking-tight leading-5"
                          style={{ color: "#0f172a" }}
                        >
                          {name}
                        </cite>
                        <span
                          className="text-sm leading-5 tracking-tight mt-0.5"
                          style={{ color: "#64748b" }}
                        >
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export default function TestimonialSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-24 relative overflow-hidden bg-white"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 },
        }}
        className="max-w-6xl mx-auto px-5 md:px-6 z-10 relative"
      >
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16">
          <div className="flex justify-center">
            <span
              className="inline-block py-1 px-4 rounded-full text-xs font-semibold tracking-wide uppercase"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
              }}
            >
              Testimonials
            </span>
          </div>

          <h2
            id="testimonials-heading"
            className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6 text-center"
            style={{ color: "#0f172a" }}
          >
            What our users say
          </h2>
          <p
            className="text-center mt-5 text-lg leading-relaxed max-w-sm"
            style={{ color: "#64748b" }}
          >
            Discover how thousands of teams streamline their tracking with
            TrackHive.
          </p>
        </div>

        <div
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </motion.div>
    </section>
  );
}
