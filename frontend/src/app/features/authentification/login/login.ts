import { ButtonRecord } from './../../../_shared/button/button_record/button-record';
import { Component, inject, OnInit } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { HeaderAuth } from '../../../_shared/header-auth/header-auth';
import { AuthService, LoginCredentials } from '../services/auth.services';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';



@Component({
  selector: 'app-login',
  imports: [ButtonRecord, InputComponent, HeaderAuth, RouterLink, ReactiveFormsModule],
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
  loginForm: FormGroup

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/)]],
    })
  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.loginForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }


  onSubmit() {
    if (this.loginForm.invalid) {
      return
    }

    const rawData = this.loginForm.value

    const cleanData = {
      email_adress: rawData.email,
      password: rawData.password
    }

    this.authService.login(cleanData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard'])
      },
      error: (err) => {
        console.error("Echec de la connection", err);
      }
    })

  }










}
