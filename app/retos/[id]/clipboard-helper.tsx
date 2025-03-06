"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function ClipboardHelper({ editorRef }) {
  const { toast } = useToast()

  useEffect(() => {
    const handleCopy = () => {
      if (editorRef.current) {
        const selection = editorRef.current.getSelection()
        const model = editorRef.current.getModel()
        if (selection && model) {
          const text = model.getValueInRange(selection)
          if (text) {
            navigator.clipboard.writeText(text).then(() => {
              toast({
                title: "Copiado al portapapeles",
                description: "El código seleccionado ha sido copiado",
                duration: 2000,
              })
            })
          }
        }
      }
    }

    document.addEventListener("copy", handleCopy)
    return () => document.removeEventListener("copy", handleCopy)
  }, [editorRef, toast])

  useEffect(() => {
    const handlePaste = (e) => {
      if (editorRef.current && editorRef.current.hasTextFocus()) {
        // Let the editor handle the paste event
        return
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [editorRef])

  return null
}

