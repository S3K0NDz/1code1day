"use client"

import { useEffect, useRef } from "react"

interface CodeOutputProps {
  value: string
  height?: string
}

export function CodeOutput({ value, height = "300px" }: CodeOutputProps) {
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.innerHTML = value
      // Scroll to bottom
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [value])

  return (
    <div
      ref={outputRef}
      className="font-mono text-sm bg-black/50 p-4 rounded-md overflow-auto"
      style={{ height, maxHeight: height }}
    />
  )
}

