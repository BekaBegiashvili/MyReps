import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { ElectricBgComponent } from './pages/home/components/filter-sidebar/animated-bg';
import { CommonModule } from '@angular/common';
import { LanguageSelectorComponent } from './shared/components/language-selector/language-selector';
import { Chatbot } from './shared/components/chatbot/chatbot';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CommonModule, ElectricBgComponent, LanguageSelectorComponent, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Angular-Project');
}
