import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuickActionsService {
  public cache: any = {};
  constructor() { }

  public updateCache(key: string, data: any) {
    if (!this.cache.hasOwnProperty(key) && !this.cache[key]) {
      this.cache[key] = data;
    }
  }

  public getCacheByKey(key: string): any {
    if (this.cache.hasOwnProperty(key) && this.cache[key]) {
      return this.cache[key];
    }
    return {};
  }

  
}
