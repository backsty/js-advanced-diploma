import Team from '../Team.js';
import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Team', () => {
    let team;

    beforeEach(() => {
        team = new Team();
    });

    test('should have size of 0 when created', () => {
        expect(team.characters.size).toBe(0);
    });

    test('should throw error when adding undefined character', () => {
        expect(() => team.add(undefined)).toThrow();
    });

    test('should throw error when adding null character', () => {
        expect(() => team.add(null)).toThrow();
    });

    test('should add character successfully', () => {
        const char = { name: 'Bowman' };
        team.add(char);
        expect(team.characters.size).toBe(1);
        expect(team.characters.has(char)).toBeTruthy();
    });

    test('should throw when adding duplicate character', () => {
        const char = { name: 'Bowman' };
        team.add(char);
        expect(() => team.add(char)).toThrow('Character already exists');
    });

    test('should add multiple unique characters via addAll', () => {
        const char1 = { name: 'Bowman' };
        const char2 = { name: 'Swordsman' };
        team.addAll(char1, char2);
        expect(team.characters.size).toBe(2);
    });

    test('should convert to array correctly', () => {
        const char1 = { name: 'Bowman' };
        const char2 = { name: 'Swordsman' };
        team.addAll(char1, char2);
        team.toArray();

        expect(Array.isArray(team.characters)).toBeTruthy();
        expect(team.characters.length).toBe(2);
        expect(team.characters).toContain(char1);
        expect(team.characters).toContain(char2);
    });

    test('should handle addAll with empty arguments', () => {
        expect(() => team.addAll()).toThrow();
    });

    test('should maintain uniqueness with addAll', () => {
        const char = { name: 'Bowman' };
        team.addAll(char, char, char);
        expect(team.characters.size).toBe(1);
    });
});
