export default class GameState {
  constructor() {
    this.currentStep = 'player'; // 'player' или 'enemy'
  }

  static from(object) {
    if (object && typeof object === 'object' && !Array.isArray(object)) {
      return {
        level: object.level,
        positions: object.positionsToDraw,
        theme: object.theme,
        score: object.score,
      };
    }
    return null;
  }
}
