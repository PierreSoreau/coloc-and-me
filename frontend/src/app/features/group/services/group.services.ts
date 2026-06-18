import { FormArray, FormGroup } from "@angular/forms"
//Injectable indique à Angular à qui la classe que l'on créé pourra être envoyé
//inject permet d'avoir accès à l'outil pour le fichier sur lequel on code
import { Injectable, inject } from '@angular/core';
//httpClient permet d'envoyer des requettes http
import { HttpClient, HttpHeaders } from '@angular/common/http';
//Observable représente le flux de réponse donné par l'api de Node
//tap permet d'agir sur la réponse sans la modifier la stocker par exemple
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';


export interface createGroupCredential {
    groupName: string,
    participantsList: string[]


}
export interface recordMemberCredential {
    groupId: string,
    nickname: string
}


export interface createGroupResponse {
    message: string
    groupId: string
}

export interface loadGroupResponse {
    groupId: string
}

export interface groupNameResponse {
    groupName: string
}

export interface recordMemberResponse {
    message: string
}

export interface groupMemberResponse {
    memberList: string[]
}

export interface groupInitialAndNameResponse {
    firstname: string
    initials: string
    id: string
}

//la classe que l'on créé pourra être utilisé autant de fois 
//que l'on veux dans l'app
@Injectable({
    providedIn: 'root',
})

export class GroupService {

    private http = inject(HttpClient)
    private router = inject(Router)
    private apiUrl = "http://localhost:4000/api/group"
    //currentGroup c'est la variable dans laquelle on va stocker l'id du groupe pour pouvoir 
    //l'utiliser sur toutes les pages à volonté c'est grâce à BehaviorSubject 
    //qui est natif d'Angular. Grâce à ça tu peux stocker quelque soit la page cette info
    //et ainsi éviter de faire à chaque fois cette requette pour la moindre info que tu veux
    //sur les pages. Si l'utilisateur fait ctrl f5 la requette pour avoir de nouveau 
    //l'id est relancé et enregistré de nouveau dans le behaviorsubject
    private currentGroup = new BehaviorSubject<string | null>(null)

    //on rend accessible cette donnée à toute l'application en lecture seule
    //le dollar est une convention pour dire que c'est une donnée asynchrone 
    //qui nécessite un abonnement subsrcibe pour l'utiliser
    //asObservable() permet de rendre impossible la modification de cette variable par les autres composants
    //ils peuvent juste la lire
    public currentGroup$: Observable<string | null> = this.currentGroup.asObservable();


    //même chose pour les noms des utilisateurs du groupe
    private NamesUsersGroupSubject = new BehaviorSubject<groupInitialAndNameResponse[]>([])
    public namesUsers$ = this.NamesUsersGroupSubject.asObservable()

    notifyHeaderOfGroupChange(groupId: string) {
        this.currentGroup.next(groupId);
    }

    newGroup(credential: createGroupCredential): Observable<createGroupResponse> {
        return this.http.post<createGroupResponse>(`${this.apiUrl}/create-group`, credential)
    }

    loadUserGroup(): Observable<loadGroupResponse> {
        return this.http.get<loadGroupResponse>(`${this.apiUrl}/my-group`)
    }

    // getCurrentGroupId() {
    //     const group = this.currentGroup.getValue()
    //     return group ? group.groupId : null;
    // }

    clearCurrentGroupId() {
        this.currentGroup.next(null)
    }

    getGroupName(groupId: string): Observable<groupNameResponse> {
        return this.http.get<groupNameResponse>(`${this.apiUrl}/my-group-name`, {
            params: { groupId: groupId }
        })

    }

    getNameMember(groupId: string): Observable<groupMemberResponse> {
        return this.http.get<groupMemberResponse>(`${this.apiUrl}/members-name`, {
            params: { groupId: groupId }
        })
    }

    recordMemberId(credential: recordMemberCredential): Observable<recordMemberResponse> {
        return this.http.put<recordMemberResponse>(`${this.apiUrl}/record-member-id`, { nickname: credential.nickname }, {
            params: { groupId: credential.groupId }
        })
    }

    getNamePlusInitials(groupId: string): Observable<groupInitialAndNameResponse[]> {
        return this.http.get<groupInitialAndNameResponse[]>(`${this.apiUrl}/members-name-initials`, {
            params: { groupId: groupId }
        })
    }

    loadNameAndInitials(groupId: string): void {
        this.getNamePlusInitials(groupId).subscribe({
            next: (names) => {
                // On met à jour le cerveau des dates
                this.NamesUsersGroupSubject.next(names);
            },
            error: (error) => console.error("Erreur lors du chargement des noms des utilisateurs du groupe :", error)
        })
    }

    getCurrentNames(): groupInitialAndNameResponse[] {
        return this.NamesUsersGroupSubject.getValue()
    }


}

