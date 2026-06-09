import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GroupService } from './features/group/services/group.services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  isAppReady = signal<boolean>(false)

  //là ici on détail le code qui est nécessaire pour relancer la requête
  //du get group id, sans ça si on fait ctrl f5 sur l'application on a plus 
  //en mémoire le groupId parce qu'on l'aura lancé qu'une fois à la connection ou l'inscription
  constructor(private groupService: GroupService) { }


  ngOnInit() {
    if (localStorage.getItem("token")) {
      //il est indispensable d'avoir cette fonction en centralisé parce que c'est la fonction
      //qui charge le groupId dont on se sert sur toute l'application
      //elle prend du temps à arriver mais faut absolument qu'elle se fasse avant qu'angular 
      //se lance sur ces pages donc on bloque tant qu'on a pas de réponse à cette fonction
      //un receptionné la réponse on change le isAppReady en true
      //ce qui enclenche le html 
      this.groupService.loadUserGroup().subscribe({
        next: () => {
          // Quand on a la réponse, on débloque l'application !
          this.isAppReady.set(true);
        },
        error: () => {
          // Gérer le cas où le token est expiré ou le serveur planté
          this.isAppReady.set(true);
        }
      });
    } else {
      // S'il n'y a pas de token (ex: page de login), on débloque direct
      this.isAppReady.set(true);
    }
  };
}




