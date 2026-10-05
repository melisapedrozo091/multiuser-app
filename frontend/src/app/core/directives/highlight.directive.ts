import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlightColor = 'rgba(239, 68, 68, 0.15)'; // Default highlight tint
  @Input() highlightCondition = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.highlightCondition) {
      this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.appHighlightColor);
      this.renderer.setStyle(this.el.nativeElement, 'borderLeft', '4px solid var(--danger)');
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
      this.renderer.removeStyle(this.el.nativeElement, 'borderLeft');
    }
  }
}
