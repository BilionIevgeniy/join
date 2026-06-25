import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { ContactService } from '../../core/services/contact.service';
import { Loader } from '../../components/shared/loader/loader';
import { Modal } from '../../components/shared/modal/modal';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Header, Loader, Modal],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit {
  private contactService = inject(ContactService);
  private taskService = inject(TaskService);
  isLoading = computed(() => this.contactService.isLoading() || this.taskService.isLoading());

  ngOnInit(): void {
    this.contactService.getAll();
    this.taskService.getAll();
  }
}
