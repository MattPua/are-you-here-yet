import { guidGenerator } from './helper';

export class Position {
  lat?: number;
  lng?: number;
}

export class User {
    name?: string;
    id?: string;
    position: Position = {};
    groupId?: string;
    markerId?: string;
  
    constructor() {
      this.id = guidGenerator();
    }
  }