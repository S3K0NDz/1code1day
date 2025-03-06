"use client"

import type React from "react"

import { useEffect } from "react"

interface KeyboardHandlerProps {
  editorRef: React.MutableRefObject<any>
}

export default function KeyboardHandler({ editorRef }: KeyboardHandlerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Si el editor no está inicializado, no hacer nada
      if (!editorRef.current) return

      // Permitir Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z, Ctrl+Y
      if (e.ctrlKey || e.metaKey) {
        // Estos eventos se manejarán por el navegador y Monaco
        return
      }
    }

    // Añadir el event listener
    window.addEventListener("keydown", handleKeyDown)

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [editorRef])

  return null
}

