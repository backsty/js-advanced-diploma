import GamePlay from './GamePlay.js';
import GameController from './GameController.js';
import GameStateService from './GameStateService.js';

try {
    const gamePlay = new GamePlay();
    gamePlay.bindToDOM(document.querySelector('#game-container'));
    
    if (!document.querySelector('#game-container')) {
        throw new Error('Game container not found');
    }
    
    const stateService = new GameStateService(localStorage);
    const gameCtrl = new GameController(gamePlay, stateService);
    gameCtrl.init();
} catch (e) {
    console.error('Game initialization failed:', e);
}
