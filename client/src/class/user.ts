import { guidGenerator } from './helper';

export class Position {
  lat!: number;
  lng!: number;
}

export class User {
    name?: string;
    id?: string;
    position: Position = new Position();
    groupId?: string;
    markerId?: string;
  
    constructor() {
      this.id = guidGenerator();
    }
  }