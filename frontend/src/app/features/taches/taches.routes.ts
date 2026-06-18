import { Routes } from "@angular/router";
import { NewTask } from "./new-task/new-task";
import { TachesHome } from "./taches-home/taches-home";
import { DetailTask } from "./detail-task/detail-task";


export const tachesRoutes: Routes = [



    { path: 'nouvelle-tache/:groupId', component: NewTask },
    { path: 'detail-tache/:groupId/:tacheId', component: DetailTask },

    { path: ':groupId', component: TachesHome },


    //si l'utilisateur tape une mauvaise sous-route, on le redirige vers le tableau de bord global.
    { path: '**', redirectTo: '/dashboard' }


];