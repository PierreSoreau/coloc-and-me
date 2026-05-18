import { Routes } from "@angular/router";
import { Login } from "./login/login";

export const authRoutes: Routes = [

    { path: "login", component: Login },

    // pathMatch permet de forcer à checker l'url exact et pas seulement le début
    // "Si un utilisateur arrive sur mon site et que l'adresse 
    //dans son navigateur est strictement et uniquement localhost:4200/auth
    //(sans aucun mot écrit derrière le slash), alors redirige-le vers la
    //page login." Si l'utilisateur a tapé le moindre caractère après le slash 
    //(ex: /dashboard ou /auth), cette règle est immédiatement ignorée et Angular
    //passe à la route suivante pour chercher une correspondance !

    //si jamais l'utilisateur tape http://localhost:4000/auth alors ça le ramène à auth/login

    { path: '', redirectTo: "login", pathMatch: 'full' }

];