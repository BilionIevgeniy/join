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

/**
 * Extracts only @input() signal keys from a component class and maps them to their value types.
 *
 * Why: modalService.open() should only accept valid @input() names with correct value types.
 * This prevents passing arbitrary keys or wrong value types at compile time.
 *
 * How it works step by step:
 *   1. `keyof T`              — all property names of the component class
 *   2. `as ... ? K : never`   — keep only keys whose value is InputSignal<...> (i.e. @input() fields)
 *   3. `InputSignal<infer V>` — extract the inner type V from InputSignal<V>
 *   4. `Partial<{...}>`       — make all inputs optional (you don't have to pass every input)
 *
 * Example: if ContactModal has `mode = input<'add'|'edit'>()` and `contact = input<Contact|null>()`
 * then ModalInputs<ContactModal> becomes { mode?: 'add'|'edit', contact?: Contact|null }
 */
type ModalInputs<T> = Partial<{
  [K in keyof T as T[K] extends InputSignal<unknown> ? K : never]: T[K] extends InputSignal<
    infer V
  >
    ? V
    : never;
}>;

/**
 * ModalService — the single source of truth for the app-wide modal.
 *
 * Only one modal can be open at a time. Opening a new one destroys the previous.
 *
 * --- HOW TO USE ---
 *
 * 1. Open a modal and pass inputs:
 *      const ref = this.modalService.open(MyComponent, { myInput: value });
 *
 * 2. Subscribe to outputs via the returned ComponentRef:
 *      ref.instance.someOutput.subscribe(data => doSomething(data));
 *
 * 3. Close the modal:
 *      this.modalService.close();
 *    The modal component itself can also call close() directly via inject(ModalService).
 *
 * --- HOW IT WORKS INTERNALLY ---
 *
 * open() creates the component outside of any template using createComponent().
 * The resulting DOM node is stored in the `hostElement` signal.
 * The Modal shell component (app-modal in main-layout) watches that signal
 * and physically appends the node into its #host div, making it visible.
 *
 * close() triggers the CSS close animation (isClosing = true), waits for it
 * to finish (CLOSE_ANIMATION_MS), then destroys the component and resets state.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  /**
   * ApplicationRef — a handle to the running Angular app.
   * Needed to register dynamically created components so Angular
   * tracks them for change detection (signal updates, async pipe, etc.).
   */
  private appRef = inject(ApplicationRef);

  /**
   * EnvironmentInjector — the root-level dependency injection context.
   * Passed to createComponent() so the dynamic component can inject
   * any service (e.g. Router, ContactService) just like a normal component.
   */
  private envInjector = inject(EnvironmentInjector);

  /** Reference to the currently open component. Used to destroy it on close. */
  private componentRef: ComponentRef<unknown> | null = null;

  /** True while the modal is visible (including during close animation). */
  isOpen = signal(false);

  /** True during the close animation (300ms). Drives the CSS --closing modifier. */
  isClosing = signal(false);

  /**
   * The raw DOM node of the dynamically created component (e.g. <app-contact-modal>).
   * The Modal shell watches this signal and appends/removes the node from the page.
   */
  hostElement = signal<HTMLElement | null>(null);

  /**
   * Creates a component dynamically, sets its inputs, and makes it visible.
   *
   * @param component - The Angular component class to render inside the modal.
   * @param inputs    - Key/value pairs matching the component's @input() signal fields.
   * @returns ComponentRef — use it to subscribe to @output() events or update inputs later.
   */
  open<T>(component: Type<T>, inputs: ModalInputs<T> = {}): ComponentRef<T> {
    // Destroy any previously open modal before opening a new one.
    this.destroyCurrent();

    // Create the component in memory — no template or HTML tag needed.
    // environmentInjector gives it access to the root DI context (services, router, etc.).
    const ref = createComponent(component, { environmentInjector: this.envInjector });

    // Pass inputs the same way [myInput]="value" would in a template.
    for (const key in inputs) {
      ref.setInput(key, inputs[key as keyof ModalInputs<T>]);
    }

    // Register the component with Angular so it participates in change detection.
    // Without this, signals and async operations inside the component won't trigger UI updates.
    this.appRef.attachView(ref.hostView);

    this.componentRef = ref;

    // Store the native DOM element. The Modal shell watches this signal
    // and will append the element to its #host container.
    this.hostElement.set(ref.location.nativeElement);

    this.isClosing.set(false);
    this.isOpen.set(true);

    return ref;
  }

  /**
   * Starts the close animation, then destroys the component after the animation completes.
   * Safe to call multiple times — ignored if already closing or already closed.
   */
  close(): void {
    if (!this.isOpen() || this.isClosing()) return;
    this.isClosing.set(true);

    setTimeout(() => {
      this.destroyCurrent();
      this.isOpen.set(false);
      this.isClosing.set(false);
    }, CLOSE_ANIMATION_MS);
  }

  /** Destroys the current component and clears all references. */
  private destroyCurrent(): void {
    this.componentRef?.destroy();
    this.componentRef = null;
    this.hostElement.set(null);
  }
}
