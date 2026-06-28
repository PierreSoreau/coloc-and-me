import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { createClient, SupabaseClient, UserResponse } from "@supabase/supabase-js";
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { GroupService } from '../../group/services/group.services';
import { firstValueFrom } from 'rxjs';

export interface LoginCredentials {
  email_adress: string;
  password: string;
}

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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient)
  private router = inject(Router)
  private ngZone = inject(NgZone)
  private groupService = inject(GroupService)

  private supabase: SupabaseClient;
  private apiUrl = "http://localhost:4000/api/auth"

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    this.supabase.auth.onAuthStateChange((event, session) => {

      if (event === "PASSWORD_RECOVERY") {
        this.ngZone.run(() => {
          this.router.navigate(["auth/reset-password"]);
        });
      }

      else if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.access_token) {
          localStorage.setItem("token", session.access_token)
          if (session.refresh_token) { localStorage.setItem("refresh_token", session.refresh_token) }

          const currentUrl = this.router.url;
          const isAuthPage = currentUrl.includes('/auth/login') || currentUrl.includes('/auth/register');

          if (event === "INITIAL_SESSION" && isAuthPage) {
            this.groupService.loadUserGroup().subscribe({
              next: () => {
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
      throw new Error(supabaseMessage);
    }

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
    const { data, error } = await this.supabase.auth.signUp({
      email: credential.email_adress,
      password: credential.password
    });

    if (error) throw new Error(error.message);

    const userId = data.user?.id;
    const requeteNode$ = this.http.post(`${this.apiUrl}/create-profil`, {
      id: userId,
      firstname: credential.firstname,
      lastname: credential.lastname,
      email_adress: credential.email_adress
    })

    await firstValueFrom(requeteNode$);
  }

  forgotPassword(credential: ForgotPasswordCredentials): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/resetpassword`, credential);
  }

  async resetPassword(credential: ResetPasswordCredentials): Promise<UserResponse> {
    return await this.supabase.auth.updateUser(credential)
  }

  async resetEmail(email_adress: string): Promise<UserResponse> {
    return await this.supabase.auth.updateUser({ email: email_adress })
  }

  checkGroup(token: string): Observable<CheckGroupResponse> {
    return this.http.get<CheckGroupResponse>(`${this.apiUrl}/getGroup`)
  }
}