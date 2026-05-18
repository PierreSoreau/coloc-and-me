//ce fichier représente l'interrupteur général de l'application
//comme on a des requêtes http qui sont faites on doit allumer l'httpclient avec provide
//comme on a des routers il faut allumer Router et routes

import { ApplicationConfig } from '@angular/core';
//Router permet de lancer le routing

import { provideRouter } from '@angular/router';
//routes permet de transmettre le plan des routes à Angular
// [app.routes.ts] 
//        │
//        ▼ (Grâce à ton IMPORT)
// [app.config.ts] ──(via provideRouter)──► [Moteur Angular]
//        │                                        │
//        ▼ (Chargé au démarrage)                  ▼
//   [main.ts] ──────────────────────────► Rend l'application active et 
//                                         écoute les changements d'URL
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
};
