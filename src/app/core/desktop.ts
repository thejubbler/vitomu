import { Injectable } from '@angular/core';
import { shell } from 'electron';

@Injectable()
export class Desktop {
    constructor() {
    }

    public openExternal(url: string): void {
        shell.openExternal(url);
    }
}