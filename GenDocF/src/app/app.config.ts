import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// ❌ On ne retire QUE provideClientHydration
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ On garde Zoneless car c'est ce qui marche chez toi
    provideZonelessChangeDetection(),
    
    provideRouter(routes),
    
    // ❌ ON SUPPRIME la ligne 'provideClientHydration()'
    // C'est elle qui crée l'erreur rouge NG0505 car on a désactivé le SSR.
    
    provideHttpClient(withFetch(), withInterceptorsFromDi())
  ]
};