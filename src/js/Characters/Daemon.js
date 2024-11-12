import Character from '../Character.js';

export default class Deamon extends Character {
    constructor(level) {
        super(level, 'deamon');
        this.attack = 10;
        this.defence = 10;
    }
}