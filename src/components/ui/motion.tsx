"use client"

import {
  motion,
  useReducedMotion,
  type Variants,
  type MotionProps,
  type HTMLMotionProps,
} from "framer-motion"
import { forwardRef } from "react"

/* ============================================================
   VARIANTS
   ============================================================ */

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
}

export const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

export const staggerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

/* ============================================================
   SCROLL-TRIGGERED SECTION
   Wraps any section in a viewport-triggered fade+rise
   ============================================================ */
interface SectionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0, ...props }: SectionProps) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden:  { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ============================================================
   STAGGER CONTAINER
   Children animate in sequence when the container enters view
   ============================================================ */
interface StaggerProps {
  children: React.ReactNode
  className?: string
  fast?: boolean
  delay?: number
}

export function StaggerContainer({ children, className, fast = false, delay = 0 }: StaggerProps) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden:  {},
        visible: {
          transition: {
            staggerChildren: fast ? 0.05 : 0.08,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/* ============================================================
   STAGGER CHILD
   Must be a direct child of StaggerContainer
   ============================================================ */
interface ChildProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
}

export const StaggerChild = forwardRef<HTMLDivElement, ChildProps>(
  function StaggerChild({ children, className, ...props }, ref) {
    const reduced = useReducedMotion()
    if (reduced) return <div className={className} ref={ref}>{children}</div>

    return (
      <motion.div
        ref={ref}
        className={className}
        variants={fadeUp}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

/* ============================================================
   ANIMATED CARD
   Hover lift + glow, viewport entrance
   ============================================================ */
interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
}

export function AnimatedCard({ children, className, ...props }: CardProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduced ? {} : {
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ============================================================
   HERO WORD REVEAL
   Staggers words of a heading
   ============================================================ */
interface WordRevealProps {
  text: string
  className?: string
  delay?: number
}

export function WordReveal({ text, className, delay = 0 }: WordRevealProps) {
  const reduced = useReducedMotion()
  const words = text.split(" ")

  if (reduced) return <span className={className}>{text}</span>

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden:  { opacity: 0, y: 32, filter: "blur(4px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  )
}

/* ============================================================
   COUNTER (number count-up animation)
   ============================================================ */
export { motion }
