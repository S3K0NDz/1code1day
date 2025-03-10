"use client"

import { useState, useEffect } from "react"

export function AnimatedLogo() {
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [cursorPosition, setCursorPosition] = useState(1) // 1 = después de text1, 2 = después de text2
  const [isComplete, setIsComplete] = useState(false)

  const fullText1 = "1code"
  const fullText2 = "1day"

  useEffect(() => {
    let timeout: NodeJS.Timeout

    // Primera parte del logo
    if (text1.length < fullText1.length) {
      timeout = setTimeout(() => {
        setText1(fullText1.slice(0, text1.length + 1))
      }, 150) // Velocidad de escritura
    }
    // Segunda parte del logo
    else if (text2.length < fullText2.length) {
      setCursorPosition(2)
      timeout = setTimeout(() => {
        setText2(fullText2.slice(0, text2.length + 1))
      }, 150) // Velocidad de escritura
    }
    // Animación completa
    else if (!isComplete) {
      setIsComplete(true)
      // Ocultar el cursor después de completar la animación
      setTimeout(() => {
        setShowCursor(false)
      }, 1500)
    }

    return () => clearTimeout(timeout)
  }, [text1, text2, isComplete, fullText1, fullText2])

  return (
    <div className="flex items-center relative">
      <div className="bg-white text-black px-3 py-1 sm:px-4 sm:py-2 text-2xl sm:text-3xl font-bold">{text1}</div>
      <div className="text-white text-2xl sm:text-3xl font-bold px-1 sm:px-2">{text2}</div>
      {showCursor && (
        <div
          className={`absolute h-6 sm:h-8 w-0.5 bg-white animate-blink`}
          style={{
            left:
              cursorPosition === 1
                ? `calc(${text1.length} * 0.6rem + 1.5rem)`
                : `calc(${text1.length} * 0.6rem + ${text2.length} * 0.6rem + 2.5rem)`,
            bottom: "0.5rem",
          }}
        />
      )}
    </div>
  )
}

