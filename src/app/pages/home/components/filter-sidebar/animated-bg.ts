import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-electric-bg',
  standalone: true,
  template: `<canvas #canvas class="electric-canvas"></canvas>`,
  styles: [
    `
      .electric-canvas {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: 0.4;
      }
    `,
  ],
})
export class ElectricBgComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animId!: number;
  private particles: any[] = [];

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize(canvas);
    window.addEventListener('resize', () => this.resize(canvas));
    this.initParticles();
    this.animate();
  }

  private resize(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private initParticles() {
    this.particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? '#a855f7' : '#3b82f6',
      connections: 0,
    }));
  }

  private animate() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.connections = 0;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150 && a.connections < 3 && b.connections < 3) {
          a.connections++;
          b.connections++;

          const opacity = 1 - dist / 150;

          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);

          const midX = (a.x + b.x) / 2 + (Math.random() - 0.5) * 20;
          const midY = (a.y + b.y) / 2 + (Math.random() - 0.5) * 20;
          this.ctx.quadraticCurveTo(midX, midY, b.x, b.y);

          this.ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.6})`;
          this.ctx.lineWidth = opacity * 1.5;
          this.ctx.stroke();
        }
      }
    }

    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
  }
}
