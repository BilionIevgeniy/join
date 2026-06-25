import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  InputSignal,
  Injectable,
  Type,
  createComponent,
  inject,
  signal,
} from '@angular/core';

const CLOSE_ANIMATION_MS = 300;

type ModalInputs<T> = Partial<{
  [K in keyof T as T[K] extends InputSignal<unknown> ? K : never]: T[K] extends InputSignal<
    infer V
  >
    ? V
    : never;
}>;

@Injectable({ providedIn: 'root' })
export class ModalService {
  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);

  private componentRef: ComponentRef<unknown> | null = null;

  isOpen = signal(false);
  isClosing = signal(false);
  hostElement = signal<HTMLElement | null>(null);

  open<T>(component: Type<T>, inputs: ModalInputs<T> = {}): ComponentRef<T> {
    this.destroyCurrent();

    const ref = createComponent(component, { environmentInjector: this.envInjector });
    for (const key in inputs) {
      ref.setInput(key, inputs[key as keyof ModalInputs<T>]);
    }

    this.appRef.attachView(ref.hostView);
    this.componentRef = ref;
    this.hostElement.set(ref.location.nativeElement);
    this.isClosing.set(false);
    this.isOpen.set(true);

    return ref;
  }

  close(): void {
    if (!this.isOpen() || this.isClosing()) return;
    this.isClosing.set(true);

    setTimeout(() => {
      this.destroyCurrent();
      this.isOpen.set(false);
      this.isClosing.set(false);
    }, CLOSE_ANIMATION_MS);
  }

  private destroyCurrent(): void {
    this.componentRef?.destroy();
    this.componentRef = null;
    this.hostElement.set(null);
  }
}
