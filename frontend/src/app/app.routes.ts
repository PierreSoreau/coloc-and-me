import { Routes } from '@angular/router';
import { authGuard } from './_core/guards/auth.guards';


export const routes: Routes = [
    {
        path: "auth", loadChildren: () => import("./features/authentification/auth.routes")
            .then(m => m.authRoutes)
    },

    {
        path: "dashboard", loadChildren: () => import("./features/dashboard/dashboard.routes")
            .then(m => m.dashboardRoutes)
    },

    // 3. RÈGLES GLOBALES
    //si jamais l'utilisateur tape http://localhost:4200/ alors ça le ramène à auth/login
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/auth/login' }
];



