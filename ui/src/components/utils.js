import Defaults from "./defaults";

const moment = require("moment");

export const createGUID = () => {
  var d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r && 0x3 | 0x8)).toString(16);
  });
}

export const defaultName = (author) => {
  try {
    return author.names.find(n => n.language === Defaults.language).value
  } catch (error) {
    return author.names[0].value
  }
}



export const titleCase = (string) => (
  string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
)

export const normCertainty = (cert) => {
  const normalization = {
    CERTAIN: 'Certain',
    POSSIBLE: 'Possible',
    DUBIOUS: 'Dubious',
    FALSE: 'False',
    UNKNOWN: 'Unknown',
  }
  return normalization[cert]
}

export const formatDates = (dates) => {

  const monthName = (month) => (moment().month(month).format('MMMM'))
  const dayName = (day) => (moment().date(day).format('Do'))
  const formattedDates = (dates) => (
    dates.map(date => {
      const month = date.month ? date.month.value : undefined
      const day = date.day ? date.day.value : undefined
      let datePrefix = []
      datePrefix += dates.length === 1 && date.type === 'END' ? 'before ' : ''
      datePrefix += dates.length === 1 && date.type === 'START' ? 'after ' : ''
      datePrefix += date.approximate ? 'around ' : ''
      const dateSuffix = date.uncertain ? '?' : ''

      let dateFormatter = []
      if (month !== undefined) {
        dateFormatter.push(monthName(month))
      }
      if (day !== undefined) {
        dateFormatter.push(dayName(day))
      }
      dateFormatter.push(date.year.value)

      return {
        formatted: datePrefix + dateFormatter.join(' ') + dateSuffix,
        type: date.type
      }
    })
  )
  const joinDates = (dates) => {
    if (dates.length === 1) {
      return dates[0].formatted
    } else {
      const start = dates.find(x => x.type === 'START')
      const end = dates.find(x => x.type === 'END')
      if (start && end) {
        return [start.formatted, end.formatted].join(' to ')
      } else {
        console.warn("Problem rendering date: ", start, end)
        return 'Problem rendering the dating.'
      }
    }
  }

  return (joinDates(formattedDates(dates)))
}

export const itemEventDatings = (item, type) => {
  if (item.events.length > 0) {
    const event = item.events.find(d => d.type === type)
    return (event && event.datings) || []
  }
  return []
}
