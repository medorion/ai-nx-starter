import { Directive, ElementRef, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Directive({
  selector: '[appHideInProd]',
})
export class HideInProdDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (environment.production) {
      this.el.nativeElement.style.display = 'none';
    }
  }
}
