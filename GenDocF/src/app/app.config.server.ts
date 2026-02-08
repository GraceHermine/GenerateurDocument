import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config'; // ✅ Il importe le fichier de l'étape 1

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering() // ⚡ C'EST LA CLÉ ANTI-ERREUR NG0401
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);