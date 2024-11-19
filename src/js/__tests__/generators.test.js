import { describe, test, expect } from '@jest/globals';
import { characterGenerator, generateTeam } from '../generators.js';
import Bowman from '../characters/Bowman.js';

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
            const teamCharacters = generateTeam([Bowman], 1, count);
            
            expect(teamCharacters).toBeDefined();
            expect(Array.isArray(teamCharacters)).toBeTruthy();
            expect(teamCharacters.length).toBe(count);
        });
    
        test('should create team with characters of correct type', () => {
            const teamCharacters = generateTeam([Bowman], 1, 2);
            teamCharacters.forEach(char => {
                expect(char).toBeInstanceOf(Bowman);
            });
        });

        test('should create characters with valid levels', () => {
            const maxLevel = 4;
            const teamCharacters = generateTeam([Bowman], maxLevel, 2);
            const characters = Array.from(teamCharacters);
            
            characters.forEach(char => {
                expect(char.level).toBeGreaterThanOrEqual(1);
                expect(char.level).toBeLessThanOrEqual(maxLevel);
            });
        });
    });
});