import { describe, test, expect } from '@jest/globals';
import { characterGenerator, generateTeam } from '../generators.js';
import Bowman from '../characters/Bowman.js';

describe('generateTeam', () => {
    test('characterGenerator should generate characters infinitely', () => {
        const generator = characterGenerator([Bowman], 3);
        const char1 = generator.next().value;
        const char2 = generator.next().value;

        expect(char1).toBeInstanceOf(Bowman);
        expect(char2).toBeInstanceOf(Bowman);
    });

    test('generateTeam should create team with correct count', () => {
        const team = generateTeam([Bowman], 1, 2);

        expect(team.characters.length).toBe(2);
    });
});