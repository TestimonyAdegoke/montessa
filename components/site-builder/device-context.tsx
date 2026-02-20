"use client"

import { createContext, useContext } from "react"

export type DeviceMode = "desktop" | "tablet" | "mobile"

interface DeviceContextValue {
    device: DeviceMode
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
}

const DeviceContext = createContext<DeviceContextValue>({
    device: "desktop",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
})

export const DeviceProvider = ({ device, children }: { device: DeviceMode; children: React.ReactNode }) => {
    const value: DeviceContextValue = {
        device,
        isMobile: device === "mobile",
        isTablet: device === "tablet",
        isDesktop: device === "desktop",
    }
    return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
}

export const useDevice = () => useContext(DeviceContext)

// Helper to get responsive grid classes based on device mode
export const getResponsiveGridClasses = (columns: number, device: DeviceMode) => {
    if (device === "mobile") {
        return "grid-cols-1"
    }
    if (device === "tablet") {
        return columns >= 2 ? "grid-cols-2" : "grid-cols-1"
    }
    // Desktop
    if (columns === 2) return "grid-cols-2"
    if (columns === 3) return "grid-cols-3"
    if (columns === 4) return "grid-cols-4"
    return "grid-cols-1"
}
