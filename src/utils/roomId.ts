/**
 * Generates a clean, memorable temporary room ID in the format RT-XXX-XXX
 */
export function generateRoomId(): string {
  const segment1 = Math.floor(100 + Math.random() * 900);
  const segment2 = Math.floor(100 + Math.random() * 900);
  return `RT-${segment1}-${segment2}`;
}

/**
 * Normalizes user input for room code:
 * - Converts to uppercase
 * - Strips unwanted characters
 * - Inserts standard dash formatting
 */
export function formatRoomCodeInput(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12);
}

/**
 * Validates a room code (supports 6-character alphanumeric like ABC123, RT7K2M, or legacy RT-XXX-XXX)
 */
export function isValidRoomCode(code: string): boolean {
  const trimmed = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return trimmed.length >= 4 && trimmed.length <= 12;
}
