## **Coloc & Me** 

**Coloc & Me** est une application web (orientée mobile-first) conçue pour simplifier et pacifier la vie en colocation. Fini les disputes pour savoir qui doit faire le ménage ou les calculs savants pour rembourser les courses : l'application gère tout au même endroit. 

## **Fonctionnalités Principales** 

- **Gestion des Tâches :** Création de tâches ponctuelles ou récurrentes (quotidiennes, hebdomadaires, mensuelles), assignation aux membres et suivi par semaine. 

- **Dépenses et Remboursements Intelligents :** Saisie des dépenses communes. Le backend 

- intègre un algorithme d'optimisation des dettes qui calcule "qui doit combien à qui" en minimisant le nombre de transactions, avec une gestion ultra-précise des centimes. 

- **Activités Communes :** Proposition d'événements (soirées, réunions) avec gestion des présences (Oui, Non, Peut-être) et historique des activités passées. 

- **Gestion de Groupes :** Création de colocations, système d'invitation par lien, et étanchéité totale des données entre les différentes colocations. 

## **Stack Technologique** 

Le projet suit une architecture moderne séparant le client, le serveur et la base de données : 

- **Frontend :** Angular 21 (Standalone Components, Control Flow @if/@for), SCSS, RxJS (State Management via BehaviorSubject). 

- **Backend :** Node.js 24, Express.js 5. Couche logique intermédiaire sécurisée. 

- **Base de données & Authentification :** Supabase (PostgreSQL, Supabase Auth). 

## **Architecture & Sécurité** 

La sécurité a été placée au cœur du développement : 

- **Authentification JWT :** Les tokens sont interceptés et injectés dans chaque requête Angular. 

- **Row Level Security (RLS) :** La base de données Supabase est verrouillée par des politiques RLS strictes garantissant qu'un utilisateur ne peut interagir qu'avec les données de sa propre colocation. 

- **Middlewares Node.js :** Chaque route backend est protégée par des "vigiles" vérifiant la validité du token, l'appartenance au groupe, et les droits sur les ressources. 

## **Installation & Lancement en local** 

## **Prérequis** 

- Node.js (v18+) 

- Angular CLI (v21) 

- Un projet Supabase actif 

## **1. Cloner le projet** 
```
git clone https://github.com/PierreSoreau/coloc-and-me.git 

cd coloc-and-me
```

## **2. Lancer le Backend** 
```
cd backend 

npm install 
```
## Créez un fichier .env à la racine du backend avec : 

SUPABASE_URL=votre_url_supabase 

SUPABASE_KEY=votre_service_role_key 

```
npm run start
 
```
## **3. Lancer le Frontend** 
```
cd frontend 

npm install 
```
## Configurez vos variables d'environnement dans src/environments/environment.ts : 

supabaseUrl: 'votre_url_supabase', 

supabaseKey: 'votre_anon_key' 
```
ng serve 
```

