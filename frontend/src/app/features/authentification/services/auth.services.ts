//Injectable indique à Angular à qui la classe que l'on créé pourra être envoyé
//inject permet d'avoir accès à l'outil pour le fichier sur lequel on code
import { Injectable, inject } from '@angular/core';
//httpClient permet d'envoyer des requettes http
import { HttpClient } from '@angular/common/http';
//Observable représente le flux de réponse donné par l'api de Node
//tap permet d'agir sur la réponse sans la modifier la stocker par exemple
import { Observable, tap } from 'rxjs';

//on définit le type des variables que l'on va 
// retrouver en paramètre de la fonction login
export interface LoginCredentials {
  email_adress: string;
  password: string;
}

//on définit le type des variables que l'on va avoir en réponse de Node
export interface AuthResponse {
  token: string;
}

//la classe que l'on créé pourra être utilisé autant de fois 
//que l'on veux dans l'app
@Injectable({
  providedIn: 'root',
})


export class AuthService {
  private http = inject(HttpClient)
  //l'url qui permet d'envoyer la requette au bon endroit à node
  private apiUrl = "http:localhost:4000/api/auth"

  //credential c'est le contenu à envoyer dans la requête
  //Observable représente la réponse de Node à retourner au composant 
  login(credential: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credential)
      .pipe(tap(response => {
        //si la réponse de Node fonctionne on enregistre en localStorage la session 
        //qui s'appelle response.token 
        if (response && response.token) {
          localStorage.setItem('token', response.token)
        }
      }))
  }


}
