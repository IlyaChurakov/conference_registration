const value = 'лохотрон, аапа'

const stopWords = ['лох', 'бля']

const regexPattern = `(^|\\s|[^А-я])(${stopWords.join('|')})(\\s|[^А-я]|$)`

const regex = new RegExp(regexPattern, 'i')

console.log(regex.test(String(value)))
