import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { Sidebar } from '../sidebar/sidebar.component';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    // Sidebar,
    Header,
    Footer
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
