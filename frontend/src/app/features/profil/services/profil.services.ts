import { Observable, of } from "rxjs"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { last, tap } from "rxjs/operators";
import { inject, Injectable } from "@angular/core"


export interface profilData {
    firstname: string
    lastname: string
    email_adress: string
}

export interface dataForUpdate {
    firstname: string
    lastname: string
    token: string
}


@Injectable({
    providedIn: 'root',
})


export class ProfilService {
    private http = inject(HttpClient)
    //l'url qui permet d'envoyer la requette au bon endroit à node
    private apiUrl = "http://localhost:4000/api/profil"
    //c'est le cache des informations du profil(nom,prenom,email)
    //pour éviter de faire des requetes sans arret là c'est demandé une fois 
    //et après c'est réutilisé seulement
    private profilCache: profilData | null = null
    private initialsCache: string | null = null

    getInitials(token: string): Observable<string> {

        if (this.initialsCache) {
            console.log("les initiales ont été récupérées du cache Angular ")
            //initials permet de transformer une variable string en observable
            return of(this.initialsCache)
        }

        console.log("initiales récupérées du serveur Node")

        //le header doit être transféré via un httpheader obligatoirement
        //il faut mettre Bearer pour que Node puisse comprendre qu'il s'agit
        //d'un jeton d'authentification
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` })
        //pipe et tap permettent de relier avec un tuyau le flux de données via pipe et tap permet de choper la données
        return this.http.get<string>(`${this.apiUrl}/name`, { headers }).pipe(tap((dataDepuisServeur) => {
            this.initialsCache = dataDepuisServeur
        }))
    }

    getDataProfil(token: string): Observable<profilData> {
        if (this.profilCache) {
            console.log("les données du profil ont été récupérées du cache Angular ")
            return of(this.profilCache)
        }



        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` })
        //pipe et tap permettent de relier avec un tuyau le flux de données via pipe et tap permet de choper la données
        return this.http.get<profilData>(`${this.apiUrl}/dataProfil`, { headers }).pipe(tap((dataDepuisServeur) => {

            console.log("Informations du profil récupérées du serveur Node", dataDepuisServeur)
            this.profilCache = dataDepuisServeur
        }))

    }

    logOut(token: string): Observable<string> {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` })
        return this.http.post<string>("http://localhost:4000/api/auth/logout", { headers });

    }

    updateProfil(credential: dataForUpdate): Observable<string> {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${credential.token}` })
        const bodyforNode = {
            firstname: credential.firstname,
            lastname: credential.lastname
        }
        return this.http.put<string>("http://localhost:4000/api/auth/updateprofildata", bodyforNode, { headers }).pipe(
            tap(() => {
                // Si Node.js répond que c'est un succès, on FORCE le cache à se vider.
                // Comme ça, au prochain appel de getDataProfil, Angular ira chercher le nouveau nom tout frais !
                console.log("Mise à jour réussie : on vide le cache Angular");
                this.profilCache = null;
                this.initialsCache = null;
            })
        );
    }



}
