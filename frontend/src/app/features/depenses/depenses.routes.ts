import { Routes } from "@angular/router";
import { DepensesHome } from "./depenses-home/depenses-home";
import { Remboursement } from "./remboursement/remboursement";
import { WriteDepense } from "./write-depense/write-depense";
import { DetailDepenses } from "./detail-depenses/detail-depenses";


export const depensesRoutes: Routes = [


    { path: "depenses-home/:groupId", component: DepensesHome },
    { path: "remboursement/:groupId", component: Remboursement },
    { path: "write-depense/:groupId", component: WriteDepense },
    { path: "detail-depenses/:groupId/:expenseId", component: DetailDepenses },



    // pathMatch permet de forcer à checker l'url exact et pas seulement le début
    // "Si un utilisateur arrive sur mon site et que l'adresse 
    //dans son navigateur est strictement et uniquement localhost:4200/depenses
    //(sans aucun mot écrit derrière le slash), alors redirige-le vers la
    //page dashboard." 

    //si quelqu'un arrive sur /depenses sans rien derrière
    { path: '', redirectTo: "/dashboard", pathMatch: 'full' },
    //si l'utilisateur tape une mauvaise sous-route, on le redirige vers le tableau de bord global.
    { path: '**', redirectTo: '/dashboard' }

];

