//la class Router permet de permet d'utiliser une action de Redirection
//à ne pas confondre avec Routes qui représente un typage de Typescript 
//qui permet d'avoir obligatoirement un tableau avec des chemins valides  
import { Router, CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";

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
    const token = localStorage.getItem("token")
    const groupName = localStorage.getItem("groupName")

    if (token) {
        if (groupName) {
            return true
        }
        else {
            //sinon s'il y a pas de groupe pour cet utilisateur mais que dans l'url il y a
            //group dans ce cas tu peux passer
            if (state.url.includes("/group")) {
                return true
            }

            else if (state.url.includes("/profil")) {
                return true
            }
            //sinon s'il y a pas de groupe pour cet utilisateur et que le lien est différent de group
            //dans ce cas tu vas vers le lien groupe
            else {
                router.navigate(["/group/group-home"])
                return false
            }
        }
    }
    else {
        router.navigate(["/auth/login"])
        return false
    }
}
