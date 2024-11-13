import { themes } from "./themes.js";
import { generateTeam } from "./generators.js";
import PositionedCharacter from "./PositionedCharacter.js";
import { playerTypes, enemyTypes } from './characters/index.js';
import { formatCharacterInfo } from './utils.js';



export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerTypes = null;
    this.enemyTypes = null;
    this.selectedCharacter = null;

    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);

    this.playerTypes = generateTeam(playerTypes, 1, 2);
    this.enemyTypes = generateTeam(enemyTypes, 1, 2);

    this.positions = this.getPositions();
    this.gamePlay.redrawPositions(this.positions);

    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
  }

  getPositions() {
    const positions = [];
    const usedPositions = new Set();

    this.playerTypes.characters.forEach(character => {
      let position;

      do {
        const column = Math.floor(Math.random() * 2);
        const row = Math.floor(Math.random() * 8);
        position = row * 8 + column;
      } while (usedPositions.has(position));

      usedPositions.add(position);
      positions.push(new PositionedCharacter(character, position));
    });

    this.enemyTypes.characters.forEach(character => {
      let position;

      do {
        const column = 6 + Math.floor(Math.random() * 2);
        const row = Math.floor(Math.random() * 8);
        position = row * 8 + column;
      } while (usedPositions.has(position));

      usedPositions.add(position);
      positions.push(new PositionedCharacter(character, position));
    });

    return positions;
  }

  onCellClick(index) {
    const clickedChar = this.positions.find(pos => pos.position === index);

    if (!clickedChar) {
      this.gamePlay.showError('Выберите персонажа!');
      return;
    }

    const isPlayerChar = playerTypes.some(type => clickedChar.character instanceof type);

    if (!isPlayerChar) {
      this.gamePlay.showError('Выберите персонажа игрока!');
      return;
    }

    if (this.selectedCharacter) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
    }

    this.selectedCharacter = clickedChar;
    this.gamePlay.selectCell(index);
  }

  onCellEnter(index) {
    const character = this.positions.find(pos => pos.position === index);

    if (character) {
      const info = formatCharacterInfo(character.character);
      this.gamePlay.showCellTooltip(info, index);
    }
  }

  onCellLeave(index) {
    if (this.selectedCharacter?.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
  }
}
