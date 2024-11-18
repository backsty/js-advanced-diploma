import { calcTileType, calcHealthLevel, formatCharacterInfo } from '../utils.js';
import { describe, test, expect } from '@jest/globals';

describe('calcTileType', () => {
  const boardSize = 8;

  // Существующие тесты углов...

  test('should return top for all top edge cells except corners', () => {
      [1, 2, 3, 4, 5, 6].forEach(index => {
          expect(calcTileType(index, boardSize)).toBe('top');
      });
  });

  test('should return bottom for all bottom edge cells except corners', () => {
      [57, 58, 59, 60, 61, 62].forEach(index => {
          expect(calcTileType(index, boardSize)).toBe('bottom');
      });
  });

  test('should return left for all left edge cells except corners', () => {
      [8, 16, 24, 32, 40, 48].forEach(index => {
          expect(calcTileType(index, boardSize)).toBe('left');
      });
  });

  test('should return right for all right edge cells except corners', () => {
      [15, 23, 31, 39, 47, 55].forEach(index => {
          expect(calcTileType(index, boardSize)).toBe('right');
      });
  });

  test('should return center for various center positions', () => {
      [9, 10, 17, 18, 25, 26].forEach(index => {
          expect(calcTileType(index, boardSize)).toBe('center');
      });
  });
});

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

  test('should format different character levels', () => {
    const character = {
      level: 2,
      attack: 25,
      defence: 25,
      health: 100
    };
    expect(formatCharacterInfo(character)).toBe('🎖2 ⚔25 🛡25 ❤100');
  });
});