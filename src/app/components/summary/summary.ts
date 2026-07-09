import { Component, OnInit, input, output, signal } from '@angular/core';
import { SummaryTile } from './summary-tile/summary-tile';
import { SummaryDeadlineTile } from './summary-deadline-tile/summary-deadline-tile';

export const GREETING_INTRO_SESSION_KEY = 'summaryGreetingIntroPlayed';
export const GREETING_INTRO_HOLD_MS = 1500;
export const GREETING_INTRO_TRANSITION_MS = 400;

/**
 * Summary — presentational dashboard of task-count tiles and the greeting header.
 * Plays a one-time greeting animation on the first visit per browser session.
 */
@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [SummaryTile, SummaryDeadlineTile],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary implements OnInit {
  userName = input<string>('');
  greeting = input<string>('');

  todoCount = input<number>(0);
  doneCount = input<number>(0);
  urgentCount = input<number>(0);
  deadlineLabel = input<string | null>(null);
  boardCount = input<number>(0);
  inProgressCount = input<number>(0);
  awaitingCount = input<number>(0);

  tileClicked = output<void>();

  showGreetingIntro = signal(false);
  greetingIntroLeaving = signal(false);

  ngOnInit(): void {
    if (sessionStorage.getItem(GREETING_INTRO_SESSION_KEY)) return;
    sessionStorage.setItem(GREETING_INTRO_SESSION_KEY, 'true');

    this.showGreetingIntro.set(true);

    setTimeout(() => this.greetingIntroLeaving.set(true), GREETING_INTRO_HOLD_MS);
    setTimeout(
      () => this.showGreetingIntro.set(false),
      GREETING_INTRO_HOLD_MS + GREETING_INTRO_TRANSITION_MS,
    );
  }
}
