import { depensesRoutes } from './features/depenses/depenses.routes';
import { Routes } from '@angular/router';
import { authGuard } from './_core/guards/auth.guards';
import { Mainlayout } from './layout/mainlayout/mainlayout';
import { Introductionlayout } from './layout/introductionlayout/introductionlayout';
import { IntroductionPage } from './features/introduction-page/introduction-page';
import { Dashboard } from './features/dashboard/dashboard-home/dashboard';



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

    { path: '', redirectTo: '/introduction', pathMatch: 'full' },

    {
        path: 'introduction',
        component: Introductionlayout,
        children: [
            { path: '', component: IntroductionPage }
        ]
    },

    {
        path: "auth", loadChildren: () => import("./features/authentification/auth.routes")
            .then(m => m.authRoutes)
    },


    {
        path: '', component: Mainlayout,
        // canActivate protège l'entrée initiale dans le layout
        canActivate: [authGuard],
        // canActivateChild permet d'activer authGuard même quand tu es déjà dans le Mainlayout
        canActivateChild: [authGuard],

        children: [

            {
                path: "dashboard", component: Dashboard
            },
            {
                path: "dashboard/:groupId", component: Dashboard
            },



            {
                path: "profil",
                loadChildren: () => import("./features/profil/profil.routes").then(m => m.profilRoutes)
            },
            {
                path: "group", loadChildren: () => import("./features/group/group.routes")
                    .then(m => m.groupRoutes)
            },
            {
                path: "depenses", loadChildren: () => import("./features/depenses/depenses.routes")
                    .then(m => m.depensesRoutes)
            },
            {
                path: "taches", loadChildren: () => import("./features/taches/taches.routes")
                    .then(m => m.tachesRoutes)
            },
            {
                path: "activites", loadChildren: () => import("./features/activites/activites.routes")
                    .then(m => m.activitesRoutes)
            },

        ]
    }

    ,
    { path: '**', redirectTo: '/introduction', pathMatch: 'full' }
];



