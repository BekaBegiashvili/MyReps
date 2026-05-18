import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment.development';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
})
export class Chatbot {
  private http = inject(HttpClient);

  isOpen = signal(false);
  isLoading = signal(false);
  userInput = '';
  messages = signal<Message[]>([
    {
      role: 'assistant',
      content: 'გამარჯობა! მე IT Step TechShop-ის ასისტენტი ვარ. როგორ დაგეხმარო? 😊'
    }
  ]);

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading()) return;

    const userMessage = this.userInput.trim();
    this.userInput = '';

    this.messages.update(msgs => [...msgs, { role: 'user', content: userMessage }]);
    this.isLoading.set(true);

    const history = this.messages().map(m => ({
      role: m.role,
      content: m.content
    }));

    this.http.post<any>('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `შენ ხარ IT Step TechShop-ის ონლაინ მაღაზიის ასისტენტი. 
               ეხმარები მომხმარებლებს პროდუქტების არჩევაში, საიტის გამოყენებაში და სხვა კითხვებში.
               მაღაზიაში იყიდება ტელეფონები, ლეპტოპები და სხვა ტექნიკა.
               პასუხობ მოკლედ და მეგობრულად.`,
      messages: history,
    }, {
      headers: {
        'x-api-key': environment.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-allow-browser': 'true',
      }
    }).subscribe({
      next: (res) => {
        const reply = res.content[0].text;
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: reply }]);
        this.isLoading.set(false);
      },
      error: () => {
        this.messages.update(msgs => [...msgs, { 
          role: 'assistant', 
          content: 'შეცდომა მოხდა, სცადე ხელახლა!' 
        }]);
        this.isLoading.set(false);
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}