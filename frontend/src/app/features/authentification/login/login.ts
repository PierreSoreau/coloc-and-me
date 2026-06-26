import { ButtonRecord } from './../../../_shared/button/button_record/button-record';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { InputComponent } from '../../../_shared/input/input';
import { HeaderAuth } from '../../../_shared/header-auth/header-auth';
import { AuthService, LoginCredentials } from '../services/auth.services';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { getFieldErrorMessage } from '../../../_shared/utils/forms-error';
import { GroupService } from '../../group/services/group.services';



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
  private groupService = inject(GroupService)
  private cdr = inject(ChangeDetectorRef)


  ngOnInit(): void {
    this.loginTitle.setTitle('Coloc&Me | Connection')
  }
  loginForm: FormGroup
  wrongForm: boolean = false
  invalidForm: boolean = false

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
    })
  }

  getErrorMessage(textField: string, nameField: string): string {
    const control = this.loginForm.get(nameField);

    return getFieldErrorMessage(textField, control);
  }


  async onSubmit() {
    if (this.loginForm.invalid) {
      this.invalidForm = true
      this.cdr.detectChanges()
      return
    }

    const rawData = this.loginForm.value

    const cleanData = {
      email_adress: rawData.email,
      password: rawData.password
    }

    try {

      await this.authService.login(cleanData);


      this.groupService.loadUserGroup().subscribe({

        next: (response) => {
          this.invalidForm = false
          this.wrongForm = false

          this.router.navigate(['/dashboard', response.groupId]);
        },

        error: (err) => {
          console.error("Pas de groupe pour cet utilisateur", err);
          this.router.navigate(['/group/group-home']);
        }
      });

    }

    catch (error) {
      this.wrongForm = true
      this.cdr.detectChanges()

      console.error("Echec de la connection", error);

    }
  }

}











