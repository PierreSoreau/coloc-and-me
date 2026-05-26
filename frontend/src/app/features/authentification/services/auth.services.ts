//Injectable indique à Angular à qui la classe que l'on créé pourra être envoyé
//inject permet d'avoir accès à l'outil pour le fichier sur lequel on code
import { Injectable, NgZone, inject } from '@angular/core';
//httpClient permet d'envoyer des requettes http
import { HttpClient } from '@angular/common/http';
//Observable représente le flux de réponse donné par l'api de Node
//tap permet d'agir sur la réponse sans la modifier la stocker par exemple
import { Observable, tap } from 'rxjs';
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

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

export interface RegisterCredentials {
  firstname: string;
  lastname: string;
  email_adress: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface ResetPasswordCredentials {
  email_adress: string;
}

export interface ResetPasswordResponse {
  message: string;
}

//la classe que l'on créé pourra être utilisé autant de fois 
//que l'on veux dans l'app
@Injectable({
  providedIn: 'root',
})


export class AuthService {
  private http = inject(HttpClient)
  private router = inject(Router)
  private ngZone = inject(NgZone)
  // Initialisation de Supabase côté frontend (avec la clé publique)
  private supabase: SupabaseClient;
  //l'url qui permet d'envoyer la requette au bon endroit à node
  private apiUrl = "http://localhost:4000/api/auth"

  //ce constructeur est activé par défaut sur tous les composants qui utilisent AuthService
  //il permet de rediriger vers le dashboard dans le cas d'une connection ou d'une inscription avec mail à l'appui
  //ça permet également de resté connecté quand on se remet sur le site grâce au localstorage
  //INITIAL_SESSION c'est la session enregistré suite à la connection 
  //SIGNED_IN signifie au moment de la connection ou de l'inscription
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        if (session?.access_token) {
          localStorage.setItem("token", session.access_token)
          //ngZone permet à Angular de surveiller la redirection qui est une redirectio géré de base par supabase
          this.ngZone.run(() => {
            this.router.navigate(["/dashboard"]);
          });
        }
      }
      if (event === "PASSWORD_RECOVERY") {
        this.ngZone.run(() => {
          this.router.navigate(["/reset-password"]);
        });
      }
    });
  }

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

  register(credential: RegisterCredentials): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, credential);
  }

  forgotPassword(credential: ResetPasswordCredentials): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/resetpassword`, credential);
  }


}



