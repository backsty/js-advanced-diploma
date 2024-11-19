import PositionedCharacter from '../PositionedCharacter.js';
import Character from '../Character.js';
import { describe, test, expect } from '@jest/globals';

describe('PositionedCharacter', () => {
    class TestCharacter extends Character {}

    test('should create positioned character correctly', () => {
        const char = new TestCharacter(1);
        const positioned = new PositionedCharacter(char, 'good', 1);

        expect(positioned.character).toBe(char);
        expect(positioned.side).toBe('good');
        expect(positioned.position).toBe(1);
    });

    test('should throw when character is not Character instance', () => {
        expect(() => {
            new PositionedCharacter({}, 'good', 1);
        }).toThrow('character must be instance of Character or its children');
    });

    describe('position validation', () => {
        const char = new TestCharacter(1);

        test('should throw on NaN position', () => {
            expect(() => {
                new PositionedCharacter(char, 'good', 'abc');
            }).toThrow('position must be a valid number');
        });

        test('should throw on negative position', () => {
            expect(() => {
                new PositionedCharacter(char, 'good', -1);
            }).toThrow('position must be a non-negative number');
        });

        test('should accept string number position', () => {
            const positioned = new PositionedCharacter(char, 'good', '5');
            expect(positioned.position).toBe(5);
        });
    });

    test('should maintain all required properties', () => {
        const char = new TestCharacter(1);
        const positioned = new PositionedCharacter(char, 'evil', 10);

        expect(positioned).toHaveProperty('character');
        expect(positioned).toHaveProperty('side');
        expect(positioned).toHaveProperty('position');
    });
});