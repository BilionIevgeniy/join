import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // provideAppInitializer - for initial data loading, called before app starts
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.loadSession();
    }),
  ],
};
