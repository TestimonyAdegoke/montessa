"use client"

import { InlineText } from "@/components/settings/inline-text"
import { cn } from "@/lib/utils"
import { Block, PropSchema } from "../types"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useDevice } from "../device-context"

interface CountdownBlockProps {
    block: Block
    onChange: (id: string, props: any) => void
    selected?: boolean
}

export const CountdownBlock = ({ block, onChange, selected }: CountdownBlockProps) => {
    const { isMobile } = useDevice()
    const {
        title,
        subtitle,
        targetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        style = "cards",
        showLabels = true,
        backgroundType = "color",
        backgroundColor = "transparent",
        backgroundGradient,
        paddingTop = "py-24",
        paddingBottom = "py-24"
    } = block.props

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - Date.now()
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            }
        }
        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)
        return () => clearInterval(timer)
    }, [targetDate])

    const handleChange = (key: string, value: any) => {
        onChange(block.id, { ...block.props, [key]: value })
    }

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className={cn(
                "flex flex-col items-center",
                style === "cards" && "bg-card rounded-2xl p-6 shadow-xl border",
                style === "minimal" && "p-4",
                style === "gradient" && "bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6"
            )}
        >
            <motion.span
                key={value}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                    "font-black tabular-nums",
                    isMobile ? "text-4xl" : "text-6xl"
                )}
            >
                {String(value).padStart(2, '0')}
            </motion.span>
            {showLabels && (
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
                    {label}
                </span>
            )}
        </motion.div>
    )

    return (
        <section 
            className={cn(
                "px-6 md:px-12 relative overflow-hidden",
                paddingTop,
                paddingBottom,
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{
                backgroundColor: backgroundType === 'color' ? backgroundColor : undefined,
                background: backgroundType === 'gradient' ? backgroundGradient : undefined
            }}
        >
            <div className="max-w-4xl mx-auto space-y-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                >
                    <InlineText
                        value={subtitle}
                        onChange={(val) => handleChange("subtitle", val)}
                        tagName="span"
                        className="text-primary font-bold tracking-[0.2em] uppercase text-xs"
                        editable={selected}
                    />
                    <InlineText
                        value={title}
                        onChange={(val) => handleChange("title", val)}
                        tagName="h2"
                        className="text-4xl md:text-5xl font-black tracking-tight"
                        editable={selected}
                    />
                </motion.div>

                <div className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-2" : "grid-cols-4"
                )}>
                    <TimeUnit value={timeLeft.days} label="Days" />
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <TimeUnit value={timeLeft.minutes} label="Minutes" />
                    <TimeUnit value={timeLeft.seconds} label="Seconds" />
                </div>
            </div>
        </section>
    )
}

export const countdownBlockSchema: PropSchema[] = [
    { name: "subtitle", label: "Subtitle", type: "text", group: "Content" },
    { name: "title", label: "Title", type: "text", group: "Content" },
    { name: "targetDate", label: "Target Date", type: "text", group: "Content" },
    { name: "showLabels", label: "Show Labels", type: "boolean", group: "Settings" },
    {
        name: "style",
        label: "Style",
        type: "select",
        group: "Style",
        options: [
            { label: "Cards", value: "cards" },
            { label: "Minimal", value: "minimal" },
            { label: "Gradient", value: "gradient" }
        ]
    },
    {
        name: "backgroundType",
        label: "Background Type",
        type: "select",
        group: "Style",
        options: [
            { label: "Solid Color", value: "color" },
            { label: "Gradient", value: "gradient" }
        ]
    },
    { name: "backgroundColor", label: "Background Color", type: "color", group: "Style" },
    { name: "backgroundGradient", label: "Background Gradient", type: "gradient", group: "Style" },
    {
        name: "paddingTop",
        label: "Top Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-16" },
            { label: "Medium", value: "py-24" },
            { label: "Large", value: "py-32" }
        ]
    },
    {
        name: "paddingBottom",
        label: "Bottom Padding",
        type: "select",
        group: "Layout",
        options: [
            { label: "None", value: "py-0" },
            { label: "Small", value: "py-16" },
            { label: "Medium", value: "py-24" },
            { label: "Large", value: "py-32" }
        ]
    }
]
