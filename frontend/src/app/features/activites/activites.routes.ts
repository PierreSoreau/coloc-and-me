import { Routes } from "@angular/router";
import { NewAct } from "./new-act/new-act";
import { ActHome } from "./act-home/act-home";
import { DetailAct } from "./detail-act/detail-act";



export const activitesRoutes: Routes = [


    { path: "new-act/:groupId/:actId", component: NewAct },
    { path: "act-home/:groupId", component: ActHome },
    { path: "detail-act/:groupId/:actId", component: DetailAct },


    // pathMatch permet de forcer à checker l'url exact et pas seulement le début
    // "Si un utilisateur arrive sur mon site et que l'adresse 
    //dans son navigateur est strictement et uniquement localhost:4200/auth
    //(sans aucun mot écrit derrière le slash), alors redirige-le vers la
    //page login." Si l'utilisateur a tapé le moindre caractère après le slash 
    //(ex: /dashboard ou /auth), cette règle est immédiatement ignorée et Angular
    //passe à la route suivante pour chercher une correspondance !

    //si jamais l'utilisateur tape http://localhost:4200/auth alors ça le ramène à auth/login

    { path: '', redirectTo: "/activites/act-home/:groupId", pathMatch: 'full' },
    { path: '**', redirectTo: '/dashboard' }

];