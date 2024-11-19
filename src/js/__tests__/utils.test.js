import { calcTileType, calcHealthLevel, formatCharacterInfo } from '../utils.js';
import { describe, test, expect } from '@jest/globals';

/* 
(*) План тестирования:

+Тесты для calcTileType:
  - Все угловые случаи
  - Все стороны
  - Центральные клетки
  - Граничные условия

+Тесты для calcHealthLevel:
  - Все уровни здоровья
  - Граничные значения
  
+Тесты для formatCharacterInfo:
  - Разные комбинации параметров
  - Проверка форматирования 
*/

describe('calcTileType', () => {
  const boardSize = 8;

  // Угловые клетки
  test('should return correct corner types', () => {
    expect(calcTileType(0, boardSize)).toBe('top-left');
    expect(calcTileType(boardSize - 1, boardSize)).toBe('top-right');
    expect(calcTileType(boardSize * (boardSize - 1), boardSize)).toBe('bottom-left');
    expect(calcTileType((boardSize * boardSize) - 1, boardSize)).toBe('bottom-right');
  });

  // Верхняя сторона
  test('should return top for top edge', () => {
    for (let i = 1; i < boardSize - 1; i++) {
      expect(calcTileType(i, boardSize)).toBe('top');
    }
  });

  // Нижняя сторона
  test('should return bottom for bottom edge', () => {
    for (let i = boardSize * (boardSize - 1) + 1; i < boardSize * boardSize - 1; i++) {
      expect(calcTileType(i, boardSize)).toBe('bottom');
    }
  });

  // Левая сторона
  test('should return left for left edge', () => {
    for (let i = boardSize; i < boardSize * (boardSize - 1); i += boardSize) {
      expect(calcTileType(i, boardSize)).toBe('left');
    }
  });

  // Правая сторона
  test('should return left for left edge', () => {
    for (let i = boardSize * 2 - 1; i < boardSize * (boardSize - 1); i += boardSize) {
      expect(calcTileType(i, boardSize)).toBe('right');
    }
  });

  // Центральные клетки
  test('should return center for center cells', () => {
    const centerIndexes = [9, 10, 17, 18, 25, 26, 33, 34, 41,42, 49, 50];
    centerIndexes.forEach((index) => {
      expect(calcTileType(index, boardSize)).toBe('center');
    });
  });
});

describe('calcHealthLevel', () => {
  // Критический уровень здоровья
  test('should return critical for hralth < 15', () => {
    expect(calcHealthLevel(0)).toBe('critical');
    expect(calcHealthLevel(14)).toBe('critical');
    expect(calcHealthLevel(14.9)).toBe('critical');
  });

  // Нормальный уровень здоровья
  test('should return normal for 15 <= health <= 50', () => {
    expect(calcHealthLevel(15)).toBe('normal');
    expect(calcHealthLevel(30)).toBe('normal');
    expect(calcHealthLevel(49)).toBe('normal');
    expect(calcHealthLevel(49.9)).toBe('normal');
  });

  // Высокий уровень здоровья
  test('should return high for health >= 50', () => {
    expect(calcHealthLevel(50)).toBe('high');
    expect(calcHealthLevel(75)).toBe('high');
    expect(calcHealthLevel(100)).toBe('high');
  });
});

describe('formatCharacterInfo', () => {
  test('should format basic character info', () => {
    const character = {
      level: 1,
      attack: 25,
      defence: 25,
      health: 100,
    };
    expect(formatCharacterInfo(character)).toBe('🎖1 ⚔25 🛡25 ❤100');
  });

  test('should format different character info', () => {
    const testCases = [
      {
        input: { level: 2, attack: 40, defence: 10, health: 50 },
        expected: '🎖2 ⚔40 🛡10 ❤50'
      },
      {
        input: { level: 4, attack: 10, defence: 40, health: 1 },
        expected: '🎖4 ⚔10 🛡40 ❤1'
      }
    ];
    
    testCases.forEach(({ input, expected }) => {
      expect(formatCharacterInfo(input)).toBe(expected);
    });
  });
});