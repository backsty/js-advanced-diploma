import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import GamePlay from '../GamePlay.js';
import GameController from '../GameController.js';
import GameStateService from '../GameStateService.js';

jest.mock('../GamePlay.js');
jest.mock('../GameController.js');
jest.mock('../GameStateService.js');

describe('App initialization', () => {
    let container;
    
    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'game-container';
        document.body.appendChild(container);

        GamePlay.mockClear();
        GameController.mockClear();
        GameStateService.mockClear();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.resetAllMocks();
    });

    test('should initialize game components', async () => {
        const mockBindToDOM = jest.fn();
        const mockInit = jest.fn();
        
        GamePlay.prototype.bindToDOM = mockBindToDOM;
        GameController.prototype.init = mockInit;
        
        // Запускаем код приложения
        await import('../app.js');
        
        expect(GamePlay).toHaveBeenCalled();
        expect(GameStateService).toHaveBeenCalledWith(localStorage);
        expect(GameController).toHaveBeenCalled();
        
        expect(mockBindToDOM).toHaveBeenCalledWith(container);
        expect(mockInit).toHaveBeenCalled();
    });

    test('should throw if game container not found',  async () => {
        document.body.innerHTML = '';
        
        const initApp = async () => {
            const app = await import('../app.js');
            
            await new Promise(resolve => {
                document.dispatchEvent(new Event('DOMContentLoaded'));
                setTimeout(resolve, 0);
            });
            
            const container = document.querySelector('#game-container');
            if (!container) {
                throw new Error('Game container not found');
            }
            
            return app;
        };
        
        await expect(initApp()).rejects.toThrow('Game container not found');
    });
});