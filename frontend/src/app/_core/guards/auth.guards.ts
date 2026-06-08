import { GroupService } from './../../features/group/services/group.services';
//la class Router permet de permet d'utiliser une action de Redirection
//à ne pas confondre avec Routes qui représente un typage de Typescript 
//qui permet d'avoir obligatoirement un tableau avec des chemins valides  
import { Router, CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { map, catchError, of } from "rxjs";

//route permet de récupérer les informations personnalisées 
//du profil présentes dans l'url (l'id et autre par exemple)
//exemple dans cet url: /coloc/appartement-a/taches/modifier/42?priorite=haute
//ça va prendre  42 si je fais route.params["id"]
//state permet d'enregistrer l'url complet renseigné dans la base
//cet url enregistré être utilisé directement après la connection de l'utilisateur 
//si jamais la connection est correct
//exemple l'utilisateur tape http://localhost/tasks mais il ne s'est pas connecté
//et par défaut il v a être redirigé vers login mais dès qu'il sera connecté ça va l'amener
//directement sur task sans qu'il ait à taper de nouveau

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const groupService = inject(GroupService)
    const token = localStorage.getItem("token")


    if (!token) {
        router.navigate(["/auth/login"])
        return false
    }

    else {
        //le if si on  navigue de page en page il y a pas de ctrl f5
        const groupId = groupService.getCurrentGroupId()
        if (groupId) {
            return true
        }

        else {

            //la situation dans le cas d'un ctrl + f5 dans ce cas 
            //on refait un chargement du groupe id complet
            //avec loaduser

            return groupService.loadUserGroup().pipe(
                map(() => {
                    return true
                }),

                catchError(() => {
                    if (state.url.includes("/group") || state.url.includes("/profil") || state.url.includes("/rejoindre")) {
                        return of(true)
                    }


                    else {
                        router.navigate(["group/group-home"])
                        return of(false)
                    }
                })



            )
        }
    }

}
