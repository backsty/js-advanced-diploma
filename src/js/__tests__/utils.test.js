import { formatCharacterInfo } from '../utils.js';
import { describe, test, expect } from '@jest/globals';

describe('formatCharacterInfo', () => {
  test('should format character info correctly', () => {
    const character = {
      level: 1,
      attack: 10,
      defence: 40,
      health: 50
    };

    expect(formatCharacterInfo(character)).toBe('🎖1 ⚔10 🛡40 ❤50');
  });
});