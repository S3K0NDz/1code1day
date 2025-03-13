// Función para generar datos de series temporales simulados
export function generateTimeSeriesData(timeRange: string, type: string) {
  const data = []
  const now = new Date()
  let points = 0
  let interval = ""

  switch (timeRange) {
    case "7d":
      points = 7
      interval = "day"
      break
    case "30d":
      points = 30
      interval = "day"
      break
    case "90d":
      points = 12
      interval = "week"
      break
    case "1y":
      points = 12
      interval = "month"
      break
    default:
      points = 7
      interval = "day"
  }

  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now)

    if (interval === "day") {
      date.setDate(date.getDate() - i)
    } else if (interval === "week") {
      date.setDate(date.getDate() - i * 7)
    } else if (interval === "month") {
      date.setMonth(date.getMonth() - i)
    }

    let value = 0

    if (type === "users") {
      // Simular crecimiento de usuarios
      value = Math.round(Math.random() * 20 + 5)
    } else if (type === "completions") {
      // Simular completados de retos
      value = Math.round(Math.random() * 50 + 10)
    } else if (type === "revenue") {
      // Simular ingresos
      value = Math.round(Math.random() * 500 + 100)
    }

    data.push({
      date: date.toISOString().split("T")[0],
      value,
    })
  }

  return data
}

