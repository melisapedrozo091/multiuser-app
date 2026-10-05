import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme = new BehaviorSubject<'light' | 'dark'>('light');

  theme$ = this.currentTheme.asObservable();

  constructor(factory: RendererFactory2) {
    this.renderer = factory.createRenderer(null, null);
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    this.setTheme(saved);
  }

  setTheme(theme: 'light' | 'dark'): void {
    const prev = this.currentTheme.value;
    this.renderer.removeClass(document.body, `${prev}-theme`);
    this.renderer.addClass(document.body, `${theme}-theme`);
    this.currentTheme.next(theme);
    localStorage.setItem('theme', theme);
  }

  toggle(): void {
    const next = this.currentTheme.value === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  isDark(): boolean {
    return this.currentTheme.value === 'dark';
  }
}
