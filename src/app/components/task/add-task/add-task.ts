import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from '../../../core/models/contact.model';
import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  Subtask,
  CreateTaskDto,
} from '../../../core/models/task.model';
import { PriorityButton } from '../../shared/button/priority-button/priority-button';
import { Avatar } from '../../shared/avatar/avatar';

@Component({
  selector: 'app-add-task-component',
  standalone: true,
  imports: [ReactiveFormsModule, PriorityButton, Avatar],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTaskComponent implements OnInit {
  private fb = inject(FormBuilder);

  // ─── INPUTS ───────────────────────────────────────────────
  initialStatus = input<TaskStatus>('todo');
  task = input<Task | null>(null); // null = create, Task = edit
  contacts = input.required<Contact[]>();
  isLoading = input<boolean>(false);

  // ─── OUTPUTS ──────────────────────────────────────────────
  save = output<CreateTaskDto>();

  // ─── LOCAL STATE ──────────────────────────────────────────
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

  // ─── FORM ─────────────────────────────────────────────────
  form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    due_date: ['', [Validators.required]],
    priority: ['medium' as TaskPriority],
    category: ['' as TaskCategory, [Validators.required]],
    assigned_contacts: [[] as string[]],
  });

  isFormValid(): boolean {
    const { title, due_date, category } = this.form.controls;
    return title.valid && due_date.valid && category.valid;
  }

  ngOnInit(): void {
    const task = this.task();
    if (!task) return;

    // Edit mode — prefill form with existing task data
    this.form.patchValue({
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      priority: task.priority,
      category: task.category,
    });

    // Prefill subtasks
    this.subtasks.set(task.subtasks ?? []);

    // Prefill assigned contacts ids
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

  getSelectedContacts(): Contact[] {
    const ids = this.form.get('assigned_contacts')!.value as string[];
    return this.contacts().filter((c) => ids.includes(c.id!));
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

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.touched && control.invalid);
  }
}
