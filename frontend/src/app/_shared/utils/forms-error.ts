
import { AbstractControl, FormGroup } from '@angular/forms';

//fonction qui permet de sortir le message d'erreur en fonction du type de champ du formulaire
//control? veut dire est-ce que la constante control existe. C'est la sécurité pour être sur qu'on
//n'a pas mal écris quand on a écrit le get(le nom du control)
//en mettant cette sécurité ça évite de planter tout le code.
//cela plante que ce code en mettant null
//Pour comprendre complètement les prorpiétés du contrôle des champs:
//-.touched=clic sur le champ
//-.dirty=ecris dans le champ
//ensuite hasError(X) veut dire est-ce que la règle X a été enfreinte, exemple hasError("required") ou hasError("pattern") 

export function getFieldErrorMessage(textField: string, control: AbstractControl | null): string {

    if (!control?.touched && !control?.dirty) return ''

    if (control.hasError("required")) {
        return `${textField} doit obligatoirement être renseigné`
    }

    if (control.hasError("email")) {
        return "Le format de l'email n'est pas valide"
    }

    if (control.hasError("pattern")) {

        if (textField.toLowerCase().includes("mot de passe")) {
            return "Le mot de passe n'est pas valide (8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)"
        }
        return "Le format de ${textField} n'est pas valide "
    }

    if (control.hasError("minlength")) {
        return `${textField} doit contenir au moins 2 caractères.`
    }
    return ''
}

export function getConfirmPasswordError(Form: FormGroup, controlName: string = 'confirmPassword'): string {
    const control = Form.get(controlName);


    if (!control || (!control.touched && !control.dirty)) {
        return '';
    }


    if (control.hasError('required')) {
        return 'Veuillez confirmer votre mot de passe.';
    }

    // On interroge LE FORMULAIRE, pas le champ !
    if (Form.hasError('passwordMismatch')) {
        return 'Les mots de passe ne sont pas identiques.';
    }

    return '';
}

export function getConfirmEmailError(Form: FormGroup, controlName: string = 'confirmEmail'): string {
    const control = Form.get(controlName);


    if (!control || (!control.touched && !control.dirty)) {
        return '';
    }


    if (control.hasError('required')) {
        return 'Veuillez confirmer votre email.';
    }

    // On interroge LE FORMULAIRE, pas le champ !
    if (Form.hasError('passwordMismatch')) {
        return 'Les adresses mail ne sont pas identiques.';
    }

    return '';
}
