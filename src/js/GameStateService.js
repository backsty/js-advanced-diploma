export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  load() {
    const data = this.storage.getItem('state');

    if (!data) {
      throw new Error('Invalid state');
    }

    try {
      return JSON.parse(data);
    } catch {
      throw new Error('Invalid state');
    }
  }
}
