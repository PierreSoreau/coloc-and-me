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
    initial: string | null
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

export interface StatusResponse {
    userId: string,
    participationStatus: string,
    authorisationStatus: string
    actId: number
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



    newAct(credential: newActCredential, token: string): Observable<ActResponse> {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` })
        return this.http.post<ActResponse>(`${this.apiUrl}/new-act`, credential, {
            headers: headers,
            params: { groupId: credential.groupId }
        }).pipe(
            // Le "tap" permet d'exécuter du code au passage de la réponse 

            // SANS modifier la réponse pour le composant qui a cliqué

            tap((response) => {

                const currentActs = this.actsSubject.getValue()

                //permet de construire un tableau même si c'est un ibjet en retour
                const nouvellesActs = Array.isArray(response) ? response : [response];

                //on insère les deux tableaux dans un autre tableau mais les ... font que 
                //les crochets des tableaux sont flingués
                const newTaskBehaviorSubject = [...nouvellesActs, ...currentActs]
                this.actsSubject.next(newTaskBehaviorSubject)

            }))
    }

    updateStatus(token: string, participationStatus: string, authorisationStatus: string): Observable<StatusResponse> {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` })
        return this.http.put<StatusResponse>(`${this.apiUrl}/update-status`, { participationStatus, authorisationStatus }, {
            headers: headers
        }).pipe(
            // Le "tap" permet d'exécuter du code au passage de la réponse 

            // SANS modifier la réponse pour le composant qui a cliqué

            tap((response) => {

                const currentActs = this.actsSubject.getValue()

                const newCurrentActs = currentActs.map((act) => {
                    if (act.actId === response.actId) {

                        //on récupère l'ancien statut pour savoir si faut retirer ou pas dans le compteur initial
                        //exemple avant la statut c'était participe et puis après il décide de changer à peut-être
                        //dans ce cas faut retirer 1 à participe et rajouter 1 à peut-être
                        const oldUserStatus = act.authorisationAndParticipationStatus.find(s => s.profilId === response.userId);
                        const oldParticipation = oldUserStatus ? oldUserStatus.participationStatus : null;

                        const updatedStatuses = act.authorisationAndParticipationStatus.map((status) => {
                            if (status.profilId === response.userId) {
                                return {
                                    ...status, // Conserve profilId, initial, firstname, profilStatus
                                    participationStatus: response.participationStatus,
                                    authorisationStatus: response.authorisationStatus,

                                }
                            }
                            return status;
                        })
                        let newYes = act.numberYes;
                        let newMaybe = act.numberMaybe;
                        let newNo = act.numberNo;
                        let newWaiting = act.numberWaiting;

                        // 4. Si le statut a vraiment changé, on met à jour la balance
                        if (oldParticipation !== response.participationStatus) {

                            // On retire 1 à l'ancienne catégorie
                            if (oldParticipation === "participe") newYes--;
                            if (oldParticipation === "peut-être") newMaybe--;
                            if (oldParticipation === "ne peux pas") newNo--;
                            if (oldParticipation === "en attente") newWaiting--;

                            // On ajoute 1 à la nouvelle catégorie
                            if (response.participationStatus === "participe") newYes++;
                            if (response.participationStatus === "peut-être") newMaybe++;
                            if (response.participationStatus === "ne peux pas") newNo++;
                            if (response.participationStatus === "en attente") newWaiting++;
                        }

                        // 5. On retourne le NOUVEL objet act complètement propre
                        return {
                            ...act,
                            numberYes: newYes,
                            numberMaybe: newMaybe,
                            numberNo: newNo,
                            numberWaiting: newWaiting,
                            authorisationAndParticipationStatus: updatedStatuses
                        };


                    }
                    return act
                })

                this.actsSubject.next(newCurrentActs);



            }))
    }
}



