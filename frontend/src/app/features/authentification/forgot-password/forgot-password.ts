import { ButtonRecord } from './../../../_shared/button/button_record/button-record';
import { Component, inject, OnInit } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { AuthService, LoginCredentials } from '../services/auth.services';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ButtonRecord, InputComponent, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword implements OnInit {
  private forgotPasswordTitle = inject(Title);

  ngOnInit(): void {
    this.forgotPasswordTitle.setTitle('Coloc&Me | Mot de passe oublié')


  }

}


