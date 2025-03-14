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
      className="font-mono text-sm text-gray-300 bg-gradient-to-b from-[#121212] to-[#1a1a1a] p-4 rounded-md overflow-auto shadow-inner border border-gray-800/50"
      style={{ height, maxHeight: height }}
    />
  )
}

