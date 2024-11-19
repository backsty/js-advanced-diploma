import { describe, test, expect } from '@jest/globals';
import Character from '../Character.js';

describe('Character', () => {
    // Вспомогательный класс для тестирования
    class TestCharacter extends Character {}

    test('should throw error when instantiating base Character class', () => {
        expect(() => new Character(1)).toThrow('Данный класс нельзя использовать для создания персонажа');
    });

    test('should create character when extending base class', () => {
        const character = new TestCharacter(1);
        expect(character).toBeDefined();
    });

    test('should set default values correctly', () => {
        const character = new TestCharacter(2);
        expect(character.level).toBe(2);
        expect(character.attack).toBe(0);
        expect(character.defence).toBe(0);
        expect(character.health).toBe(50);
        expect(character.type).toBe('generic');
        expect(character.distance).toBe(1);
        expect(character.distanceAttack).toBe(1);
    });

    test('should set custom type', () => {
        const character = new TestCharacter(1, 'custom');
        expect(character.type).toBe('custom');
    });
    
    test('should maintain all properties when creating character', () => {
        const character = new TestCharacter(4, 'test');
        const props = Object.keys(character);
        
        expect(props).toContain('level');
        expect(props).toContain('attack');
        expect(props).toContain('defence');
        expect(props).toContain('health');
        expect(props).toContain('type');
        expect(props).toContain('distance');
        expect(props).toContain('distanceAttack');
    });
});