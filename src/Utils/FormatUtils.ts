import { Hash } from "viem"

export namespace FormatUtils {

  export function toUnits(src: number | string | bigint, decimal: number = 9): bigint {
    return BigInt(quantityMultiplyDecimal(`${src}`, decimal))
  }

  export function fromUnits(src: number | string | bigint, decimal: number = 9): string {
    return quantityDivideDecimal(`${src}`, decimal)
  }

  export function deformatNumberToPureString(shitNumber: string) {
    const scientistMatchGroups = shitNumber.match(/(\d)\.(\d+)[e|E]([-|+])(\d+)/)
    if (scientistMatchGroups && scientistMatchGroups.length === 5) { //scientist number
      const symbol = scientistMatchGroups[3]
      if (symbol === '-') {
        const numberTail = scientistMatchGroups[1] + scientistMatchGroups[2]
        const fixStr = '0.' + '0'.repeat(Number(scientistMatchGroups[4]) - 1) + numberTail
        return fixStr
      } else {
        const numberHead = scientistMatchGroups[1] + scientistMatchGroups[2]
        const fixStr = numberHead + '0'.repeat(Number(scientistMatchGroups[4]) - scientistMatchGroups[2].length)
        return fixStr
      }
    } else {
      const shitNumberMatchGroups = shitNumber.match(/0\.0\{(\d)\}(\d+)/)
      if (shitNumberMatchGroups && shitNumberMatchGroups.length === 3) { //shit number 0.0{5}1234
        const fixStr = '0.' + '0'.repeat(Number(shitNumberMatchGroups[1])) + shitNumberMatchGroups[2]
        return fixStr
      }
    }
    return shitNumber
  }

  export function quantityDivideDecimal(quantity: string, decimal: number) {
    const pureString = deformatNumberToPureString(quantity)
    let numbers = pureString.split('.')[0].replace(/^0+/, "")
    if (numbers.length > 0) {
      const dt = (decimal + 1) - numbers.length
      if (dt > 0) {
        numbers = '0'.repeat(dt) + numbers
      }
      let offset = numbers.length - decimal
      if (offset === 0) {
        offset = 1
      }
      return removeDecimalTailZeros([numbers.substring(0, offset), '.', numbers.substring(offset)].join(''))
    } else {
      return '0'
    }
  }

  export function quantityMultiplyDecimal(quantity: string, decimal: number) {
    const pureString = deformatNumberToPureString(quantity)
    const numbers = pureString.split('.')
    if (numbers.length >= 2) {
      const head = numbers[0]
      const tail = numbers[1]
      const tailDelta = decimal - tail.length
      if (tailDelta <= 0) {
        return (head + tail.substring(0, decimal)).replace(/^0+/, "")
      } else {
        return (head + tail + '0'.repeat(tailDelta)).replace(/^0+/, "")
      }
    } else {
      return numbers[0] + '0'.repeat(decimal)
    }
  }

  export function removeDecimalTailZeros(text: string) {
    return text.replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/, "")
  }

  export function hexToAddress(hex: string): Hash {
    return `0x${hex.slice(-40)}`.toLowerCase() as Hash
  }
}