import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { ContactService } from '../../core/services/contact.service';
import { Loader } from '../../components/shared/loader/loader';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar,
    Header,
    Loader
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit {
  private contactService = inject(ContactService);
  isLoading = this.contactService.isLoading;

  ngOnInit(): void {
    this.contactService.getAll();
  }
}
