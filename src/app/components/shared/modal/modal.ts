import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  ViewEncapsulation,
  effect,
} from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Modal {
  modalService = inject(ModalService);

  @ViewChild('host') hostRef?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      const element = this.modalService.hostElement();
      queueMicrotask(() => this.renderElement(element));
    });
  }

  onBackdropClick(): void {
    this.modalService.close();
  }

  private renderElement(element: HTMLElement | null): void {
    if (!this.hostRef) return;
    this.hostRef.nativeElement.innerHTML = '';
    if (element) this.hostRef.nativeElement.appendChild(element);
  }
}
