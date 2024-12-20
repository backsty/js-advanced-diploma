import Character from '../Character.js';

export default class Bowman extends Character {
    constructor(level, type = 'bowman') {
        super(level, type);
        this.attack = 25;
        this.defence = 25;
        this.distance = 2;
        this.distanceAttack = 2;
    }
}