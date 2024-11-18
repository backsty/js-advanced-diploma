import Character from '../Character.js';

export default class Deamon extends Character {
    constructor(level = 1, type = 'daemon') {
        super(level, type);
        this.attack = 10;
        this.defence = 10;
        this.distance = 1;
        this.distanceAttack = 4;
    }
}