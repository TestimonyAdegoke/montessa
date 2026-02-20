// Advanced Animation Presets for Site Builder
// Inspired by Framer's animation system

export type AnimationPreset = 
    | "none"
    | "fade"
    | "fadeUp"
    | "fadeDown"
    | "fadeLeft"
    | "fadeRight"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "zoom"
    | "zoomIn"
    | "zoomOut"
    | "flip"
    | "flipX"
    | "flipY"
    | "rotate"
    | "bounce"
    | "elastic"
    | "blur"
    | "scale"
    | "skew"
    | "parallax"
    | "stagger"
    | "typewriter"
    | "reveal"
    | "morph"

export type EasingPreset =
    | "linear"
    | "easeIn"
    | "easeOut"
    | "easeInOut"
    | "spring"
    | "bounce"
    | "elastic"

export interface AnimationConfig {
    preset: AnimationPreset
    duration: number
    delay: number
    easing: EasingPreset
    staggerChildren?: number
    repeat?: number | "infinite"
    repeatDelay?: number
    direction?: "normal" | "reverse" | "alternate"
}

// Framer Motion variants for each preset
export const ANIMATION_VARIANTS: Record<AnimationPreset, {
    initial: any
    animate: any
    exit?: any
}> = {
    none: {
        initial: {},
        animate: {},
    },
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    fadeUp: {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -40 },
    },
    fadeDown: {
        initial: { opacity: 0, y: -40 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 40 },
    },
    fadeLeft: {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
    },
    fadeRight: {
        initial: { opacity: 0, x: -40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 40 },
    },
    slideUp: {
        initial: { y: 100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -100, opacity: 0 },
    },
    slideDown: {
        initial: { y: -100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 100, opacity: 0 },
    },
    slideLeft: {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 },
    },
    slideRight: {
        initial: { x: -100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 100, opacity: 0 },
    },
    zoom: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
    },
    zoomIn: {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.5, opacity: 0 },
    },
    zoomOut: {
        initial: { scale: 1.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.5, opacity: 0 },
    },
    flip: {
        initial: { rotateY: 90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0 },
    },
    flipX: {
        initial: { rotateX: 90, opacity: 0 },
        animate: { rotateX: 0, opacity: 1 },
        exit: { rotateX: -90, opacity: 0 },
    },
    flipY: {
        initial: { rotateY: 90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0 },
    },
    rotate: {
        initial: { rotate: -180, opacity: 0 },
        animate: { rotate: 0, opacity: 1 },
        exit: { rotate: 180, opacity: 0 },
    },
    bounce: {
        initial: { y: -50, opacity: 0 },
        animate: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 10
            }
        },
    },
    elastic: {
        initial: { scale: 0, opacity: 0 },
        animate: { 
            scale: 1, 
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 8
            }
        },
    },
    blur: {
        initial: { filter: "blur(20px)", opacity: 0 },
        animate: { filter: "blur(0px)", opacity: 1 },
        exit: { filter: "blur(20px)", opacity: 0 },
    },
    scale: {
        initial: { scale: 0 },
        animate: { scale: 1 },
        exit: { scale: 0 },
    },
    skew: {
        initial: { skewX: 20, opacity: 0 },
        animate: { skewX: 0, opacity: 1 },
        exit: { skewX: -20, opacity: 0 },
    },
    parallax: {
        initial: { y: 100 },
        animate: { y: 0 },
    },
    stagger: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    },
    typewriter: {
        initial: { width: 0 },
        animate: { width: "100%" },
    },
    reveal: {
        initial: { clipPath: "inset(0 100% 0 0)" },
        animate: { clipPath: "inset(0 0% 0 0)" },
    },
    morph: {
        initial: { borderRadius: "0%" },
        animate: { borderRadius: "50%" },
    },
}

// Easing functions for Framer Motion
export const EASING_FUNCTIONS: Record<EasingPreset, any> = {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: { type: "spring", stiffness: 100, damping: 10 },
    bounce: { type: "spring", stiffness: 300, damping: 10 },
    elastic: { type: "spring", stiffness: 200, damping: 8 },
}

// Scroll-triggered animation options
export interface ScrollAnimationConfig {
    triggerOnce: boolean
    threshold: number // 0-1, percentage of element visible
    rootMargin: string // e.g., "-100px"
}

// Hover animation presets
export const HOVER_ANIMATIONS = {
    none: {},
    lift: { y: -8, transition: { duration: 0.2 } },
    scale: { scale: 1.05, transition: { duration: 0.2 } },
    glow: { boxShadow: "0 0 30px rgba(var(--primary), 0.3)", transition: { duration: 0.2 } },
    tilt: { rotateX: 5, rotateY: 5, transition: { duration: 0.2 } },
    shake: { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4 } },
    pulse: { scale: [1, 1.05, 1], transition: { duration: 0.3 } },
    bounce: { y: [0, -10, 0], transition: { duration: 0.3 } },
}

// Click/tap animation presets
export const TAP_ANIMATIONS = {
    none: {},
    press: { scale: 0.95 },
    shrink: { scale: 0.9 },
    push: { y: 2 },
    ripple: { scale: 0.98, opacity: 0.8 },
}

// Continuous animations (for decorative elements)
export const CONTINUOUS_ANIMATIONS = {
    float: {
        y: [0, -10, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    pulse: {
        scale: [1, 1.05, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    spin: {
        rotate: 360,
        transition: { duration: 8, repeat: Infinity, ease: "linear" }
    },
    bounce: {
        y: [0, -20, 0],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    swing: {
        rotate: [-5, 5, -5],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    shimmer: {
        backgroundPosition: ["200% 0", "-200% 0"],
        transition: { duration: 3, repeat: Infinity, ease: "linear" }
    },
    wave: {
        y: [0, -5, 0, 5, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
}

// Page transition presets
export const PAGE_TRANSITIONS = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 }
    },
    slideUp: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 },
        transition: { duration: 0.3 }
    },
    slideRight: {
        initial: { x: -20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 20, opacity: 0 },
        transition: { duration: 0.3 }
    },
    scale: {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.05, opacity: 0 },
        transition: { duration: 0.3 }
    },
}

// Helper to generate animation props
export function getAnimationProps(config: Partial<AnimationConfig>) {
    const preset = config.preset || "fade"
    const variants = ANIMATION_VARIANTS[preset]
    const easing = config.easing ? EASING_FUNCTIONS[config.easing] : EASING_FUNCTIONS.easeOut

    return {
        initial: variants.initial,
        animate: variants.animate,
        exit: variants.exit,
        transition: {
            duration: config.duration || 0.5,
            delay: config.delay || 0,
            ease: typeof easing === "object" ? undefined : easing,
            ...(typeof easing === "object" ? easing : {}),
        },
    }
}

// Stagger children helper
export function getStaggerProps(staggerDelay: number = 0.1) {
    return {
        animate: {
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    }
}
