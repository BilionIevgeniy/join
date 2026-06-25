import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  ViewEncapsulation,
  effect,
} from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

/**
 * Modal — the visual shell that wraps any dynamically created modal component.
 *
 * Place this once in the main layout: <app-modal />
 * Do NOT put content inside it — content is injected by ModalService automatically.
 *
 * --- HOW IT WORKS ---
 *
 * ModalService.open() creates a component in memory and stores its DOM node
 * in the `hostElement` signal. This shell watches that signal via effect()
 * and physically appends the node into the #host div, making it appear on screen.
 *
 * When ModalService.close() is called, hostElement becomes null, the node is
 * removed, and the overlay fades out via CSS (--closing modifier).
 *
 * --- WHY ViewEncapsulation.None ---
 *
 * The injected component's DOM node is created outside of this component's
 * view hierarchy. Angular's default style encapsulation adds unique attribute
 * selectors (e.g. [_nghost-xxx]) that would prevent this component's SCSS
 * from styling the injected content. ViewEncapsulation.None disables that,
 * making styles global so they reach the dynamically appended node.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Modal {
  modalService = inject(ModalService);

  /**
   * A direct reference to the #host <div> in the template.
   *
   * @ViewChild('host') means: find the element marked with #host in the template
   * and give me a JS reference to it. This is the Angular equivalent of
   * document.querySelector('[data-host]') — but type-safe and lifecycle-aware.
   *
   * ElementRef<HTMLDivElement> wraps the raw DOM element.
   * Access the actual node via hostRef.nativeElement.
   */
  @ViewChild('host') hostRef?: ElementRef<HTMLDivElement>;

  constructor() {
    /**
     * Reactive listener: runs every time modalService.hostElement() changes.
     *
     * queueMicrotask defers the DOM operation by one microtask tick.
     * This ensures @ViewChild('host') hostRef is already resolved before
     * we try to append into it (ViewChild is set after the first render).
     */
    effect(() => {
      const element = this.modalService.hostElement();
      queueMicrotask(() => this.renderElement(element));
    });
  }

  /** Called when the user clicks the dark backdrop outside the panel. */
  onBackdropClick(): void {
    this.modalService.close();
  }

  /**
   * Clears the #host container and appends the new component's DOM node.
   * If element is null (modal closed), the container is simply emptied.
   */
  private renderElement(element: HTMLElement | null): void {
    if (!this.hostRef) return;
    this.hostRef.nativeElement.innerHTML = '';
    if (element) this.hostRef.nativeElement.appendChild(element);
  }
}
