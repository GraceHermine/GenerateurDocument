import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
// ✅ IMPORTANT : On importe 'config' (étape 2) et surtout pas 'appConfig' (étape 1)
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;