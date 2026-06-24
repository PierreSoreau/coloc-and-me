//Injectable indique à Angular à qui la classe que l'on créé pourra être envoyé
//inject permet d'avoir accès à l'outil pour le fichier sur lequel on code
import { Injectable, NgZone, inject } from '@angular/core';
//httpClient permet d'envoyer des requettes http
import { HttpClient, HttpHeaders } from '@angular/common/http';
//Observable représente le flux de réponse donné par l'api de Node
//tap permet d'agir sur la réponse sans la modifier la stocker par exemple
import { Observable, tap } from 'rxjs';
import { createClient, SupabaseClient, UserResponse } from "@supabase/supabase-js";
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { GroupService } from '../../group/services/group.services';
import { firstValueFrom } from 'rxjs';

//on définit le type des variables que l'on va 
// retrouver en paramètre de la fonction login
export interface LoginCredentials {
  email_adress: string;
  password: string;
}

//on définit le type des variables que l'on va avoir en réponse de Node
export interface AuthResponse {
  token: string;
  refresh_token: string;
}

export interface CheckGroupResponse {
  groupUUID: string;
  groupName: string;
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

export interface ForgotPasswordCredentials {
  email_adress: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordCredentials {
  password: string;
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
  private groupService = inject(GroupService)
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

      // Si le radar détecte que l'utilisateur clique sur un lien "Mot de passe oublié" reçu par mail,
      // il prend le contrôle d'Angular (this.ngZone.run) et force la page à 
      // changer vers le formulaire de réinitialisation.
      if (event === "PASSWORD_RECOVERY") {
        this.ngZone.run(() => {
          this.router.navigate(["auth/reset-password"]);
        });
      }

      //INITIAL SESSION c'est quand l'utilisateur ouvre le site et qu'il s'était connecté un autre jour
      //le navigateur check les cookies et retrouve la session
      //SIGNED IN veut dire au moment de la connection
      //TOKEN REFRESHED veut dire Quand le token expire au bout d'une heure 
      // et que Supabase le renouvelle tout seul en arrière-plan.
      else if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.access_token) {
          localStorage.setItem("token", session.access_token)
          if (session.refresh_token) { localStorage.setItem("refresh_token", session.refresh_token) }

          const currentUrl = this.router.url;

          // On vérifie si l'utilisateur est sur une page "publique" de connexion
          const isAuthPage = currentUrl.includes('/auth/login') || currentUrl.includes('/auth/register');

          if (event === "INITIAL_SESSION" && isAuthPage) {

            this.groupService.loadUserGroup().subscribe({

              next: () => {
                // Le backend a trouvé un groupe dans la table memberships, 
                // et la mémoire Angular (BehaviorSubject) est remplie !

                this.ngZone.run(() => this.router.navigate(["/dashboard"]));
              },
              error: () => {
                this.ngZone.run(() => this.router.navigate(["/group/group-home"]));
              }
            });
          }

        }

      }



    });
  }


  //la fonction signInWithPassword hache le password
  //check le password haché avec la base des mdp hachés pour voir si correspondance
  //il envoie une info comme quoi c'est bon à angular si correspondance et du coup l'utilisateur est connecté
  //credential c'est le contenu à envoyer dans la requête
  //Observable représente la réponse de Node à retourner au composant 
  async login(credential: LoginCredentials): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credential.email_adress,
      password: credential.password
    });

    if (error) {
      const supabaseMessage = error.message;

      if (supabaseMessage === "Invalid login credentials") {
        throw new Error("Email ou mot de passe incorrect.");
      } else if (supabaseMessage === "Email not confirmed") {
        throw new Error("Veuillez valider votre adresse email pour continuer.");
      } else if (supabaseMessage === "Too many requests") {
        throw new Error("Trop de tentatives, merci de réessayer plus tard.");
      }

      // Si c'est une erreur qu'on n'a pas prévue, on renvoie le message de base
      throw new Error(supabaseMessage);
    }

    // Supabase Angular gère déjà le token tout seul, mais si tu veux le forcer dans le localStorage :
    if (data.session && data.user) {
      localStorage.setItem("token", data.session.access_token);
      localStorage.setItem("refresh_token", data.session.refresh_token);
      localStorage.setItem("userId", data.user.id);
    }
  }

  async signOutSupabase() {
    await this.supabase.auth.signOut();
  }


  async register(credential: RegisterCredentials): Promise<void> {
    // 1. Angular crée le compte sur Supabase Auth
    //l'utilisateur renseigne sur le formulaire angular ses informations d'inscription
    // (password, firstname, lastname...),
    // l'email et le password sont ensuite enregistrés dans l'onglet authentification de supabase
    // c'est dans cet onglet qu'il y a une table User ou email et password sont renseignés en hachés
    // par supabase en automatique
    //La fonction SIGNUP de supabase hache le mot de passe enregistré, créé une uuid unique, vérifie si l'email existe déjà
    const { data, error } = await this.supabase.auth.signUp({
      email: credential.email_adress,
      password: credential.password
    });

    //si l'email existe déjà dans la base
    // ou que le format est mauvais ça renvoit un message d'erreur
    if (error) throw new Error(error.message);

    // 2. Si ça a marché, on demande à Node.js de créer la ligne dans la table 'profils'
    // On lui envoie juste les infos non sensibles et l'ID généré
    const userId = data.user?.id;
    const requeteNode$ = this.http.post(`${this.apiUrl}/create-profil`, {
      id: userId,
      firstname: credential.firstname,
      lastname: credential.lastname,
      email_adress: credential.email_adress
    })
    //firstValue permet d'au lieu d'avoir besoin d'un Observable pour une requette 
    //de pouvoir utiliser une promesse
    await firstValueFrom(requeteNode$);
  }

  forgotPassword(credential: ForgotPasswordCredentials): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/resetpassword`, credential);
  }

  //avec cette fonction on traite directement la mise à jour du mot de passe sur angular parce que 
  //avec node ça aurait plus compliqué il aurait fallut envoyer le token de session à node en plus du nouveau mot de passe
  //alors que sur angular on a déjà le token dans l'url donc on le chope sous le capot avec supabase via
  //upadateUser de supabase
  async resetPassword(credential: ResetPasswordCredentials): Promise<UserResponse> {
    return await this.supabase.auth.updateUser(credential)
  }

  async resetEmail(email_adress: string): Promise<UserResponse> {
    return await this.supabase.auth.updateUser({ email: email_adress })
  }

  checkGroup(token: string): Observable<CheckGroupResponse> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    //pipe et tap permettent de relier avec un tuyau le flux de données via pipe et tap permet de choper la données
    return this.http.get<CheckGroupResponse>(`${this.apiUrl}/getGroup`, { headers })

  }




}



