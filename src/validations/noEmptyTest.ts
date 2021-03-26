export const noEmptyTest = {
  name: 'noEmpty',
  message: '${path} is empty or invalid type',
  test: (value: any, _: any) => {
    if ((typeof value !== 'object') || (value === null) || (value === {}) || (value === [])) return false

    let prop = null
    for (prop in value) {}
    if (!prop) return false

    return true
  }
}