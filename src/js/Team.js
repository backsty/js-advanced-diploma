/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  constructor() {
    this.characters = new Set();
  }

  add(character) {
    if (!character) {
      throw new Error('Character cannot be null or undefined');
    }
    
    if (this.characters.has(character)) {
      throw new Error('Character already exists');
    }
    
    this.characters.add(character);
  }

  addAll(...characters) {
    if (characters.length === 0) {
      throw new Error('No characters provided');
    }

    characters.forEach(character => {
      try {
        this.add(character);
      } catch (e) {
        if (e.message !== 'Character already exists') {
          throw e;
        }
      }
    });
  }

  toArray() {
    this.characters = Array.from(this.characters);
  }
}
