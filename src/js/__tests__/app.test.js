import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import GamePlay from '../GamePlay.js';
import GameController from '../GameController.js';
import GameStateService from '../GameStateService.js';

jest.mock('./GamePlay');
jest.mock('./GameController');
jest.mock('./GameStateService');

describe('App inint', () => {
    /// -
});