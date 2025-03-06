"use client"

import type React from "react"

import { useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

interface ClipboardHelperProps {
  editorRef: React.MutableRefObject<any>
}

export default function ClipboardHelper({ editorRef }: ClipboardHelperProps) {
  useEffect(() => {
    // Función para mejorar la experiencia de copiar y pegar
    const enhanceClipboardFunctionality = () => {
      if (!editorRef.current) return

      // Obtener el editor
      const editor = editorRef.current

      // Añadir comandos personalizados
      editor.addCommand(
        // Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.KeyV
        2048 | 52, // Ctrl+V
        () => {
          navigator.clipboard
            .readText()
            .then((text) => {
              // Insertar el texto en la posición actual del cursor
              const selection = editor.getSelection()
              editor.executeEdits("clipboard", [
                {
                  range: selection,
                  text,
                  forceMoveMarkers: true,
                },
              ])
            })
            .catch((err) => {
              console.error("Error al pegar desde el portapapeles:", err)
              toast({
                title: "Error al pegar",
                description: "No se pudo acceder al portapapeles. Intenta usar Ctrl+V.",
                variant: "destructive",
              })
            })
        },
      )

      editor.addCommand(
        // Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.KeyC
        2048 | 33, // Ctrl+C
        () => {
          const selection = editor.getSelection()
          const text = editor.getModel().getValueInRange(selection)

          if (text) {
            navigator.clipboard.writeText(text).catch((err) => {
              console.error("Error al copiar al portapapeles:", err)
              toast({
                title: "Error al copiar",
                description: "No se pudo acceder al portapapeles. Intenta usar Ctrl+C.",
                variant: "destructive",
              })
            })
          }
        },
      )
    }

    // Aplicar la mejora cuando el editor esté disponible
    if (editorRef.current) {
      enhanceClipboardFunctionality()
    }
  }, [editorRef])

  return null
}

