export const itemEventDatings = (item, type) => {
  if (item.events.length > 0) {
    const event = item.events.find(d => d.type === type)
    return (event && event.datings) || []
  }
  return []
}

export const getEventId = (item) => {
  if (item.events && item.events.length > 0) {
    const id = item.events.find(i => i.type === 'WRITTEN').id || undefined
    if (id === undefined) {
      console.warn("The text events did non contain a WRITTEN event.")
    }
    return id
  } else {
    return undefined
  }
}