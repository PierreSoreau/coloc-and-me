import { ButtonRecord } from './../../../_shared/button/button_record/button-record';
import { Component, inject, OnInit } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { HeaderAuth } from '../../../_shared/header-auth/header-auth';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from '../services/auth.services';
import { Title } from '@angular/platform-browser';



@Component({
  selector: 'app-login',
  imports: [ButtonRecord, InputComponent, HeaderAuth],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private authService = inject(AuthService)
  private router = inject(Router)
  private loginTitle = inject(Title)


  ngOnInit(): void {
    this.loginTitle.setTitle('Coloc&Me | Connection')
  }

  onSubmit(loginData: LoginCredentials): void {
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
