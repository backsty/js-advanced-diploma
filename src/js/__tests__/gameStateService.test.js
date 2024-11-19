import { test, expect, describe, beforeEach } from '@jest/globals';
import GameStateService from '../GameStateService.js';


describe('GameStateService', () => {
    let mockStorage;
    let service;

    beforeEach(() => {
        mockStorage = {
            storage: {},
            setItem: function(key, value) {
                this.storage[key] = value;
            },
            getItem: function(key) {
                return this.storage[key] || null;
            }
        };
        service = new GameStateService(mockStorage);
    });

    test('should create instance with storage', () => {
        expect(service.storage).toBe(mockStorage);
    });

    describe('save method', () => {
        test('should save state to storage', () => {
            const state = { score: 10, level: 1 };
            service.save(state);

            expect(mockStorage.storage.state).toBe(JSON.stringify(state));
        });
    });

    describe('load method', () => {
        test('should load valid state from storage', () => {
            const state = { score: 10, level: 1 };
            mockStorage.setItem('state', JSON.stringify(state));
            
            const loaded = service.load();
            expect(loaded).toEqual(state);
        });

        test('should throw on invalid JSON', () => {
            mockStorage.setItem('state', 'invalid json');
            
            expect(() => service.load()).toThrow('Invalid state');
        });

        test('should throw on null state', () => {
            mockStorage.setItem('state', null);
            
            expect(() => service.load()).toThrow('Invalid state');
        });
    });

    describe('getItem method', () => {
        test('should return value for existing key', () => {
            mockStorage.storage['testKey'] = 'testValue';
            expect(mockStorage.getItem('testKey')).toBe('testValue');
        });

        test('should return null for non-existing key', () => {
            expect(mockStorage.getItem('nonExistentKey')).toBeNull();
        });

        test('should return null for undefined key', () => {
            expect(mockStorage.getItem(undefined)).toBeNull();
        });

        test('should handle numeric keys', () => {
            mockStorage.storage[123] = 'numericKey';
            expect(mockStorage.getItem(123)).toBe('numericKey');
        });

        test('should handle empty string key', () => {
            mockStorage.storage[''] = 'emptyKey';
            expect(mockStorage.getItem('')).toBe('emptyKey');
        });
    });
});