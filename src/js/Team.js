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
    this.characters.add(character);
  }

  addAll(...characters) {
    for (const character of characters) {
      this.characters.add(character);
    }
  }

  toArray() {
    this.characters = Array.from(this.characters);
  }
}
