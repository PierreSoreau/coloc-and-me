import { HttpInterceptorFn } from "@angular/common/http";


//interceptor c'est le fichier qui est le douanier entre angular et node. Il permet de réaliser des contrôles
//et des modifications éventuelles sur les requettes qui partent pour node
//en l'occurrence ici c'est bien pratique pour intégrer le token sur chaque requette 
//au lieu de le faire dans chacune des fonctions qui en ont besoin
//contribue à la méthode DRY
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem("token")

    //si le token n'existe pas ou que le token est déjà renseigné dans le header de la requête 
    //alors dans ce cas on ne fait rien on laisse juste passer la requête avec 
    //next
    if (!token || req.headers.has("Authorization")) {
        //next veut simplement dire on continue le flux de transfert de la requête
        return next(req)
    }

    //sinon on créé un clone de la requette parce que sinon impossible de la modifier
    //et on ajoute le token dans le header et on laisse passer la requette clonée
    //setHeaders permet de modifier le Headers mais sans écraser potentiellement le reste du header s'il 
    //y a d'autres choses dans le headers
    const clonedRequest = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    })

    return next(clonedRequest)


}