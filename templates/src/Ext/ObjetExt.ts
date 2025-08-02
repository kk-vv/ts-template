export function convertTo2DArray<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    return [[]]
  }
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export function uniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

export function JSONSerialize(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString() + 'n'
    }
    return value
  })
}

export function JSONDeserialize(json: string) {
  return JSON.parse(json, (key, value) => {
    if (typeof value === 'string' && /^\d+n$/.test(value)) {
      return BigInt(value.slice(0, -1))
    }
    return value
  })
}

export function JSONStringifyWithBigInt(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  })
}