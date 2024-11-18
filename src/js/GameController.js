import themes from "./themes.js";
import cursors from './cursors.js';
import GamePlay from './GamePlay.js';
import GameState from './GameState.js';
import { generateTeam } from "./generators.js";
import PositionedCharacter from "./PositionedCharacter.js";
import { formatCharacterInfo } from './utils.js';

import Bowman from './characters/Bowman.js';
import Swordsman from './characters/Swordsman.js';
import Magician from './characters/Magician.js';
import Vampire from './characters/Vampire.js';
import Undead from './characters/Undead.js';
import Daemon from './characters/Daemon.js';


export default class GameController {
  constructor(gamePlay, stateService) {
    if (!gamePlay) {
      throw new Error('gamePlay instance is required');
    }
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.sides = {
      player: {
        name: 'player',
        first: 0,
        second: 1,
        characters: [Swordsman, Bowman, Magician],
      },
      enemy: {
        name: 'enemy',
        first: this.gamePlay.boardSize - 1,
        second: this.gamePlay.boardSize - 2,
        characters: [Undead, Vampire, Daemon],
      },
    };
    this.level = 1;
    this.score = 0;
    this.attack = [];
    this.statuses = {
      freespace: 'free space',
      enemy: 'enemy',
      allied: 'allied',
      notallowed: 'notallowed',
    };
    this.movements = [];
    this.selected = null;
    this.currentStatus = null;
    this.positionsToDraw = [];
    this.area = this.getRowArray();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      const loaded = JSON.parse(sessionStorage.getItem('reload'));

      if (loaded) {
        this.loadState(loaded); // Написать метод loadState
      } else {
        this.theme = themes.prairie;
        this.gamePlay.drawUi(this.theme);
      }
    });

    this.mouseEvents();

    window.addEventListener('unload', () => {
      sessionStorage.setItem('reload', JSON.stringify(GameState.from(this)));
    });
  }

  mouseEvents() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addEscListener(this.onEsc.bind(this));

    this.gamePlay.addNewGameListener(this.newGame.bind(this, this.level, this.theme));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
  }

  positions() {
    const positions = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
        positions.push(i);
    }
    return {
        array: positions,
        row: this.gamePlay.boardSize,
        length: positions.length
    };
  }

  sidePositions(side) {
      const field = this.positions();
      return field.array.filter((item) => (
          (item % field.row === side.first) || 
          (item % field.row === side.second)
      )).map((item) => item);
  }

  getPosition(side) {
    if (!Array.isArray(side) || side.length === 0) {
      throw new Error('side must be a non-empty array');
    }
    
    const index = Math.floor(Math.random() * side.length);
    const cell = side[index];
    
    if (typeof cell !== 'number') {
      throw new Error('Invalid cell position');
    }
    
    side.splice(index, 1);
    return cell;
  }

  newGame(level = 1, theme = themes.prairie) {
    this.level = level;
    this.gamePlay.deselectAll();
    this.selected = null;
    this.theme = theme;
    this.gamePlay.drawUi(this.theme);

    if (level === 1) {
      this.positionsToDraw = [];
    }

    const player = Array.from(this.sidePositions(this.sides.player));
    const enemy = Array.from(this.sidePositions(this.sides.enemy));

    if (!this.positionsToDraw.length) {
      const playerTeam = generateTeam([Swordsman, Bowman], level, 2);
      const enemyTeam = generateTeam(this.sides.enemy.characters, level, 2);

      this.positionsToDraw = [
        ...playerTeam.map(item => new PositionedCharacter(
          item, 
          this.sides.player.name, 
          this.getPosition(player)
        )),
        ...enemyTeam.map(item => new PositionedCharacter(
          item, 
          this.sides.enemy.name, 
          this.getPosition(enemy)
        ))
      ].flat();
    } else {
      this.positionsToDraw.forEach((hero) => {
        hero.position = this.getPosition(player);
      });

      const playerFiltered = Array.from(this.sidePositions(this.sides.player))
        .filter((cell) => !this.positionsToDraw.find((hero) => hero.position === cell));
      const survivorsPlayer = this.positionsToDraw.length;
      let playerTeam;

      if (level === 2) {
        playerTeam = generateTeam(this.sides.player.characters, level - 1, 1);
      }

      if (level === 3 || level === 4) {
        playerTeam = generateTeam(this.sides.player.characters, level - 1, 2);
      }

      const enemyTeam = generateTeam(
        this.sides.enemy.characters,
        level, 
        playerTeam.length + survivorsPlayer
      );

      this.positionsToDraw.push(
        playerTeam.map(item => new PositionedCharacter(
          item,
          this.sides.player.name,
          this.getPosition(playerFiltered)
        ))
      );
      this.positionsToDraw.push(
        enemyTeam.map(item => new PositionedCharacter(
          item,
          this.sides.enemy.name,
          this.getPosition(enemy)
        ))
      );
      this.positionsToDraw = this.positionsToDraw.flat();
    }
    this.gamePlay.redrawPositions(this.positionsToDraw);
  }

  saveGame() {
    if (!this.positionsToDraw.length) {
      GamePlay.showError('No saved games');
      return;
    } else {
      const state = GameState.from(this);
      this.stateService.save(state);
      GamePlay.showMessage('Game saved');
    }
  }

  loadGame() {
    const state = this.stateService.load();

    if (!state) {
      GamePlay.showError('No saved games');
      return;
    }
    this.loadState(state);
    GamePlay.showMessage('Game loaded');
  }

  loadState(state) {
    if (!state) {
      return;
    }

    this.gamePlay.deselectAll();
    this.selected = null;

    const { level, positions, theme, score } = state;

    this.level = level || 1;
    this.positionsToDraw = positions;
    this.theme = theme || themes.prairie;
    this.score = score || 0;

    this.gamePlay.drawUi(this.theme);

    if (Array.isArray(this.positionsToDraw) && this.positionsToDraw.length > 0) {
      this.gamePlay.redrawPositions(this.positionsToDraw);
    }
  }

  onEsc() {
    this.clear();
    this.score = 0;
    this.gamePlay.drawUi(this.theme);
  }

  clear() {
    this.level = 1;
    this.positionsToDraw = [];
    this.selected = null;
    this.theme = themes.prairie;
  }

  levelUp() {
    this.level += 1;
    this.positionsToDraw.forEach((hero) => {
      hero.character.level = this.level;
      hero.character.attack = Math.ceil(Math.max(
        hero.character.attack, hero.character.attack * (1.8 - (hero.character.health === 1 ? 80 : hero.character.health) / 100))
      );
      hero.character.defence = Math.ceil(Math.max(
        hero.character.defence, hero.character.defence * (1.8 - (hero.character.health === 1 ? 80 : hero.character.health) / 100))
      );
      hero.character.health = Math.ceil(
        hero.character.health + 80 > 100 ? 100 : hero.character.health + 80
      );
    });

    switch(this.level) {
      case 2:
        this.gamePlay.drawUi(themes.desert);
        this.theme = themes.desert;
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        this.theme = themes.arctic;
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        this.theme = themes.mountain;
        break;
      default:
        this.gamePlay.drawUi(themes.prairie);
        this.theme = themes.prairie;
        break;
    }

    return this.level;
  }

  getRowArray() {
    const area = [];
    let rowArr = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      rowArr.push(i);
      if (rowArr.length === this.gamePlay.boardSize) {
        area.push(rowArr);
        rowArr = [];
      }
    }
    return area;
  }

  getAreaMove(currentPosition, distance) {
    if (!currentPosition || typeof distance === 'undefined') {
      return [];
    }

    const boardSize = this.gamePlay.boardSize;
    const row = currentPosition.position % boardSize;
    const column = Math.floor(currentPosition.position / boardSize);
    const areaMove = [];

    const moveDistance = Number(distance) || 1;

    for (let i = 1; i <= moveDistance; i += 1) {
      // Вправо
      let rightOrLeft = row + i;
      if (rightOrLeft < boardSize && this.area[column]) {
        areaMove.push(this.area[column][rightOrLeft]);
      }
  
      // Вниз
      let upOrDown = column + i;
      if (upOrDown < boardSize && this.area[upOrDown]) {
        areaMove.push(this.area[upOrDown][row]);
      }
  
      // Вправо и вниз по диагонали
      if ((upOrDown < boardSize) && (rightOrLeft < boardSize) && this.area[upOrDown]) {
        areaMove.push(this.area[upOrDown][rightOrLeft]);
      }
  
      // Влево
      rightOrLeft = row - i;
      if (rightOrLeft >= 0 && this.area[column]) {
        areaMove.push(this.area[column][rightOrLeft]);
      }
  
      // Влево и вниз по диагонали
      if ((rightOrLeft >= 0) && (upOrDown < boardSize) && this.area[upOrDown]) {
        areaMove.push(this.area[upOrDown][rightOrLeft]);
      }
  
      // Вверх
      upOrDown = column - i;
      if (upOrDown >= 0 && this.area[upOrDown]) {
        areaMove.push(this.area[upOrDown][row]);
      }
  
      // Влево и вверх по диагонали
      if ((upOrDown >= 0) && (rightOrLeft >= 0) && this.area[upOrDown]) {
        areaMove.push(this.area[upOrDown][rightOrLeft]);
      }
  
      rightOrLeft = row + i;
      // Вправо и вверх по диагонали
      if ((rightOrLeft < boardSize) && (upOrDown >= 0) && this.area[upOrDown]) {
        areaMove.push(this.area[upOrDown][rightOrLeft]);
      }
    }
    
    // Фильтруем невалидные значения
    return areaMove.filter(pos => pos !== undefined && pos >= 0);
  }

  getAreaAttack(currentPosition, distanceAttack) {
    const areaAttack = [];

    for (let i = currentPosition.position - this.gamePlay.boardSize * distanceAttack;
            i <= currentPosition.position + this.gamePlay.boardSize * distanceAttack;
            i += this.gamePlay.boardSize
    ) {
      if ((i >= 0) && (i < this.gamePlay.boardSize ** 2)) {
        for (let j = i - distanceAttack; j <= i + distanceAttack; j += 1) {
          if ((j >= i - (i % this.gamePlay.boardSize)) 
              && (j < i + (this.gamePlay.boardSize - (i % this.gamePlay.boardSize)))
          ) {
            areaAttack.push(j);
          }
        }
      }
    }
    areaAttack.splice(areaAttack.indexOf(currentPosition.position), 1);
    return areaAttack;
  }

  moveDefending(defending, attacker, enemies) {
    const movements = this.getAreaMove(defending, defending.character.distance)
      .filter((item) => this.positionsToDraw.findIndex((hero) => hero.position === item) === -1);

    const coordinates = (hero) => ({
      x: hero.position % this.gamePlay.boardSize,
      y: Math.floor(hero.position / this.gamePlay.boardSize),
    });

    const coordinatesHeroes = {
      defending: coordinates(defending),
      attacker: coordinates(attacker),
    };

    const probablePlaces = () => {
      // Влево
      if (coordinatesHeroes.attacker.x <= coordinatesHeroes.defending.x) {
        // Влево и вверх
        if (coordinatesHeroes.attacker.y <= coordinatesHeroes.defending.y) {
          return movements.filter(
            (item) => (item % this.gamePlay.boardSize >= coordinatesHeroes.attacker.x) 
              && ((item % this.gamePlay.boardSize) <= coordinatesHeroes.defending.x)
              && (Math.floor(item / this.gamePlay.boardSize) <= coordinatesHeroes.defending.y)
              && (Math.floor(item / this.gamePlay.boardSize) >= coordinatesHeroes.attacker.y)
          );
        }
        // Влево и вниз
        return movements.filter(
          (item) => (item % this.gamePlay.boardSize >= coordinatesHeroes.attacker.x) 
            && ((item % this.gamePlay.BoardSize) <= coordinatesHeroes.defending.x)
            && (Math.floor(item / this.gamePlay.boardSize) > coordinatesHeroes.defending.y)
            && (Math.floor(item / this.gamePlay.boardSize) <= coordinatesHeroes.attacker.y)
        );
      }

      // Вправо
      // Вправо и вверх
      if (coordinatesHeroes.attacker.y <= coordinatesHeroes.defending.y) {
        return movements.filter(
          (item) => (item % this.gamePlay.boardSize <= coordinatesHeroes.attacker.x) 
            && ((item % this.gamePlay.boardSize) > coordinatesHeroes.defending.x)
            && (Math.floor(item / this.gamePlay.boardSize) <= coordinatesHeroes.defending.y)
            && (Math.floor(item / this.gamePlay.boardSize) >= coordinatesHeroes.attacker.y)
        );
      }
      // Вправо и вниз
      return movements.filter(
        (item) => (item % this.gamePlay.boardSize <= coordinatesHeroes.attacker.x) 
          && ((item % this.gamePlay.boardSize) > coordinatesHeroes.defending.x)
          && (Math.floor(item / this.gamePlay.boardSize) > coordinatesHeroes.defending.y)
          && (Math.floor(item / this.gamePlay.boardSize) <= coordinatesHeroes.attacker.y)
      );
    };

    const probablePlacesFiltered = probablePlaces();
    if (!probablePlacesFiltered.length) {
      if (!movements.length) {
        const otherEnemies = [...enemies];
        otherEnemies.splice(enemies.indexOf(defending), 1);
        defending = otherEnemies[Math.floor(Math.random() * otherEnemies.length)];
      }
      const randomMovements = this.getAreaMove(defending, defending.character.distance)
        .filter((item) => this.positionsToDraw.findIndex((hero) => hero.position === item) === -1);

      return randomMovements[Math.floor(Math.random() * randomMovements.length)];
    }
    return probablePlacesFiltered[Math.floor(Math.random() * probablePlacesFiltered.length)];
  }

  calculateDamage(attacker, target) {
    return Math.max(
      attacker.character.attack - target.character.defence,
      Math.ceil(attacker.character.attack * 0.1)
    );
  }

  moveEnemyAttack() {
    this.gamePlay.deselectAll();
    const enemies = this.positionsToDraw.filter((item) => item.side === this.sides.enemy.name);
    const enemyAttacker = enemies.find((item) => item.character.attack === Math.max.apply(null, enemies.map((hero) => hero.character.attack)));
    
    return new Promise((resolve, reject) => {
      const damage = this.calculateDamage(enemyAttacker, this.selected);
      if (this.getAreaAttack(enemyAttacker, enemyAttacker.character.distanceAttack)
          .includes(this.selected.position)) {
        this.selected.character.health = Math.max(0, 
          this.selected.character.health - damage);
        resolve(damage);
      } else {
        reject({ enemyAttacker, enemies });
      }
    });
  }

  onCellClick(index) {
    if (index < 0 || index >= this.gamePlay.boardSize ** 2) {
      return;
    }
  
    const actionAfterAttack = () => {
      if (this.selected && this.selected.character.health <= 0) {
        this.positionsToDraw = this.positionsToDraw.filter(char => char !== this.selected);
        this.selected = null;
      }
      
      this.gamePlay.redrawPositions(this.positionsToDraw);
      
      // Проверка на проигрыш
      if (!this.positionsToDraw.some(char => char.side === this.sides.player.name)) {
        GamePlay.showMessage('Игра окончена!');
        this.clear();
        this.score = 0;
        this.gamePlay.drawUi(this.theme);
        return;
      }
  
      // Сохраняем выделение если персонаж жив
      if (this.selected) {
        this.gamePlay.selectCell(this.selected.position, 'yellow');
        this.movements = this.getAreaMove(this.selected, this.selected.character.distance);
        this.attacks = this.getAreaAttack(this.selected, this.selected.character.distanceAttack);
      }
    };
  
    const currentPosition = this.positionsToDraw.find(item => item.position === index);
  
    // Выбор персонажа
    if (this.selected === null) {
      if (!currentPosition) return;
      
      if (currentPosition.side === this.sides.player.name) {
        this.selected = currentPosition;
        this.gamePlay.selectCell(index, 'yellow');
        this.movements = this.getAreaMove(this.selected, this.selected.character.distance);
        this.attacks = this.getAreaAttack(this.selected, this.selected.character.distanceAttack);
      } else {
        GamePlay.showError('Это персонаж противника!');
      }
      return;
    }
  
    // Перемещение
    if (this.currentStatus === this.statuses.freespace && !currentPosition) {
      if (this.movements.includes(index)) {
        const oldPosition = this.selected.position;
        this.selected.position = index;
        this.gamePlay.deselectCell(oldPosition);
        this.gamePlay.selectCell(index, 'yellow');
        this.gamePlay.redrawPositions(this.positionsToDraw);
  
        this.moveEnemyAttack()
          .then(
            damage => {
              if (damage) {
                return this.gamePlay.showDamage(this.selected.position, damage)
                  .then(() => {
                    this.gamePlay.selectCell(this.selected.position, 'yellow');
                    return actionAfterAttack();
                  });
              }
              return actionAfterAttack();
            },
            ({enemyAttacker, enemies}) => {
              if (enemyAttacker && enemies.length > 0) {
                enemyAttacker.position = this.moveDefending(enemyAttacker, this.selected, enemies);
                this.gamePlay.redrawPositions(this.positionsToDraw);
                this.gamePlay.selectCell(this.selected.position, 'yellow');
              }
              return actionAfterAttack();
            }
          )
          .catch(error => {
            console.error('Error during enemy move:', error);
            this.gamePlay.redrawPositions(this.positionsToDraw);
          });
          // .then(actionAfterAttack);
      }
      return;
    }
  
    // Смена персонажа
    if (currentPosition && currentPosition.side === this.sides.player.name) {
      this.gamePlay.deselectCell(this.selected.position);
      this.selected = currentPosition;
      this.gamePlay.selectCell(index, 'yellow');
      this.movements = this.getAreaMove(this.selected, this.selected.character.distance);
      this.attacks = this.getAreaAttack(this.selected, this.selected.character.distanceAttack);
      return;
    }
  
    // Атака противника
    if (this.currentStatus === this.statuses.enemy && 
        this.attacks.includes(index) && 
        currentPosition?.side === this.sides.enemy.name) {
      
      const damage = this.calculateDamage(this.selected, currentPosition);
      currentPosition.character.health = Math.max(0, currentPosition.character.health - damage);
  
      const isEnemyDead = currentPosition.character.health <= 0;
  
      this.gamePlay.showDamage(index, damage)
        .then(() => {
          if (isEnemyDead) {
            this.positionsToDraw = this.positionsToDraw.filter(char => char !== currentPosition);
            this.gamePlay.redrawPositions(this.positionsToDraw);
  
            if (!this.positionsToDraw.some(char => char.side === this.sides.enemy.name)) {
              this.score += this.positionsToDraw.reduce((sum, char) => sum + char.character.health, 0);
              if (this.level === 4) {
                GamePlay.showMessage(`Победа! Ваш счет равен ${this.score}.`);
                this.clear();
                this.gamePlay.drawUi(this.theme);
                return Promise.resolve();
              } else {
                GamePlay.showMessage(`Победа! Переход на уровень ${this.level + 1}! Ваш счет равен ${this.score}.`);
                this.newGame(this.levelUp(), this.theme);
                return Promise.resolve();
              }
            }
          }
          return this.moveEnemyAttack();
        })
        .then(
          damage => {
            if (damage && this.selected) {
              this.selected.character.health = Math.max(0, this.selected.character.health - damage);
              return this.gamePlay.showDamage(this.selected.position, damage);
            }
          },
          ({enemyAttacker, enemies}) => {
            if (enemyAttacker && enemies.length > 0) {
              enemyAttacker.position = this.moveDefending(enemyAttacker, this.selected, enemies);
              this.gamePlay.redrawPositions(this.positionsToDraw);
            }
          }
        )
        .then(actionAfterAttack);
      return;
    }
  
    GamePlay.showError('Недопустимое действие!');
  }

  onCellEnter(index) {
    if (!index && index !== 0) {
      return;
    }
  
    // Показываем информацию о персонаже
    if (Array.isArray(this.positionsToDraw)) {
      const character = this.positionsToDraw.find(item => item.position === index);
      if (character) {
        this.gamePlay.showCellTooltip(formatCharacterInfo(character.character), index);
      }
    }
  
    // Если персонаж выбран, показываем доступные действия
    if (this.selected) {
      const actions = {
        distance: this.selected.character.distance,
        distanceAttack: this.selected.character.distanceAttack,
      };
  
      // Рассчитываем зоны движения 
      this.movements = this.getAreaMove(this.selected, actions.distance);
  
      // Рассчитываем зоны атаки
      this.attacks = this.getAreaAttack(this.selected, actions.distanceAttack);

      const targetCharacter = this.positionsToDraw.find(item => item.position === index);

      // Сначала проверяем возможность атаки противника
      if (this.attacks.includes(index) && targetCharacter && 
          targetCharacter.side === this.sides.enemy.name) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
        this.currentStatus = this.statuses.enemy;
      }
      // Затем проверяем возможность движения (только если клетка свободна)
      else if (this.movements.includes(index) && !targetCharacter) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
        this.currentStatus = this.statuses.freespace;
      }
      // Проверяем, не союзник ли это
      else if (targetCharacter && targetCharacter.side === this.sides.player.name) {
        this.gamePlay.setCursor(cursors.pointer);
        this.currentStatus = this.statuses.allied;
      }
      // В остальных случаях действие запрещено
      else {
        this.gamePlay.setCursor(cursors.notallowed);
        this.currentStatus = this.statuses.notallowed;
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    if (this.selected && index !== this.selected.position) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.setCursor(cursors.auto);
  }
}
