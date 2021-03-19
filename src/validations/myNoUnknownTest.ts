export const myNoUnknownTest = {
  name: 'myNoUnknown',
  exclusive: true,
  test: (value: any, context: any) => {
    if (!context.originalValue) return true

    const props = []
    const unknowns = []
    for (const prop in Object(value)) {
      props.push(prop)
    }
    for (const field in context.originalValue) {
      if (props.indexOf(field) === -1) {
        unknowns.push(field)
      }
    }
    if (unknowns.length>0) {
      return context.createError({
        message: 'this field has unspecified keys: ${unknown}',
        path: context.path,
        params: { unknown: unknowns.join(', ') }
      })
    }
    return true
  }
}