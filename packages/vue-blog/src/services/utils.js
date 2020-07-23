export const TYPE_KEY = Symbol('resourceType')

export function typeAs(type) {
  return (item) => {
    item[TYPE_KEY] = type
    return item
  }
}