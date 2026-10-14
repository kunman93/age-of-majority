export const splitSentences = (text: string): string[] =>
  text.split(/(?<=[.!?])\s+/)
