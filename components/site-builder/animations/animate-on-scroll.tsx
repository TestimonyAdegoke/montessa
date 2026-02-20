"use client"

import { useRef, useEffect, useState, ReactNode } from "react"
import { motion, useInView, useAnimation, Variants } from "framer-motion"
import { AnimationPreset, ANIMATION_VARIANTS, EASING_FUNCTIONS, EasingPreset } from "./animation-presets"

interface AnimateOnScrollProps {
    children: ReactNode
    preset?: AnimationPreset
    duration?: number
    delay?: number
    easing?: EasingPreset
    threshold?: number
    triggerOnce?: boolean
    className?: string
    style?: React.CSSProperties
    as?: keyof JSX.IntrinsicElements
}

export const AnimateOnScroll = ({
    children,
    preset = "fadeUp",
    duration = 0.6,
    delay = 0,
    easing = "easeOut",
    threshold = 0.2,
    triggerOnce = true,
    className,
    style,
    as = "div"
}: AnimateOnScrollProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { 
        once: triggerOnce, 
        amount: threshold 
    })
    const controls = useAnimation()

    useEffect(() => {
        if (isInView) {
            controls.start("animate")
        } else if (!triggerOnce) {
            controls.start("initial")
        }
    }, [isInView, controls, triggerOnce])

    const variants = ANIMATION_VARIANTS[preset]
    const easingValue = EASING_FUNCTIONS[easing]

    const MotionComponent = motion[as as keyof typeof motion] as any

    return (
        <MotionComponent
            ref={ref}
            initial="initial"
            animate={controls}
            variants={{
                initial: variants.initial,
                animate: {
                    ...variants.animate,
                    transition: {
                        duration,
                        delay,
                        ease: typeof easingValue === "object" ? undefined : easingValue,
                        ...(typeof easingValue === "object" ? easingValue : {}),
                    }
                }
            }}
            className={className}
            style={style}
        >
            {children}
        </MotionComponent>
    )
}

// Stagger children animation wrapper
interface StaggerContainerProps {
    children: ReactNode
    staggerDelay?: number
    threshold?: number
    triggerOnce?: boolean
    className?: string
    style?: React.CSSProperties
}

export const StaggerContainer = ({
    children,
    staggerDelay = 0.1,
    threshold = 0.2,
    triggerOnce = true,
    className,
    style
}: StaggerContainerProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: triggerOnce, amount: threshold })
    const controls = useAnimation()

    useEffect(() => {
        if (isInView) {
            controls.start("animate")
        }
    }, [isInView, controls])

    return (
        <motion.div
            ref={ref}
            initial="initial"
            animate={controls}
            variants={{
                initial: {},
                animate: {
                    transition: {
                        staggerChildren: staggerDelay,
                    }
                }
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    )
}

// Stagger item for use inside StaggerContainer
interface StaggerItemProps {
    children: ReactNode
    preset?: AnimationPreset
    duration?: number
    className?: string
    style?: React.CSSProperties
}

export const StaggerItem = ({
    children,
    preset = "fadeUp",
    duration = 0.5,
    className,
    style
}: StaggerItemProps) => {
    const variants = ANIMATION_VARIANTS[preset]

    return (
        <motion.div
            variants={{
                initial: variants.initial,
                animate: {
                    ...variants.animate,
                    transition: { duration }
                }
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    )
}

// Parallax scroll effect
interface ParallaxProps {
    children: ReactNode
    speed?: number // -1 to 1, negative = opposite direction
    className?: string
    style?: React.CSSProperties
}

export const Parallax = ({
    children,
    speed = 0.5,
    className,
    style
}: ParallaxProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [offset, setOffset] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            if (!ref.current) return
            const rect = ref.current.getBoundingClientRect()
            const scrollY = window.scrollY
            const elementTop = rect.top + scrollY
            const relativeScroll = scrollY - elementTop + window.innerHeight
            setOffset(relativeScroll * speed * 0.1)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener("scroll", handleScroll)
    }, [speed])

    return (
        <div ref={ref} className={className} style={style}>
            <motion.div
                style={{ y: offset }}
            >
                {children}
            </motion.div>
        </div>
    )
}

// Text reveal animation (character by character)
interface TextRevealProps {
    text: string
    className?: string
    delay?: number
    duration?: number
    staggerDelay?: number
}

export const TextReveal = ({
    text,
    className,
    delay = 0,
    duration = 0.05,
    staggerDelay = 0.03
}: TextRevealProps) => {
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })
    const controls = useAnimation()

    useEffect(() => {
        if (isInView) {
            controls.start("animate")
        }
    }, [isInView, controls])

    const words = text.split(" ")

    return (
        <motion.span
            ref={ref}
            initial="initial"
            animate={controls}
            variants={{
                initial: {},
                animate: {
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: delay,
                    }
                }
            }}
            className={className}
        >
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block">
                    {word.split("").map((char, charIndex) => (
                        <motion.span
                            key={charIndex}
                            variants={{
                                initial: { opacity: 0, y: 20 },
                                animate: { 
                                    opacity: 1, 
                                    y: 0,
                                    transition: { duration }
                                }
                            }}
                            className="inline-block"
                        >
                            {char}
                        </motion.span>
                    ))}
                    {wordIndex < words.length - 1 && <span>&nbsp;</span>}
                </span>
            ))}
        </motion.span>
    )
}

// Counter animation
interface CounterProps {
    from?: number
    to: number
    duration?: number
    delay?: number
    className?: string
    prefix?: string
    suffix?: string
    decimals?: number
}

export const Counter = ({
    from = 0,
    to,
    duration = 2,
    delay = 0,
    className,
    prefix = "",
    suffix = "",
    decimals = 0
}: CounterProps) => {
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })
    const [count, setCount] = useState(from)

    useEffect(() => {
        if (!isInView) return

        const startTime = Date.now() + delay * 1000
        const endTime = startTime + duration * 1000

        const animate = () => {
            const now = Date.now()
            if (now < startTime) {
                requestAnimationFrame(animate)
                return
            }
            
            const progress = Math.min((now - startTime) / (duration * 1000), 1)
            const easeProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            const currentValue = from + (to - from) * easeProgress
            
            setCount(currentValue)
            
            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [isInView, from, to, duration, delay])

    return (
        <span ref={ref} className={className}>
            {prefix}{count.toFixed(decimals)}{suffix}
        </span>
    )
}

// Hover animation wrapper
interface HoverAnimateProps {
    children: ReactNode
    effect?: "lift" | "scale" | "glow" | "tilt" | "none"
    className?: string
    style?: React.CSSProperties
}

export const HoverAnimate = ({
    children,
    effect = "lift",
    className,
    style
}: HoverAnimateProps) => {
    const hoverEffects = {
        none: {},
        lift: { y: -8 },
        scale: { scale: 1.05 },
        glow: { boxShadow: "0 20px 40px rgba(0,0,0,0.15)" },
        tilt: { rotateX: 5, rotateY: 5 },
    }

    return (
        <motion.div
            whileHover={hoverEffects[effect]}
            transition={{ duration: 0.2 }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    )
}

// Magnetic effect (element follows cursor slightly)
interface MagneticProps {
    children: ReactNode
    strength?: number
    className?: string
    style?: React.CSSProperties
}

export const Magnetic = ({
    children,
    strength = 0.3,
    className,
    style
}: MagneticProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const x = (e.clientX - centerX) * strength
        const y = (e.clientY - centerY) * strength
        setPosition({ x, y })
    }

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 })
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    )
}
