import GameController from "../GameController.js";
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { Bowman, Swordsman, Magician } from "../characters/index.js";
import { Daemon, Vampire, Undead } from "../characters/index.js";
import PositionedCharacter from "../PositionedCharacter.js";
import { formatCharacterInfo } from "../utils.js";

describe("GameController", () => {
    let gamePlay;
    let stateService;
    let gameCtrl;
    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Daemon, Vampire, Undead];

    beforeEach(() => {
        gamePlay = {
            drawUi: jest.fn(),
            redrawPositions: jest.fn(),
            addCellEnterListener: jest.fn(),
            addCellLeaveListener: jest.fn(),
            deselectCell: jest.fn(),
            boardSize: 8,
            cells: Array(64).fill(null)
        };
        stateService = {
            save: jest.fn(),
            load: jest.fn()
        };
        gameCtrl = new GameController(gamePlay, stateService);
    });

    test('should generate teams with correct positions', () => {
        gameCtrl.init();
        const positions = gameCtrl.getPositions();

        // Проверяем позиции игрока (столбцы 0-1)
        const playerPositions = positions
            .filter(pos => playerTypes.some(type => pos.character instanceof type))
            .map(pos => pos.position % 8);

        expect(playerPositions.length).toBeGreaterThan(0);
        playerPositions.forEach(pos => {
            expect(pos).toBeLessThanOrEqual(1);
        });

        // Проверяем позиции врагов (столбцы 6-7)
        const enemyPositions = positions
            .filter(pos => enemyTypes.some(type => pos.character instanceof type))
            .map(pos => pos.position % 8);

        expect(enemyPositions.length).toBeGreaterThan(0);
        enemyPositions.forEach(pos => {
            expect(pos).toBeGreaterThanOrEqual(6);
        });

        expect(gamePlay.addCellEnterListener).toHaveBeenCalled();
        expect(gamePlay.addCellLeaveListener).toHaveBeenCalled();
    });

    test('should not place characterin same cell', () => {
        gameCtrl.init();
        const positions = gameCtrl.getPositions();
        const uniquePositions = new Set(positions.map(pos => pos.position));
        expect(uniquePositions.size).toBe(positions.length);
    });

    describe('cell hover handling', () => {
        beforeEach(() => {
            gamePlay.showCellTooltip = jest.fn();
            gamePlay.hideCellTooltip = jest.fn();
            gameCtrl.init();
        });

        test('should show tooltip when hovering over character', () => {
            const testCharcter = new Bowman(1);
            const position = 0;
            gameCtrl.positions = [
                new PositionedCharacter(testCharcter, position) 
            ];

            gameCtrl.onCellEnter(position);

            expect(gamePlay.showCellTooltip).toHaveBeenCalledWith(
                expect.stringContaining('🎖1'),
                position
            );
        });

        test('should not show tooltip when hovering over empty cell', () => {
            gameCtrl.onCellEnter(0);
            expect(gamePlay.showCellTooltip).not.toHaveBeenCalled();
        });

        test('should hide tooltip on cell leave', () => {
            gameCtrl.onCellLeave(0);
            expect(gamePlay.hideCellTooltip).toHaveBeenCalledWith(0);
        });
    });

    describe('character info formatting', () => {
        test('should format Bowman stats correctly', () => {
            const bowman = new Bowman(1);
            const formatted = formatCharacterInfo(bowman);

            expect(formatted).toMatch(/🎖1/);
            expect(formatted).toMatch(/⚔25/);
            expect(formatted).toMatch(/🛡25/);
            expect(formatted).toMatch(/❤50/);
        });
        test('should format different character levels', () => {
            const swordsman = new Swordsman(2);
            const formatted = formatCharacterInfo(swordsman);
            
            expect(formatted).toMatch(/🎖2/);
        });
    });

    describe('initialization', () => {
        test('should subscribe to cell events', () => {
            gameCtrl.init();
            
            expect(gamePlay.addCellEnterListener).toHaveBeenCalledWith(gameCtrl.onCellEnter);
            expect(gamePlay.addCellLeaveListener).toHaveBeenCalledWith(gameCtrl.onCellLeave);
        });
    
        test('should draw initial game state', () => {
            gameCtrl.init();
            
            expect(gamePlay.drawUi).toHaveBeenCalledWith('prairie');
            expect(gamePlay.redrawPositions).toHaveBeenCalled();
        });
    });
});