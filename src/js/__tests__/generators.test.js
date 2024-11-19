import { describe, test, expect } from '@jest/globals';
import { characterGenerator, generateTeam } from '../generators.js';
import Bowman from '../characters/Bowman.js';
import Team from '../Team.js';

describe('Generator Tests', () => {
    describe('characterGenerator', () => {
        test('should generate character of correct type', () => {
            const generator = characterGenerator([Bowman], 1);
            const generated = generator.next().value;
            
            expect(generated).toBeDefined();
            expect(generated.character).toBeInstanceOf(Bowman);
        });

        test('should generate character with level in range', () => {
            const maxLevel = 4;
            const generator = characterGenerator([Bowman], maxLevel);
            const generated = generator.next().value;
            
            expect(generated.level).toBeGreaterThanOrEqual(1);
            expect(generated.level).toBeLessThanOrEqual(maxLevel);
        });

        test('should generate characters continuously', () => {
            const generator = characterGenerator([Bowman], 1);
            const results = [
                generator.next().value,
                generator.next().value,
                generator.next().value
            ];
            
            results.forEach(result => {
                expect(result.character).toBeInstanceOf(Bowman);
            });
        });
    });

    describe('generateTeam', () => {
        test('should create team with specified count', () => {
            const count = 3;
            const team = generateTeam([Bowman], 1, count);
            
            expect(team).toBeDefined();
            expect(team instanceof Team).toBeTruthy();
            expect(team.characters.size).toBe(count);
        });

        test('should create team with characters of correct type', () => {
            const team = generateTeam([Bowman], 1, 2);
            const characters = team.toArray(team);
            
            characters.forEach(char => {
                expect(char).toBeInstanceOf(Bowman);
            });
        });

        test('should create characters with valid levels', () => {
            const maxLevel = 4;
            const team = generateTeam([Bowman], maxLevel, 2);
            const characters = team.toArray(team);
            
            characters.forEach(char => {
                expect(char.level).toBeGreaterThanOrEqual(1);
                expect(char.level).toBeLessThanOrEqual(maxLevel);
            });
        });

        test('should handle empty allowed types array', () => {
            expect(() => generateTeam([], 1, 1)).toThrow();
        });

        test('should handle invalid count', () => {
            expect(() => generateTeam([Bowman], 1, 0)).toThrow();
            expect(() => generateTeam([Bowman], 1, -1)).toThrow();
        });
    });
});