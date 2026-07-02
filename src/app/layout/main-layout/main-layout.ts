import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '@app/layout/header/header';
import { Sidebar } from '@app/layout/sidebar/sidebar';
import { ContactService } from '@core/services/contact.service';
import { Loader } from '@shared/loader/loader';
import { Modal } from '@shared/modal/modal';
import { ModalService } from '@core/services/modal.service';
import { TaskService } from '@core/services/task.service';

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
  modalService = inject(ModalService);
  isLoading = computed(() => this.contactService.isLoading() || this.taskService.isLoading());

  ngOnInit(): void {
    this.contactService.getAll();
    this.taskService.getAll();
  }
}
