import { test, expect, describe } from '@jest/globals';
import GameState from '../GameState.js';


describe('GameState', () => {
    test('should create with player first step', () => {
        const state = new GameState();
        expect(state.currentStep).toBe('player');
    });

    test('should return null for invalid object in from()', () => {
        const result = GameState.from('invalid object');
        expect(result).toBeNull();
    });

    test('should restore state from object', () => {
        const data = { currentStep: 'enemy' };
        const state = GameState.from(data);
        expect(state.currentStep).toBe('enemy');
    });
});