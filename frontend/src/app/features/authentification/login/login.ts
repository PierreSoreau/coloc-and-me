import { Dashboard } from './../../dashboard/dashboard';
import { ButtonRecord } from './../../../_shared/button/button_record/button-record';
import { Component } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { HeaderAuth } from '../../../_shared/header-auth/header-auth';
import { Router } from '@angular/router';
import { AuthService, LoginCredientials } from '../services/auth.services';
import { inject } from '@angular/core';



@Component({
  selector: 'app-login',
  imports: [ButtonRecord, InputComponent, HeaderAuth],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService)
  private router = inject(Router)

  onSubmit(loginData: LoginCredientials): void {
    this.authService.login(loginData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard'])
      },
      error: (err) => {
        console.error("Echec de la connection", err);
      }
    })

  }










}
