import Character from './Character.js';

export default class PositionedCharacter {
  constructor(character, side, position) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    const numPosition = parseInt(position, 10);

    if (Number.isNaN(numPosition)) {
      throw new Error('position must be a valid number');
    }

    if (numPosition < 0) {
      throw new Error('position must be a non-negative number');
    }

    this.character = character;
    this.side = side;
    this.position = numPosition;
  }
}
