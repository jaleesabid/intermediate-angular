import { Injectable, signal } from '@angular/core';

@Injectable()
export class TabState {
  readonly activeTab = signal<string>('');

  active(label: string) {
    this.activeTab.set(label);
  }
}
