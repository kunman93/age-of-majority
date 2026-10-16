const isFilledString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== ''

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export function validateFamilies(families: unknown): void {
  if (!Array.isArray(families) || families.length === 0) {
    throw new Error('families must be a non-empty list')
  }
  families.forEach((family, familyIndex) => {
    const label = `family ${familyIndex + 1}`
    if (!isRecord(family) || !isFilledString(family.name)) {
      throw new Error(`${label} needs a name`)
    }
    if (!Array.isArray(family.messages) || family.messages.length === 0) {
      throw new Error(`${label} needs at least one message`)
    }
    family.messages.forEach((message, messageIndex) => {
      const messageLabel = `${label}, message ${messageIndex + 1}`
      if (!isRecord(message) || !isFilledString(message.author)) {
        throw new Error(`${messageLabel} needs an author`)
      }
      if (!isFilledString(message.text)) {
        throw new Error(`${messageLabel} needs a text`)
      }
      if (/^lorem ipsum/i.test(message.text.trim())) {
        throw new Error(`${messageLabel} is still a placeholder text`)
      }
    })
  })
}
