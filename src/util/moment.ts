import moment from "moment"

export interface OptionsData {
  day?: number
  month?: number
  year?: number
}

export function dateFix(options: OptionsData, format: string = 'YYYY-MM-DD') {
  const year = options.year ?? moment().year()
  const month = options.month ?? moment().month()
  const day = Math.min(
    Number(options.day ?? moment().day()), 
    moment({
      year,
      month,
      day: 1,
    }).daysInMonth()
  )

  return moment({
    year,
    month,
    day,
  }).format(format)
}