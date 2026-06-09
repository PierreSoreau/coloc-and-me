import { Routes } from "@angular/router";
import { DepensesHome } from "./depenses-home/depenses-home";


export const depensesRoutes: Routes = [


    { path: "depenses-home", component: DepensesHome },


    // pathMatch permet de forcer à checker l'url exact et pas seulement le début
    // "Si un utilisateur arrive sur mon site et que l'adresse 
    //dans son navigateur est strictement et uniquement localhost:4200/depenses
    //(sans aucun mot écrit derrière le slash), alors redirige-le vers la
    //page depenses-home." Si l'utilisateur a tapé le moindre caractère après le slash 
    //(ex: /dashboard ou /auth), cette règle est immédiatement ignorée et Angular
    //passe à la route suivante pour chercher une correspondance !

    //si jamais l'utilisateur tape http://localhost:4200/auth alors ça le ramène à auth/login

    { path: '', redirectTo: "depenses-home", pathMatch: 'full' }

];

