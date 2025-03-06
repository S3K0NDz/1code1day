"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function CalendarTest() {
  const [date, setDate] = useState<Date | undefined>(undefined)

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Prueba de Calendario</h1>

      <div className="space-y-4">
        <p>Esta es una página de prueba para verificar que el calendario funciona correctamente.</p>

        <div className="flex flex-col space-y-2">
          <span>Fecha seleccionada: {date ? format(date, "PPP", { locale: es }) : "Ninguna"}</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-4">
          <Button onClick={() => setDate(undefined)} variant="outline">
            Limpiar fecha
          </Button>
        </div>
      </div>
    </div>
  )
}

