/**
 * Wrap plain strings with a specified character.
 */
export function wrap(subject: string, character: string): string {
  return character + subject + character
}
