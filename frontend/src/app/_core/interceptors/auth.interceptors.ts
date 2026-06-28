//interceptor c'est le fichier qui est le douanier entre angular et node. Il permet de réaliser des contrôles
//et des modifications éventuelles sur les requettes qui partent pour node
//en l'occurrence ici c'est bien pratique pour intégrer le token sur chaque requette 
//au lieu de le faire dans chacune des fonctions qui en ont besoin
//contribue à la méthode DRY. C'est très pratique pour renouveler le token également quand il a expiré
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

// On initialise Supabase ici pour pouvoir interroger la session en direct
const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

// Interceptor c'est le fichier qui est le douanier entre angular et node.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    // Fonction qui permet de rediriger l'utilisateur vers la connection si ça fait trop longtemps
    //qu'il est sur sa session et qu'elle a expiré
    const handleAuthError = (error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
            console.error('Session expirée ou invalide côté serveur, déconnexion forcée.');

            // On déconnecte l'utilisateur
            // et on efface le localstorage
            supabase.auth.signOut();
            localStorage.clear();

            // On le renvoie directement vers la page introduction 
            //de l'appli
            router.navigate(['/introuction']);
        }

        // On fait remonter l'erreur pour le reste de l'application
        return throwError(() => error);
    };


    // si le token est périmé grâce à getsession on chope le 
    // nouveau token avant de lancer la requette 
    // donc ça se fait en 2 étapes 
    //première étape il y a la requette getsession puis ensuite 
    //la vraie requette demandée d'Angular
    return from(supabase.auth.getSession()).pipe(
        switchMap(({ data }) => {
            const token = data.session?.access_token;

            // On crée un clone de la requête pour la modifier
            let authReq = req;

            // Si on a récupéré un token valide, on l'ajoute au header
            if (token) {
                authReq = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            // on envoit la requête finale à Node avec le token
            // qui est à jour et correct et dans le cas ou
            // token est pas bon on redirige vers la connection
            return next(authReq).pipe(
                catchError(handleAuthError)
            );
        })
    );
};