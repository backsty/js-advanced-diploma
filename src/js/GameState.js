export default class GameState {
  constructor() {
    this.currentStep = 'player'; // 'player' или 'enemy'
  }

  static from(object) {
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
