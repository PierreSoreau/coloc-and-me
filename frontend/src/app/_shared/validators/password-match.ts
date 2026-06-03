import { ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms'

//fonction qui permet de checker si les deux mot de passe renseignés sont bien identiques
//On la met en dehors du register parce qu'elle peut être utilisée aussi en cas de mot de passe oublié
//ValidatorFn c'est le type Validateur officiel d'Angular
//AbstractControl c'est le type d'élément de formulaire soit le formulaire entier soit un seul champ
//ValidationErrors c'est le type de message exigé par Angular pour une validation
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    const password = control.get("password")
    const confirmPassword = control.get("confirmPassword")

    if (password && confirmPassword && password.value !== confirmPassword.value) {
        return { passwordMisMatch: true }
    }

    return null


}

export const emailMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    const email = control.get("email")
    const confirmEmail = control.get("confirmEmail")

    if (email && confirmEmail && email.value !== confirmEmail.value) {
        return { emailMisMatch: true }
    }

    return null


}