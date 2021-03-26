import moment from "moment"

export interface OptionsData {
  day?: number
  month?: number
  year?: number
}

export function dateFix(options: OptionsData, format: string = 'YYYY-MM-DD') {
  const year = options.year ?? moment().year()
  const month = options.month ?? moment().month()

  /*const test = {
    day: moment().day(), // retorna o mesmo que weekday (exemplo para quinta-feira, retorna 4)
    days: moment().days(),
    daysInMonth: moment().daysInMonth(),
    weekday: moment().weekday(),
    isoweekday: moment().isoWeekday(),
    dayOfYear: moment().dayOfYear(),
    date: moment().date(), // Esse retorna o dia do mês exemplo 25/03/2021, retorna 25
    toDate: moment().toDate(),
  }*/

  const day = Math.min(
    Number(options.day ?? moment().date()), 
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