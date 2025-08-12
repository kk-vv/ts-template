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
      const shitfortmatNumer = revertSubSymbol(shitNumber)
      const shitNumberMatchGroups = shitfortmatNumer.match(/0\.0\{(\d+)\}(\d+)/)
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

  export function shitNumber(number: string | number, tailValidNumberCount: number = 4, limitZeroCount: number = 4) {
    let num = 0
    if (typeof (number) === 'string') {
      const value = Number(number)
      if (isNaN(value)) {
        return '0'
      }
      num = value
    } else {
      num = number
    }

    if (num > 1) {
      return removeDecimalTailZeros(num.toFixed(2))
    } else {
      const numStr = num.toString()
      const matchGroups = numStr.match(/(\d)\.(\d+)[e|E]-(\d+)/)
      if (matchGroups && matchGroups.length === 4) { //scientist number
        let tail = matchGroups[1] + matchGroups[2]
        if (tail.length > tailValidNumberCount) {
          tail = tail.substring(0, tailValidNumberCount)
        }
        let fixStr = '0.' + '0'.repeat(Number(matchGroups[3]) - 1) + tail
        if ((Number(matchGroups[3]) - 1) > limitZeroCount) {
          fixStr = '0.0' + `{${Number(matchGroups[3]) - 1}}` + tail
        }
        return removeDecimalTailZeros(fixStr)
      } else {
        const matchGroups = numStr.match(/0\.(0+)([1-9]+[0]*[1-9]+)/)
        if (matchGroups && matchGroups.length === 3) {
          const zeroCount = matchGroups[1].length
          let tail = matchGroups[2]
          if (tail.length > tailValidNumberCount) {
            tail = tail.substring(0, tailValidNumberCount)
          }
          let fixStr = '0.' + '0'.repeat(zeroCount) + tail
          if (zeroCount > limitZeroCount) {
            fixStr = '0.0' + `{${zeroCount}}` + tail
          }
          fixStr = removeDecimalTailZeros(fixStr)
          if (numStr.startsWith('-')) {
            fixStr = '-' + fixStr
          }
          return fixStr
        } else {
          return removeDecimalTailZeros(num.toFixed(tailValidNumberCount))
        }
      }
    }
  }

  export function compactNumber(number: string | number, digits: number = 2) {
    if (number === undefined || number === null) {
      return ''
    }
    let num = 0
    if (typeof (number) === 'string') {
      const value = Number(number)
      if (isNaN(value)) {
        return number
      }
      num = value
    } else {
      num = number
    }
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ]
    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/
    const item = lookup.findLast(item => num >= item.value)
    return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0"
  }

  export function fixToSubSymbol(v: string) {
    const subscriptMap: { [key: string]: string } = {
      '0': '₀',
      '1': '₁',
      '2': '₂',
      '3': '₃',
      '4': '₄',
      '5': '₅',
      '6': '₆',
      '7': '₇',
      '8': '₈',
      '9': '₉'
    }
    return v.replace(/\{(\d+)\}/g, (_, p1: string) => {
      return p1.split('').map(digit => subscriptMap[digit] || digit).join('')
    })
  }

  export function revertSubSymbol(v: string) {
    const subscriptToNormalMap: { [key: string]: string } = {
      '₀': '0',
      '₁': '1',
      '₂': '2',
      '₃': '3',
      '₄': '4',
      '₅': '5',
      '₆': '6',
      '₇': '7',
      '₈': '8',
      '₉': '9'
    }
    return v.replace(/[₀-₉]+/g, (match: string) => {
      const normalDigits = match.split('').map(digit => subscriptToNormalMap[digit] || digit).join('')
      return `{${normalDigits}}`
    })
  }

  export function toTradingViewNumber(text: string | number, tailValidNumberCount: number = 4, limitZeroCount: number = 4) {
    return fixToSubSymbol(shitNumber(text, tailValidNumberCount, limitZeroCount))
  }

  export function groupBy3Numbers(text: string | number | undefined | null) {
    if (text !== undefined && text !== null) {
      let valueString = ''
      if (typeof (text) === 'number') {
        valueString = deformatNumberToPureString(text.toString())
      } else {
        valueString = text
      }
      if (valueString.includes('.')) {
        const left = valueString.split('.')[0]
        const right = valueString.split('.')[1]
        return left.replace(/(?<=\d)(?=(\d\d\d)+(?!\d))/g, ',') + '.' + right
      } else {
        return valueString.replace(/(?<=\d)(?=(\d\d\d)+(?!\d))/g, ',')
      }
    }
    return ''
  }

  export function removeDecimalTailZeros(text: string) {
    return text.replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/, "")
  }

  export function formatTokenPrice(price: string | number | undefined | null, placeholder: string = '--') {
    if (price !== undefined && price !== null) {
      return '$' + shitNumber(price)
    }
    return placeholder
  }

  ///with currency symbol compact by k M B T P E 
  export function formatMCap(amount: string | number | undefined | null, symbol: string = '$', placeholder: string = '--') {
    if (amount !== undefined && amount !== null) {
      return symbol + formatQuantity(amount)
    }
    return placeholder
  }

  /// compact by k M B T P E or shitnumber
  export function formatQuantity(balance: string | number | undefined | null, placeholder: string = '--') {
    if (balance !== undefined && balance !== null) {
      let num = 0
      if (typeof (balance) === 'string') {
        const value = Number(balance)
        if (isNaN(value)) {
          return '0'
        }
        num = value
      } else {
        num = balance
      }

      if (num > 1) {
        return compactNumber(balance, 2)
      } else {
        return shitNumber(num)
      }
    }
    return placeholder
  }

  export function formatTokenSupply(supply: string | number) {
    return compactNumber(supply, 0)
  }

}