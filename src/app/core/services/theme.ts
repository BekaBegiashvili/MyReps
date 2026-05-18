import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themes = ['default', 'theme-green', 'theme-purple','theme-pink', 'theme-light', 'theme-sunset'];
  private current = 'default';

  constructor() {
    const saved = localStorage.getItem('theme');
    if (saved) this.applyTheme(saved);
  }

  applyTheme(theme: string): void {
    this.themes.forEach(t => document.body.classList.remove(t));
    if (theme !== 'default') document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
    this.current = theme;
  }

  getCurrentTheme(): string {
    return this.current;
  }
}