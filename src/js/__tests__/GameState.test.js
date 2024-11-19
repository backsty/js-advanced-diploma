import { test, expect, describe } from '@jest/globals';
import GameState from '../GameState.js';


describe('GameState', () => {
    describe('constructor', () => {
        test('should create with player first step', () => {
            const state = new GameState();
            expect(state.currentStep).toBe('player');
        });
    });

    describe('from static method', () => {
        test('should return null for non-object inputs', () => {
            expect(GameState.from('string')).toBeNull();
            expect(GameState.from(123)).toBeNull();
            expect(GameState.from(null)).toBeNull();
            expect(GameState.from(undefined)).toBeNull();
            expect(GameState.from(true)).toBeNull();
            expect(GameState.from([])).toBeNull();
            expect(GameState.from(() => {})).toBeNull();
        });

        test('should create state from valid object', () => {
            const input = {
                level: 1,
                positionsToDraw: [1, 2, 3],
                theme: 'dark',
                score: 100
            };

            expect(GameState.from(input)).toEqual({
                level: 1,
                positions: [1, 2, 3],
                theme: 'dark',
                score: 100
            });
        });

        test('should create state from valid object', () => {
            const input = {
                level: 1,
                positionsToDraw: []
            };

            expect(GameState.from(input)).toEqual({
                level: 1,
                positions: [],
                theme: undefined,
                score: undefined
            });
        });

        test('should handle empty object', () => {
            expect(GameState.from({})).toEqual({
                level: undefined,
                positions: undefined,
                theme: undefined,
                score: undefined
            });
        });
    });
});