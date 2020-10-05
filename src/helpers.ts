/**
 * Wrap plain strings with a specified character.
 */
export function wrap(subject: ValidValue, character: string): string {
  return character + subject + character
}
