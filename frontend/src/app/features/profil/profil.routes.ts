import { Routes } from '@angular/router';
import { ProfilSettings } from './profil-settings/profil-settings';
import { NewEmail } from './new-email/new-email';
import { NewPassword } from './new-password/new-password';

// export de tes routes dédiées au profil
export const profilRoutes: Routes = [
    {
        path: '', // Le chemin vide correspond à localhost:4200/profil
        component: ProfilSettings
    },
    {

        path: 'new-email', component: NewEmail

    },
    {

        path: 'new-password', component: NewPassword
    },

    {
        path: ':groupId',
        component: ProfilSettings
    },

];