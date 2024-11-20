import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import GameController from '../GameController.js';
import GamePlay from '../GamePlay.js';
import Character from '../Character.js';
import GameStateService from '../GameStateService.js';
import PositionedCharacter from '../PositionedCharacter.js';
import themes from '../themes.js';
import cursors from '../cursors.js';

class TestCharacter extends Character {
    constructor(level) {
        super(level);
        this.attack = 25;
        this.defence = 25;
        this.health = 50;
        this.level = level;
    }
}

describe('GameController', () => {
    let gamePlay;
    let stateService;
    let controller;

    beforeEach(() => {
        gamePlay = new GamePlay();
        stateService = new GameStateService();
        controller = new GameController(gamePlay, stateService);

        gamePlay.drawUi = jest.fn();
        gamePlay.redrawPositions = jest.fn();
        gamePlay.addCellClickListener = jest.fn();
        gamePlay.addCellEnterListener = jest.fn();
        gamePlay.addCellLeaveListener = jest.fn();
        gamePlay.showCellTooltip = jest.fn();
        gamePlay.hideCellTooltip = jest.fn();
        gamePlay.selectCell = jest.fn();
        gamePlay.deselectCell = jest.fn();
        gamePlay.setCursor = jest.fn();
        gamePlay.showDamage = jest.fn().mockResolvedValue();
    });

    describe('constructor', () => {
        test('should throw if gamePlay not provided', () => {
            expect(() => new GameController()).toThrow();
        });

        test('should create with initial state', () => {
            expect(controller.level).toBe(1);
            expect(controller.score).toBe(0);
            expect(controller.selected).toBeNull();
        });
    });

    describe('positions and movement', () => {
        test('should calculate positions array', () => {
            const result = controller.positions();
            expect(result.array.length).toBe(64); // для 8x8 поля
            expect(result.row).toBe(8);
        });

        test('should calculate side positions', () => {
            const positions = controller.sidePositions(controller.sides.player);
            expect(positions).toContain(0);
            expect(positions).toContain(1);
        });

        test('should get valid position from array', () => {
            const side = [1, 2, 3];
            const position = controller.getPosition(side);
            expect(side).not.toContain(position);
            expect(position).toBeGreaterThanOrEqual(1);
            expect(position).toBeLessThanOrEqual(3);
        });

        test('should throw on invalid position input', () => {
            expect(() => controller.getPosition([])).toThrow();
            expect(() => controller.getPosition(['invalid'])).toThrow();
        });
    });

    describe('game mechanics', () => {
        test('should level up correctly', () => {
            const char = new TestCharacter(1);
            controller.positionsToDraw = [
                new PositionedCharacter(char, 'player', 0)
            ];
            const newLevel = controller.levelUp();
            expect(newLevel).toBe(2);
            expect(controller.theme).toBe(themes.desert);
        });
    });

    describe('state management', () => {
        beforeEach(() => {
            jest.spyOn(GamePlay, 'showMessage').mockImplementation(() => {});
            jest.spyOn(GamePlay, 'showError').mockImplementation(() => {});
            
            stateService.storage = {
                setItem: jest.fn()
            };
        });

        afterEach(() => {
            // Очищаем моки после тестов
            jest.restoreAllMocks();
        });

        test('should save game state', () => {
            const char = new TestCharacter(1);
            controller.positionsToDraw = [
                new PositionedCharacter(char, 'player', 0)
            ];
            
            controller.saveGame();
            
            expect(stateService.storage.setItem).toHaveBeenCalled();
            expect(GamePlay.showMessage).toHaveBeenCalledWith('Game saved');
        });

        test('should show error when no game to save', () => {
            controller.positionsToDraw = [];
            
            controller.saveGame();
            
            expect(GamePlay.showError).toHaveBeenCalledWith('No saved games');
            expect(stateService.storage.setItem).not.toHaveBeenCalled();
        });
    });

    describe('event handlers', () => {
        test('should handle cell click on player character', () => {
            const char = new TestCharacter(1);
            const posChar = new PositionedCharacter(char, 'player', 0);
            controller.positionsToDraw = [posChar];
            controller.onCellClick(0);
            expect(controller.selected).toBe(posChar);
            expect(gamePlay.selectCell).toHaveBeenCalledWith(0, 'yellow');
        });

        test('should handle cell enter', () => {
            const char = new TestCharacter(1);
            const posChar = new PositionedCharacter(char, 'player', 0);
            controller.positionsToDraw = [posChar];
            controller.onCellEnter(0);
            expect(gamePlay.showCellTooltip).toHaveBeenCalled();
        });
    });

    describe('attack mechanics', () => {
        test('should handle player attack', async () => {
            const player = new TestCharacter(1);
            const enemy = new TestCharacter(1);
            player.attack = 20;
            enemy.defence = 10;
            
            const posPlayer = new PositionedCharacter(player, 'player', 0);
            const posEnemy = new PositionedCharacter(enemy, 'enemy', 1);
            
            controller.positionsToDraw = [posPlayer, posEnemy];
            controller.selected = posPlayer;
            controller.attacks = [1];
            controller.currentStatus = controller.statuses.enemy;

            await controller.onCellClick(1);
            expect(gamePlay.showDamage).toHaveBeenCalled();
        });

        test('should handle enemy attack', async () => {
            const player = new TestCharacter(1);
            const enemy = new TestCharacter(1);
            
            const posPlayer = new PositionedCharacter(player, 'player', 0);
            const posEnemy = new PositionedCharacter(enemy, 'enemy', 1);
            
            controller.positionsToDraw = [posPlayer, posEnemy];
            controller.selected = posPlayer;

            const result = controller.moveEnemyAttack();
            expect(result).toBeInstanceOf(Promise);
        });
    });

    describe('cell interactions', () => {
        test('should handle cell leave', () => {
            controller.selected = { position: 1 };
            controller.onCellLeave(0);
            
            expect(gamePlay.hideCellTooltip).toHaveBeenCalledWith(0);
            expect(gamePlay.deselectCell).toHaveBeenCalledWith(0);
            expect(gamePlay.setCursor).toHaveBeenCalledWith(cursors.auto);
        });

        test('should not deselect selected cell on leave', () => {
            controller.selected = { position: 1 };
            controller.onCellLeave(1);
            
            expect(gamePlay.deselectCell).not.toHaveBeenCalled();
        });
    });

    describe('area calculations', () => {
        test('should calculate attack area', () => {
            const position = { position: 27 }; // центральная позиция на поле 8x8
            const area = controller.getAreaAttack(position, 2);
            
            expect(area).not.toContain(27); // не включает исходную позицию
            expect(area.length).toBeGreaterThan(0);
        });

        test('should calculate move area', () => {
            const position = { position: 27 };
            const area = controller.getAreaMove(position, 2);
            
            expect(area).not.toContain(27);
            expect(area.length).toBeGreaterThan(0);
        });
    });

    describe('initialization and state', () => {
        test('should initialize with event listeners', () => {
            gamePlay.addCellClickListener = jest.fn();
            gamePlay.addCellEnterListener = jest.fn();
            gamePlay.addCellLeaveListener = jest.fn();
            
            controller.mouseEvents();
            
            expect(gamePlay.addCellClickListener).toHaveBeenCalled();
            expect(gamePlay.addCellEnterListener).toHaveBeenCalled();
            expect(gamePlay.addCellLeaveListener).toHaveBeenCalled();
        });

        test('should load state correctly', () => {
            const state = {
                level: 2,
                positions: [{ position: 0, character: {} }],
                theme: themes.desert,
                score: 100
            };
            
            controller.loadState(state);
            
            expect(controller.level).toBe(2);
            expect(controller.theme).toBe(themes.desert);
            expect(controller.score).toBe(100);
        });

        test('should clear game state', () => {
            controller.level = 2;
            controller.score = 100;
            controller.selected = {};
            
            controller.clear();
            
            expect(controller.level).toBe(1);
            expect(controller.selected).toBeNull();
            expect(controller.theme).toBe(themes.prairie);
        });
    });

    describe('cell enter handling', () => {
        beforeEach(() => {
            const char = new TestCharacter(1);
            char.level = 1;
            char.attack = 10;
            char.defence = 10;
            char.health = 50;
            
            controller.selected = new PositionedCharacter(char, 'player', 0);
        });

        test('should show attack cursor for enemy in range', () => {
            const enemyChar = new TestCharacter(1);

            enemyChar.level = 1;
            enemyChar.attack = 10;
            enemyChar.defence = 10;
            enemyChar.health = 50;

            const enemyPosition = 2;
            const posEnemy = new PositionedCharacter(enemyChar, 'enemy', enemyPosition);

            controller.positionsToDraw = [posEnemy];
            controller.attacks = [enemyPosition];
            controller.getAreaAttack = jest.fn().mockReturnValue([enemyPosition]);
            controller.onCellEnter(enemyPosition);
            
            expect(gamePlay.setCursor).toHaveBeenCalledWith(cursors.crosshair);
            expect(controller.currentStatus).toBe(controller.statuses.enemy);
        });

        test('should show move cursor for empty cell in range', () => {
            const movePosition = 1;

            controller.movements = [movePosition];
            controller.getAreaMove = jest.fn().mockReturnValue([movePosition]);
            
            controller.onCellEnter(movePosition);
            
            expect(gamePlay.setCursor).toHaveBeenCalledWith(cursors.pointer);
            expect(controller.currentStatus).toBe(controller.statuses.freespace);
        });
    });
});