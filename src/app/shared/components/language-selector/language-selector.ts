import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.scss',
})
export class LanguageSelectorComponent {
  private translate = inject(TranslateService);
  showModal = signal(false);

  constructor() {
    const saved = localStorage.getItem('lang');
    if (!saved) {
      this.showModal.set(true);
    } else {
      this.translate.use(saved);
    }
  }

  selectLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
    this.showModal.set(false);
  }
}
