import {
  ApplicationRef,
  ComponentRef,
  EffectRef,
  EnvironmentInjector,
  InputSignal,
  Injectable,
  Signal,
  Type,
  createComponent,
  effect,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';

const CLOSE_ANIMATION_MS = 300;

/**
 * Extracts only @input() signal keys from a component class and maps them to their value types.
 *
 * How it works:
 *   1. `keyof T`              — all property names of the component class
 *   2. `as ... ? K : never`   — keep only keys whose value is InputSignal<...> (i.e. @input() fields)
 *   3. `InputSignal<infer V>` — extract the inner type V from InputSignal<V>
 *   4. `Partial<{...}>`       — make all inputs optional
 *
 * Example: `mode = input<'add'|'edit'>()` → ModalInputs has `mode?: 'add'|'edit'`
 */
type ModalInputs<T> = Partial<{
  [K in keyof T as T[K] extends InputSignal<unknown> ? K : never]: T[K] extends InputSignal<
    infer V
  >
    ? V
    : never;
}>;

/**
 * Same as ModalInputs but each value is a Signal<V> instead of V.
 * Pass these to keep the input in sync reactively while the modal is open.
 * The service creates an internal effect that calls ref.setInput(key, signal()) on every change.
 *
 * Example: `syncInputs: { isLoading: this.taskService.isLoading }` — the signal itself, not its value.
 */
type ModalSignalInputs<T> = Partial<{
  [K in keyof T as T[K] extends InputSignal<unknown> ? K : never]: T[K] extends InputSignal<
    infer V
  >
    ? Signal<V>
    : never;
}>;

/**
 * Maps each @output() field to a typed callback.
 * Filters to only keys whose value has a .subscribe() method (i.e. output() fields).
 *
 * Example: `save = output<CreateTaskDto>()` → ModalActions has `save?: (value: CreateTaskDto) => void`
 */
type ModalActions<T> = Partial<{
  [K in keyof T as T[K] extends { subscribe(cb: (...args: any[]) => void): unknown }
    ? K
    : never]: T[K] extends { subscribe(cb: (v: infer V) => void): unknown }
    ? (value: V) => void
    : never;
}>;

/**
 * Configuration object passed to ModalService.open().
 *
 * @example
 * this.modalService.open(AddTaskComponent, {
 *   inputs:      { initialStatus: status, isModal: true },
 *   syncInputs:  { isLoading: this.taskService.isLoading },   // pass the Signal, not its value
 *   actions: {
 *     save:   (dto)  => this.saveTask(dto),
 *     cancel: ()     => this.modalService.close(),
 *   },
 * });
 */
interface ModalConfig<T> {
  /** One-time static inputs set at open time. */
  inputs?: ModalInputs<T>;
  /**
   * Reactive signals kept in sync while the modal is open.
   * Pass the signal reference (e.g. `this.service.isLoading`), not its current value.
   * The service creates an effect that pushes updates automatically and destroys it on close.
   */
  syncInputs?: ModalSignalInputs<T>;
  /** Handlers for the component's @output() events, subscribed at open time. */
  actions?: ModalActions<T>;
}

/**
 * ModalService — the single source of truth for the app-wide modal.
 *
 * Only one modal can be open at a time. Opening a new one destroys the previous.
 *
 * --- HOW TO USE ---
 *
 * Open a modal with typed inputs, reactive sync, and output handlers — all in one call:
 *
 *   this.modalService.open(MyComponent, {
 *     inputs:     { mode: 'add' },
 *     syncInputs: { isLoading: this.service.isLoading },
 *     actions:    { save: (data) => this.save(data), cancel: () => this.modalService.close() },
 *   });
 *
 * Close from anywhere:
 *   this.modalService.close();
 *
 * --- HOW IT WORKS INTERNALLY ---
 *
 * open() creates the component outside of any template using createComponent(),
 * stores its DOM node in the `hostElement` signal, and returns void.
 * The Modal shell (app-modal in main-layout) watches `hostElement` and appends the node
 * into its #host container, making it visible.
 *
 * syncInputs creates an effect via runInInjectionContext so it can run outside a constructor.
 * That effect is destroyed when the modal closes or a new one opens.
 *
 * close() triggers the CSS close animation (isClosing = true), waits CLOSE_ANIMATION_MS,
 * then destroys the component and resets all state.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  /**
   * ApplicationRef — a handle to the running Angular app.
   * Needed to register dynamically created components for change detection.
   */
  private appRef = inject(ApplicationRef);

  /**
   * EnvironmentInjector — the root DI context.
   * Passed to createComponent() and runInInjectionContext() so dynamic code
   * can inject services and create effects outside of a component constructor.
   */
  private envInjector = inject(EnvironmentInjector);

  private componentRef: ComponentRef<unknown> | null = null;

  /** Ref to the reactive sync effect — destroyed on close or when a new modal opens. */
  private syncEffectRef: EffectRef | null = null;

  /** True while the modal is visible (including during close animation). */
  isOpen = signal(false);

  /** True during the close animation (300ms). Drives the CSS --closing modifier. */
  isClosing = signal(false);

  /**
   * The raw DOM node of the dynamically created component (e.g. <app-add-task-component>).
   * The Modal shell watches this signal and appends/removes the node from the page.
   */
  hostElement = signal<HTMLElement | null>(null);

  /**
   * Creates a component dynamically, wires inputs/syncInputs/actions, and makes it visible.
   * Returns void — all interaction is handled via the config object.
   *
   * @param component - The Angular component class to render inside the modal.
   * @param config    - Inputs, reactive sync inputs, and output handlers.
   */
  open<T>(component: Type<T>, config: ModalConfig<T> = {}): void {
    this.destroyCurrent();

    const {
      inputs = {} as ModalInputs<T>,
      syncInputs = {} as ModalSignalInputs<T>,
      actions = {} as ModalActions<T>,
    } = config;

    // Create the component in memory — no template or HTML tag needed.
    const ref = createComponent(component, { environmentInjector: this.envInjector });

    // Set one-time static inputs (same as [myInput]="value" in a template).
    for (const key in inputs) {
      ref.setInput(key, inputs[key as keyof ModalInputs<T>]);
    }

    // Subscribe to @output() events — same as (myOutput)="handler($event)" in a template.
    for (const key in actions) {
      const output = (ref.instance as Record<string, { subscribe(cb: (v: unknown) => void): unknown }>)[key];
      output?.subscribe((actions as Record<string, (v: unknown) => void>)[key]);
    }

    // Register the component with Angular so it participates in change detection.
    this.appRef.attachView(ref.hostView);

    this.componentRef = ref;
    this.hostElement.set(ref.location.nativeElement);
    this.isClosing.set(false);
    this.isOpen.set(true);
    this.lockScroll();

    // If any syncInputs provided, create a reactive effect that keeps them in sync.
    // runInInjectionContext lets us call effect() outside of a component constructor.
    if (Object.keys(syncInputs as object).length > 0) {
      this.syncEffectRef = runInInjectionContext(this.envInjector, () =>
        effect(() => {
          if (!this.isOpen()) {
            this.syncEffectRef?.destroy();
            return;
          }
          for (const key in syncInputs) {
            const sig = (syncInputs as Record<string, Signal<unknown>>)[key];
            ref.setInput(key, sig());
          }
        }),
      );
    }
  }

  /**
   * Starts the close animation, then destroys the component after it completes.
   * Safe to call multiple times — ignored if already closing or already closed.
   */
  close(): void {
    if (!this.isOpen() || this.isClosing()) return;
    this.isClosing.set(true);

    setTimeout(() => {
      this.destroyCurrent();
      this.isOpen.set(false);
      this.isClosing.set(false);
      this.unlockScroll();
    }, CLOSE_ANIMATION_MS);
  }

  /** Destroys the current component, its sync effect, and clears all references. */
  private destroyCurrent(): void {
    this.syncEffectRef?.destroy();
    this.syncEffectRef = null;
    this.componentRef?.destroy();
    this.componentRef = null;
    this.hostElement.set(null);
  }

  private lockScroll(): void {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  private unlockScroll(): void {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}
