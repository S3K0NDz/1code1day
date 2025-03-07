"use client"

import { useEffect, useRef } from "react"

export function CodeOutput({ value, height = "200px" }) {
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [value])

  return (
    <pre
      ref={outputRef}
      className="p-4 font-mono text-sm overflow-auto whitespace-pre-wrap"
      style={{ height, maxHeight: height }}
    >
      {value}
    </pre>
  )
}

export default CodeOutput

