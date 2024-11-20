import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import GamePlay from '../GamePlay.js';

describe('GamePlay', () => {
    let gamePlay;
    let container;

    beforeEach(() => {
        gamePlay = new GamePlay();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.resetAllMocks();
    });

    describe('Initialization', () => {
        test('should create with default board size', () => {
            expect(gamePlay.boardSize).toBe(8);
        });

        test('should create with custom board size', () => {
            const customGamePlay = new GamePlay(10);
            expect(customGamePlay.boardSize).toBe(10);
        });
    });

    describe('DOM bunding', () => {
        test('should bind to valid HTMl element', () => {
            expect(() => gamePlay.bindToDOM(container)).not.toThrow();
        });

        test('should throw on invalid container', () => {
            expect(() => gamePlay.bindToDOM({})).toThrow('container is not HTMLElement');
        });

        test('should throw if not bound', () => {
            expect(() => gamePlay.checkBinding()).toThrow('GamePlay not bind to DOM');
        });
    });

    describe('UI drawing', () => {
        beforeEach(() => {
            gamePlay.bindToDOM(container);
        });

        test('should draw board', () => {
            gamePlay.drawUi('theme-name');
            expect(gamePlay.cells.length).toBe(gamePlay.boardSize ** 2);
        });

        test('should add theme class', () => {
            gamePlay.drawUi('theme-name');
            expect(gamePlay.boardEl.classList.contains('theme-name')).toBeTruthy();
        });

        test('should create control buttons', () => {
            gamePlay.drawUi('theme-name');
            expect(gamePlay.newGameEl).toBeDefined();
            expect(gamePlay.saveGameEl).toBeDefined();
            expect(gamePlay.loadGameEl).toBeDefined();
        });
    });

    describe('position drawing', () => {
        beforeEach(() => {
            gamePlay.bindToDOM(container);
            gamePlay.drawUi('theme-name');
        });

        test('should draw character', () => {
            const positions = [{
                position: 1,
                character: {
                    type: 'bowman',
                    health: 50,
                },
            }];

            gamePlay.redrawPositions(positions);
            const cell = gamePlay.cells[1];
            expect(cell.querySelector('.character')).toBeDefined();
        });
    });


    describe('event listeners', () => {
        beforeEach(() => {
            gamePlay.bindToDOM(container);
            gamePlay.drawUi('theme-name');
        });

        test('should call cell click listener', () => {
            const handler = jest.fn();
            gamePlay.addCellClickListener(handler);
            gamePlay.cells[0].click();
            expect(handler).toHaveBeenCalledWith(0);
        });

        test('should call cell enter listener', () => {
            const handler = jest.fn();
            gamePlay.addCellEnterListener(handler);
            gamePlay.cells[0].dispatchEvent(new MouseEvent('mouseenter'));
            expect(handler).toHaveBeenCalledWith(0);
        });

        test('should call cell leave listener', () => {
            const handler = jest.fn();
            gamePlay.addCellLeaveListener(handler);
            gamePlay.cells[0].dispatchEvent(new MouseEvent('mouseleave'));
            expect(handler).toHaveBeenCalledWith(0);
        });

        test('should handle Esc key', () => {
            const handler = jest.fn();
            gamePlay.addEscListener(handler);
            
            expect(typeof gamePlay.escListener).toBe('function');
            
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(event);
            
            expect(handler).toHaveBeenCalled();
        });
    
        test('should prevent default on Esc', () => {
            const handler = jest.fn();
            const preventDefaultMock = jest.fn();
            gamePlay.addEscListener(handler);
            
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            Object.defineProperty(event, 'preventDefault', {
                value: preventDefaultMock
            });
            
            document.dispatchEvent(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });
    });

    describe('cell manipulation', () => {
        beforeEach(() => {
            gamePlay.bindToDOM(container);
            gamePlay.drawUi('theme-name');
        });

        test('should select cell', () => {
            gamePlay.selectCell(0, 'red');
            expect(gamePlay.cells[0].classList.contains('selected-red')).toBeTruthy();
        });

        test('should deselect cell', () => {
            gamePlay.selectCell(0, 'red');
            gamePlay.deselectCell(0);
            expect(gamePlay.cells[0].classList.contains('selected-red')).toBeFalsy();
        });

        test('should desecelt all cells', () => {
            gamePlay.selectCell(0, 'red');
            gamePlay.selectCell(1, 'green');
            gamePlay.deselectAll();
            expect(gamePlay.cells[0].classList.contains('selected')).toBeFalsy();
            expect(gamePlay.cells[1].classList.contains('selected')).toBeFalsy();
        });

        test('should show tooltip', () => {
            gamePlay.showCellTooltip('test message', 0);
            expect(gamePlay.cells[0].title).toBe('test message');
        });

        test('should hide tolltip', () => {
            gamePlay.showCellTooltip('test message', 0);
            gamePlay.hideCellTooltip(0);
            expect(gamePlay.cells[0].title).toBe('');
        });
    });

    describe('damage visualization', () => {
        beforeEach(() => {
            gamePlay.bindToDOM(container);
            gamePlay.drawUi('theme-name');
        });

        test('should show damage', async () => {
            const promise = gamePlay.showDamage(0, 10);
            const damageEl = gamePlay.cells[0].querySelector('.damage');
            expect(damageEl).toBeTruthy();
            expect(damageEl.textContent).toBe('10');

            damageEl.dispatchEvent(new Event('animationend'));
            await promise;

            expect(gamePlay.cells[0].querySelector('.damage')).toBeFalsy();
        });
    });

    describe('cursor management', () => {
        beforeEach(() => {
            gamePlay.bindToDOM(container);
            gamePlay.drawUi('theme-name');
        });

        test('should set cursor', () => {
            gamePlay.setCursor('pointer');
            expect(gamePlay.boardEl.style.cursor).toBe('pointer');
        });
    });

    describe('static methods', () => {
        let alertSpy;

        beforeEach(() => {
            alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        });
    
        afterEach(() => {
            alertSpy.mockRestore();
        });

        test('should show error message', () => {
            GamePlay.showError('test error');
            expect(alertSpy).toHaveBeenCalledWith('test error');
        });

        test('should show info message', () => {
            GamePlay.showMessage('test message');
            expect(alertSpy).toHaveBeenCalledWith('test message');
        });
    });
});
