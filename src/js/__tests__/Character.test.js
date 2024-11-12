import { describe, test, expect } from '@jest/globals';
import Character from '../Character.js';
import Bowman from '../characters/Bowman.js';

describe('Character', () => {
    test('should throw error on new Character()', () => {
        expect(() => new Character(1)).toThrow();
    });

    test('should create instance of Bowman', () => {
        const bowman = new Bowman(1);
        expect(bowman).toBeInstanceOf(Character);
        expect(bowman.attack).toBe(25);
        expect(bowman.defence).toBe(25);
    });
});