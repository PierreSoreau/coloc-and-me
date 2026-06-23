import { Injectable, inject } from '@angular/core';
//httpClient permet d'envoyer des requettes http
import { HttpClient, HttpHeaders } from '@angular/common/http';
//Observable représente le flux de réponse donné par l'api de Node
//tap permet d'agir sur la réponse sans la modifier la stocker par exemple
import { BehaviorSubject, Observable } from 'rxjs';
import { addDays, endOfWeek, endOfMonth, endOfDay, startOfWeek, startOfISOWeek, format, addWeeks, parse } from "date-fns"
import { tap } from 'rxjs';
import { fr } from 'date-fns/locale';



export interface newActCredential {
    title: string
    description: string
    typeLocation: string
    location: string
    date: string
    groupId: string
}

export interface ActStatus {
    profilId: string
    firstname: string
    participationStatus: string
    authorisationStatus: string
    profilStatus: string
}


export interface ActResponse {
    actId: number
    title: string
    description: string
    typeLocation: string
    location: string
    date: string
    authorisationAndParticipationStatus: ActStatus[]
    numberYes: number,
    numberMaybe: number,
    numberNo: number
    numberWaiting: number
}




@Injectable({
    providedIn: 'root',
})

export class ActService {
    private http = inject(HttpClient)
    private apiUrl = "http://localhost:4000/api/activites"

    // actsSubject c'est le behaviorSubject qui est entretenu par le service act qui recense les acts de la coloc, ce qu'il contient est transmis
    // en continu aux composants qui lui sont associés via la lecture seule qui s'appelle acts$
    // le $ est une convention de dev pour dire que c'est une lecture seule de 
    // BehaviorSubject
    private actsSubject = new BehaviorSubject<ActResponse[]>([])
    public acts$ = this.actsSubject.asObservable()

    //remplissage du behaviorsubject (acts)

    loadActs(groupId: string): void {

        this.getAllActs(groupId).subscribe({
            next: (data) => {

                // On met à jour le cerveau des acts
                this.actsSubject.next(data);

            },
            error: (error) => console.error('Erreur lors du chargement des activités :', error)

        });
    }

    getAllActs(groupId: string): Observable<ActResponse[]> {
        return this.http.get<ActResponse[]>(`${this.apiUrl}/all-acts`, {
            params: { groupId: groupId }
        })
    }

    getCurrentActs() {
        return this.actsSubject.getValue()
    }



    newTask(credential: newActCredential, token: string): Observable<ActResponse> {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` })
        return this.http.post<ActResponse>(`${this.apiUrl}/new-act`, credential, {
            headers: headers,
            params: { groupId: credential.groupId }
        }).pipe(
            // Le "tap" permet d'exécuter du code au passage de la réponse 

            // SANS modifier la réponse pour le composant qui a cliqué

            tap((response) => {

                const currentTasks = this.actsSubject.getValue()

                //permet de construire un tableau même si c'est un ibjet en retour
                const nouvellesTaches = Array.isArray(response) ? response : [response];

                //on insère les deux tableaux dans un autre tableau mais les ... font que 
                //les crochets des tableaux sont flingués
                const newTaskBehaviorSubject = [...nouvellesTaches, ...currentTasks]
                this.actsSubject.next(newTaskBehaviorSubject)

            }))
    }



}



