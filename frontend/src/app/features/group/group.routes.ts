import { Routes } from "@angular/router";
import { CreateGroup } from "./create-group/create-group";
import { GroupHome } from "./group-home/group-home";
import { JoinGroup } from "./join-group/join-group";
import { LinkToJoin } from "./link-to-join/link-to-join";
import { Rejoindre } from "./rejoindre/rejoindre";


export const groupRoutes: Routes = [

    { path: "create-group", component: CreateGroup },
    { path: "group-home", component: GroupHome },
    { path: "join-group", component: JoinGroup },
    { path: "link-to-join/:groupId", component: LinkToJoin },
    //là on ne peut pas anticiper la variable groupId du lien du coup
    //on le met en paramètre qu'on récupérera dans le lien collé dans la barre
    //de navigation par l'utilisateur
    { path: "rejoindre/:groupId", component: Rejoindre },








    //si jamais l'utilisateur tape http://localhost:4200/auth alors ça le ramène à auth/login
    //pathMatch full veut dire chemin absolue

    { path: '', redirectTo: "group-home", pathMatch: 'full' }

];