import { Component } from '@angular/core';
import { BackButton } from '@shared/back-button/back-button';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [BackButton],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {}
