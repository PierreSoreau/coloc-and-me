import { Observable, of } from "rxjs"
import { HttpClient } from "@angular/common/http"
import { tap } from "rxjs/operators";
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

export interface ResponseMembershipsDelete {
    message: string
}

export interface ResponseGroupDelete {
    message: string
}

@Injectable({
    providedIn: 'root',
})
export class ProfilService {
    private http = inject(HttpClient)
    private apiUrl = "http://localhost:4000/api/profil"

    private profilCache: profilData | null = null
    private initialsCache: string | null = null

    getInitials(token: string): Observable<string> {
        return this.http.get<string>(`${this.apiUrl}/name`)
    }

    getDataProfil(token: string): Observable<profilData> {
        return this.http.get<profilData>(`${this.apiUrl}/dataProfil`)
    }

    logOut(token: string): Observable<string> {
        return this.http.post<string>("http://localhost:4000/api/auth/logout", {});
    }

    clearCaches() {
        this.profilCache = null;
        this.initialsCache = null;
    }

    updateProfil(credential: dataForUpdate): Observable<string> {
        const bodyforNode = {
            firstname: credential.firstname,
            lastname: credential.lastname
        }
        return this.http.put<string>("http://localhost:4000/api/auth/updateprofildata", bodyforNode).pipe(
            tap(() => {
                console.log("Mise à jour réussie : on vide le cache Angular");
                this.profilCache = null;
                this.initialsCache = null;
            })
        );
    }

    deleteGroupData(groupId: string): Observable<ResponseMembershipsDelete> {
        return this.http.delete<ResponseMembershipsDelete>("http://localhost:4000/api/profil/delete-group-data", {
            params: { groupId: groupId }
        })
    }
}