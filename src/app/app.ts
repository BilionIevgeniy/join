import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from './components/global/toast-container/toast-container';
import { ImageViewer } from './components/global/image-viewer/image-viewer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, ImageViewer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('join');
}
