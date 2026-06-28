import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs';

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

    private actsSubject = new BehaviorSubject<ActResponse[]>([])
    public acts$ = this.actsSubject.asObservable()

    loadActs(groupId: string): void {
        this.getAllActs(groupId).subscribe({
            next: (data) => {
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
        return this.http.post<ActResponse>(`${this.apiUrl}/new-act`, credential, {
            params: { groupId: credential.groupId }
        }).pipe(
            tap((response) => {
                const currentActs = this.actsSubject.getValue()
                const nouvellesActs = Array.isArray(response) ? response : [response];
                const newTaskBehaviorSubject = [...nouvellesActs, ...currentActs]
                this.actsSubject.next(newTaskBehaviorSubject)
            }))
    }

    updateStatus(token: string, participationStatus: string, authorisationStatus: string, actId: number): Observable<StatusResponse> {
        return this.http.put<StatusResponse>(`${this.apiUrl}/update-status`, { participationStatus, authorisationStatus, actId })
            .pipe(
                tap((response) => {
                    const currentActs = this.actsSubject.getValue()
                    const newCurrentActs = currentActs.map((act) => {
                        if (act.actId === response.actId) {
                            const oldUserStatus = act.authorisationAndParticipationStatus.find(s => s.profilId === response.userId);
                            const oldParticipation = oldUserStatus ? oldUserStatus.participationStatus : null;

                            const updatedStatuses = act.authorisationAndParticipationStatus.map((status) => {
                                if (status.profilId === response.userId) {
                                    return {
                                        ...status,
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

                            if (oldParticipation !== response.participationStatus) {
                                if (oldParticipation === "participe") newYes--;
                                if (oldParticipation === "peut-être") newMaybe--;
                                if (oldParticipation === "ne peux pas") newNo--;
                                if (oldParticipation === "en attente") newWaiting--;

                                if (response.participationStatus === "participe") newYes++;
                                if (response.participationStatus === "peut-être") newMaybe++;
                                if (response.participationStatus === "ne peux pas") newNo++;
                                if (response.participationStatus === "en attente") newWaiting++;
                            }

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

    deleteAct(actId: number): Observable<{ id: number }> {
        return this.http.delete<{ id: number }>(`${this.apiUrl}/delete-act`, {
            params: { actId: actId }
        }).pipe(
            tap((response) => {
                const currentActs = this.actsSubject.getValue()
                const newCurrentActs = currentActs.filter((act) =>
                    act.actId !== response.id)
                this.actsSubject.next(newCurrentActs);
            }))
    }

    updateAct(actId: number, credential: newActCredential): Observable<{ id: number, title: string, description: string, type_location: string, location: string, date: string }> {
        return this.http.put<{ id: number, title: string, description: string, type_location: string, location: string, date: string }>(`${this.apiUrl}/update-act`, credential, {
            params: { actId: actId }
        }).pipe(
            tap((response) => {
                const currentActs = this.actsSubject.getValue()
                const newCurrentActs = currentActs.map((act) => {
                    if (act.actId === response.id) {
                        return {
                            ...act,
                            title: response.title,
                            description: response.description,
                            typeLocation: response.type_location,
                            location: response.location,
                            date: response.date
                        }
                    }
                    return act
                })
                this.actsSubject.next(newCurrentActs);
            }))
    }

    getOneAct(actId: number): Observable<{ title: string, description: string, type_location: string, location: string, date: string }> {
        return this.http.get<{ title: string, description: string, type_location: string, location: string, date: string }>(`${this.apiUrl}/get-one-act`, { params: { actId: actId } })
    }
}