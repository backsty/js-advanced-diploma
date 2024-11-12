import { test, expect, describe } from '@jest/globals';
import { calcTileType } from '../utils.js';

describe('calcTileType', () => {
    const boardSize = 8;

    test('should return top-left for index 0', () => {
        expect(calcTileType(0, boardSize)).toBe('top-left');
    });

    test('should return top-right for index 7', () => {
        expect(calcTileType(7, boardSize)).toBe('top-right');
    });

    test('should return bottom-left for index 56', () => {
        expect(calcTileType(56, boardSize)).toBe('bottom-left');
    });

    test('should return bottom-right for index 63', () => {
        expect(calcTileType(63, boardSize)).toBe('bottom-right');
    });

    test('should return top for top edge', () => {
        expect(calcTileType(3, boardSize)).toBe('top');
    });

    test('should return bottom for bottom edge', () => {
        expect(calcTileType(59, boardSize)).toBe('bottom');
    });

    test('should return left for left edge', () => {
        expect(calcTileType(16, boardSize)).toBe('left');
    });

    test('should return right for right edge', () => {
        expect(calcTileType(23, boardSize)).toBe('right');
    });

    test('should return center for center position', () => {
        expect(calcTileType(18, boardSize)).toBe('center');
    });
});