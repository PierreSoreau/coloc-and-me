//ce fichier représente l'interrupteur général de l'application
//comme on a des requêtes http qui sont faites on doit allumer l'httpclient avec provide
//comme on a des routers il faut allumer Router et routes

import { ApplicationConfig, LOCALE_ID } from '@angular/core';
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
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './_core/interceptors/auth.interceptors';
//ces deux imports et cette fonction permettent d'activer la localisation française 
//pour angular et ainsi pouvoir écrire correctement le mois de la date
//il faut aussi importer LOCAL_ID au dessus et le mettre dans le provider
import { registerLocaleData } from '@angular/common';
import localFr from '@angular/common/locales/fr';

registerLocaleData(localFr, "fr-FR")


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    // 3. Fournir l'identifiant de langue global pour toute l'application
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
};
