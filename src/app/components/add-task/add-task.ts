import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { Contact } from '@core/models/contact.model';
import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  Subtask,
  CreateTaskDto,
} from '@core/models/task.model';
import { PriorityButton } from '@shared/button/priority-button/priority-button';
import { Avatar } from '@shared/avatar/avatar';
import { isFieldInvalid } from '@core/utils/form.utils';
import { countRemaining, takeVisible } from '@core/utils/collection.utils';

@Component({
  selector: 'app-add-task-component',
  standalone: true,
  imports: [ReactiveFormsModule, PriorityButton, Avatar],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
/**
 * AddTaskComponent — create/edit form for a task.
 *
 * Used both as a standalone page ({@link AddTaskPage}) and inside the app-wide
 * modal (opened via {@link ModalService} for the "add task" / "edit task" flows).
 * Emits {@link save} with a ready-to-persist DTO; the caller owns actually
 * calling {@link TaskService}.
 */
export class AddTaskComponent implements OnInit {
  private fb = inject(FormBuilder);

  // ─── INPUTS ───────────────────────────────────────────────
  /** Column the task is created into when there's no existing task (create mode). */
  initialStatus = input<TaskStatus>('todo');
  /** Task being edited. `null` means create mode. */
  task = input<Task | null>(null);
  /** Full contact list, used to populate the "assigned to" dropdown. */
  contacts = input.required<Contact[]>();
  /** Disables the save button / shows a spinner while a save request is in flight. */
  isLoading = input<boolean>(false);
  /** True when rendered inside the app-wide modal, as opposed to the standalone page. */
  isModal = input<boolean>(false);
  /** True when editing an existing task, as opposed to creating a new one. */
  isEdit = input<boolean>(false);

  // ─── OUTPUTS ──────────────────────────────────────────────
  /** Emitted with a ready-to-persist DTO when the user submits a valid form. */
  save = output<CreateTaskDto>();
  /** Emitted when the user cancels out of the form (e.g. closes the modal). */
  cancel = output<void>();

  // ─── LOCAL STATE ──────────────────────────────────────────
  today = new Date().toISOString().split('T')[0];
  subtasks = signal<Subtask[]>([]);
  subtaskInput = signal('');
  isSubtaskActive = signal(false);
  editingSubtask = signal<string | null>(null); // id of subtask being edited
  isDropdownOpen = signal(false);
  isCategoryDropdownOpen = signal(false);
  categories: TaskCategory[] = ['User Story', 'Technical Task'];
  priorities: TaskPriority[] = ['urgent', 'medium', 'low'];
  // Search query for filtering contacts in dropdown
  searchQuery = signal('');
  // Filtered contacts passed down to AddTask
  filteredContacts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.contacts();
    return this.contacts().filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        (c.last_name && c.last_name.toLowerCase().includes(q)),
    );
  });

  // Original due_date of the task being edited, used to exempt an
  // unchanged past date from minDateValidator. Null when creating a new task.
  private originalDueDate: string | null = null;

  private minDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      if (this.originalDueDate && control.value === this.originalDueDate) return null;
      return control.value < this.today ? { minDate: true } : null;
    };
  }

  // ─── FORM ─────────────────────────────────────────────────
  form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    due_date: ['', [Validators.required, this.minDateValidator()]],
    priority: ['medium' as TaskPriority],
    category: ['' as TaskCategory, [Validators.required]],
    assigned_contacts: [[] as string[]],
  });

  /** True when all required fields (title, due_date, category) are valid. */
  isFormValid(): boolean {
    const { title, due_date, category } = this.form.controls;
    return title.valid && due_date.valid && category.valid;
  }

  // ─── CHANGE DETECTION (edit mode) ──────────────────────────
  // Reactive view of the form's current value, used to compare against
  // the original snapshot below. toSignal bridges the RxJS valueChanges
  // observable into a signal so it can be read inside computed().
  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  // Snapshot of title/description/.../subtasks as they were when the
  // modal opened. Set once in ngOnInit, never mutated afterwards.
  private originalSnapshot: string | null = null;

  // True only when the current form + subtasks actually differ in value
  // from the original snapshot — not just "something fired a change event".
  // Typing a character and deleting it again correctly stays "unchanged".
  hasChanges = computed(() => {
    if (this.originalSnapshot === null) return true;
    return this.buildSnapshot(this.formValue(), this.subtasks()) !== this.originalSnapshot;
  });

  private buildSnapshot(formValue: typeof this.form.value, subtasks: Subtask[]): string {
    return JSON.stringify({
      title: formValue.title ?? '',
      description: formValue.description ?? '',
      due_date: formValue.due_date ?? '',
      priority: formValue.priority ?? 'medium',
      category: formValue.category ?? '',
      assigned_contacts: [...(formValue.assigned_contacts ?? [])].sort(),
      subtasks: subtasks.map((s) => ({ id: s.id, title: s.title, done: s.done })),
    });
  }

  ngOnInit(): void {
    const task = this.task();
    if (!task) return;

    // Exempt the task's existing due_date from minDateValidator so editing
    // other fields doesn't block saving on an already-past due date.
    this.originalDueDate = task.due_date;

    this.prefillFormFields(task);
    this.subtasks.set(task.subtasks ?? []);
    this.prefillAssignedContacts(task);

    // Capture the baseline to compare future edits against.
    this.originalSnapshot = this.buildSnapshot(this.form.value, this.subtasks());
  }

  /** Prefills title/description/due_date/priority/category from the task being edited. */
  private prefillFormFields(task: Task): void {
    this.form.patchValue({
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      priority: task.priority,
      category: task.category,
    });
  }

  /** Prefills the assigned_contacts control from the task's joined contact ids. */
  private prefillAssignedContacts(task: Task): void {
    const ids = (task.assigned_contacts ?? [])
      .map((ac) => ac.contact?.id)
      .filter((id): id is string => !!id);
    this.form.patchValue({ assigned_contacts: ids });
  }

  // ─── PRIORITY ─────────────────────────────────────────────

  onPriorityChange(priority: TaskPriority): void {
    this.form.patchValue({ priority });
  }

  // ─── ASSIGNED CONTACTS ────────────────────────────────────

  toggleContact(contactId: string): void {
    const current = this.form.get('assigned_contacts')!.value as string[];
    const updated = current.includes(contactId)
      ? current.filter((id) => id !== contactId)
      : [...current, contactId];
    this.form.patchValue({ assigned_contacts: updated });
  }

  isContactSelected(contactId: string): boolean {
    const current = this.form.get('assigned_contacts')!.value as string[];
    return current.includes(contactId);
  }

  /** Max number of assigned-contact avatars rendered before collapsing into a "+N" badge. */
  private readonly maxVisibleAvatars = 3;

  getSelectedContacts(): Contact[] {
    const ids = this.form.get('assigned_contacts')!.value as string[];
    return this.contacts().filter((c) => ids.includes(c.id!));
  }

  /** First {@link maxVisibleAvatars} selected contacts, for avatar-stack rendering. */
  getVisibleContacts(): Contact[] {
    return takeVisible(this.getSelectedContacts(), this.maxVisibleAvatars);
  }

  /** Count of selected contacts beyond {@link maxVisibleAvatars}, shown as a "+N" badge. */
  getRemainingContactsCount(): number {
    return countRemaining(this.getSelectedContacts(), this.maxVisibleAvatars);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  openDropdown(): void {
    this.isDropdownOpen.set(true);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen.update((v) => !v);
  }

  closeCategoryDropdown(): void {
    this.isCategoryDropdownOpen.set(false);
  }

  selectCategory(cat: TaskCategory): void {
    this.form.patchValue({ category: cat });
    this.form.get('category')!.markAsTouched();
    this.isCategoryDropdownOpen.set(false);
  }

  getSelectedCategory(): TaskCategory | '' {
    return (this.form.get('category')!.value as TaskCategory) ?? '';
  }

  // ─── SUBTASKS ─────────────────────────────────────────────

  addSubtask(): void {
    this.isSubtaskActive.set(true);
  }

  onSubtaskInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.subtaskInput.set(value);
    if (value) {
      this.isSubtaskActive.set(true);
    } else {
      this.isSubtaskActive.set(false);
    }
  }

  clearSubtask(): void {
    this.subtaskInput.set('');
    this.isSubtaskActive.set(false);
  }

  confirmSubtask(): void {
    const title = this.subtaskInput().trim();
    if (!title) return;
    const subtask: Subtask = {
      id: Date.now().toString(36),
      title,
      done: false,
    };
    this.subtasks.update((list) => [...list, subtask]);
    this.subtaskInput.set('');
    this.isSubtaskActive.set(false);
  }

  onSubtaskKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.confirmSubtask();
    }
  }

  deleteSubtask(id: string): void {
    this.subtasks.update((list) => list.filter((s) => s.id !== id));
  }

  startEditSubtask(id: string): void {
    this.editingSubtask.set(id);
  }

  saveEditSubtask(id: string, newTitle: string): void {
    this.subtasks.update((list) => list.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
    this.editingSubtask.set(null);
  }

  // ─── FORM ACTIONS ─────────────────────────────────────────

  onSave(): void {
    if (!this.isFormValid()) return;
    const { title, description, due_date, priority, category, assigned_contacts } = this.form.value;
    const dto: CreateTaskDto = {
      title: title!,
      description: description ?? '',
      due_date: due_date!,
      status: this.initialStatus(),
      priority: (priority as TaskPriority) ?? 'medium',
      category: category as TaskCategory,
      subtasks: this.subtasks(),
      contact_ids: assigned_contacts ?? [],
    };
    this.save.emit(dto);
  }

  onClear(): void {
    this.form.reset({ priority: 'medium', assigned_contacts: [] });
    this.subtasks.set([]);
    this.subtaskInput.set('');
    this.searchQuery.set('');
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isFieldInvalid(field: string): boolean {
    return isFieldInvalid(this.form, field);
  }
}
