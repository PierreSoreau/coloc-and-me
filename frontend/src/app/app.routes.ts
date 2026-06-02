import { Routes } from '@angular/router';
import { authGuard } from './_core/guards/auth.guards';
import { Mainlayout } from './mainlayout/mainlayout';
import { ProfilSettings } from './features/profil/profil-settings/profil-settings';
import { Dashboard } from './features/dashboard/dashboard';


export const routes: Routes = [
    //pathmatch veut dire doit coorespondre exactement au chemin
    // pathMatch permet de forcer à checker l'url exact et pas seulement le début
    // "Si un utilisateur arrive sur mon site et que l'adresse 
    //dans son navigateur est strictement et uniquement localhost:4200/dashboard
    //(sans aucun mot écrit derrière le slash), alors redirige-le vers la
    //page dashboard." Si l'utilisateur a tapé le moindre caractère après le slash 
    //(ex: /dashboard ou /auth), cette règle est immédiatement ignorée et Angular
    //passe à la route suivante pour chercher une correspondance !
    //si jamais l'utilisateur tape http://localhost:4200/dashboard alors ça le ramène à dashboard

    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path: "auth", loadChildren: () => import("./features/authentification/auth.routes")
            .then(m => m.authRoutes)
    },

    {
        path: '', component: Mainlayout, canActivate: [authGuard], children: [
            {
                path: "dashboard", component: Dashboard
            },

            {
                path: "profil", component: ProfilSettings
            }

        ]
    }

    ,
    { path: '**', redirectTo: '/auth/login' }
];



