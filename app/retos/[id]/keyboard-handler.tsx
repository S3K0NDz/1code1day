"use client"

import { useEffect } from "react"

export default function KeyboardHandler({ editorRef }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save/run code
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        // Trigger run code functionality
        document.querySelector('button[title="Ejecutar"]')?.click()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [editorRef])

  return null
}

