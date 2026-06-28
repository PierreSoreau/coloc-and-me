import { ButtonRecord } from './../../../_shared/button/button_record/button-record';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { HeaderAuth } from '../../../_shared/header-auth/header-auth';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
//tous les outils de node pour gérer des formulaires
//ReactiveFormsModule permet de faire le traducteur pour html pour comprendre les liens avec le fichier ts
//FormGroup c'est le dossier qui regroupe plusieurs champs à saisir
//FormBuilder c'est un outil qui permet d'écrire plus facilement les exigences du formulaire
//Validators c'est le contrôleur qualité 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { getFieldErrorMessage, getConfirmPasswordError } from '../../../_shared/utils/forms-error';
import { passwordMatchValidator } from '../../../_shared/validators/password-match';
import { AuthService, RegisterCredentials, RegisterResponse } from '../services/auth.services';


@Component({
  selector: 'app-register',
  imports: [ButtonRecord, InputComponent, HeaderAuth, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private registerTitle = inject(Title);
  private authService = inject(AuthService)
  private router = inject(Router)
  private changeDetectorRef = inject(ChangeDetectorRef)
  isEmitEmail: boolean = false;
  wrongForm: string | null = null

  ngOnInit() {
    this.registerTitle.setTitle("Coloc & Me | Inscription")
  }

  registerForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],

    }, { validators: passwordMatchValidator })
  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.registerForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }

  getConfirmPasswordError(): string {
    return getConfirmPasswordError(this.registerForm);
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      console.log("🚨 Le formulaire est INVALIDE !");
      return
    }

    const rawData = this.registerForm.value;

    const cleanData = {
      firstname: rawData.firstName,
      lastname: rawData.lastName,
      email_adress: rawData.email,
      password: rawData.password
    }

    try {


      await this.authService.register(cleanData)

      this.wrongForm = null


      this.isEmitEmail = true
      this.changeDetectorRef.detectChanges();

    }

    catch (error: any) {
      this.wrongForm = error.message
      console.error("Erreur d'inscription", error)
    }
  }




  toggle(): void {
    this.isEmitEmail = false
    this.changeDetectorRef.detectChanges();

  }

}

