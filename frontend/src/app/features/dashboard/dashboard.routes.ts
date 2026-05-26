import { Routes } from "@angular/router";
import { Dashboard } from "./dashboard";
export const dashboardRoutes: Routes = [


    { path: "", component: Dashboard },

    // pathMatch permet de forcer à checker l'url exact et pas seulement le début
    // "Si un utilisateur arrive sur mon site et que l'adresse 
    //dans son navigateur est strictement et uniquement localhost:4200/dashboard
    //(sans aucun mot écrit derrière le slash), alors redirige-le vers la
    //page dashboard." Si l'utilisateur a tapé le moindre caractère après le slash 
    //(ex: /dashboard ou /auth), cette règle est immédiatement ignorée et Angular
    //passe à la route suivante pour chercher une correspondance !
    //si jamais l'utilisateur tape http://localhost:4200/dashboard alors ça le ramène à dashboard

    { path: '', redirectTo: "", pathMatch: 'full' }

];