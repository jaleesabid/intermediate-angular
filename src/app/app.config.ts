import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { API_URL } from './core/tokens';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    // Day 1: Zone.js enabled. Day 2: switch to provideZonelessChangeDetection()
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideZonelessChangeDetection(),

    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    provideHttpClient(withFetch()),
    { provide: API_URL, useValue: 'http://localhost:3000' },

    // //https://static-assets.dev/cdn-cgi/image/width=500,format=auto/https://storage.googleapis.com/images-cdn-e0395.firebasestorage.app/angular-keynote.png
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        // remove /images/ from src
        const src = config.src.replace('/images/', '');
        return `https://static-assets.dev/cdn-cgi/image/width=${config.width},format=auto/https://storage.googleapis.com/images-cdn-e0395.firebasestorage.app/${src}`;
      },
    },

    provideClientHydration(withIncrementalHydration()),
  ],
};
