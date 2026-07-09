import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** "Not a Join user? Sign up" prompt shown next to the login form and in the auth layout header. */
@Component({
  selector: 'app-signup-hint',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './signup-hint.html',
  styleUrl: './signup-hint.scss',
})
export class SignupHint {}
