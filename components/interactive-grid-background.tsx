"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface InteractiveGridBackgroundProps {
  children: React.ReactNode
  className?: string
}

export default function InteractiveGridBackground({ children, className }: InteractiveGridBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const translateX = mousePosition.x * 10
  const translateY = mousePosition.y * 10

  const gridStyle = {
    backgroundSize: "50px 50px",
    backgroundImage: `
      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
    `,
    backgroundPosition: `${translateX}px ${translateY}px`,
    transition: "background-position 0.1s ease-out",
  }

  return (
    <div ref={containerRef} className={cn("min-h-screen dark:bg-black", className)} style={gridStyle}>
      {children}
    </div>
  )
}

