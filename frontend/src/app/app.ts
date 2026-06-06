import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GroupService } from './features/group/services/group.services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  //là ici on détail le code qui est nécessaire pour relancer la requête
  //du get group id, sans ça si on fait ctrl f5 sur l'application on a plus 
  //en mémoire le groupId parce qu'on l'aura lancé qu'une fois à la connection ou l'inscription
  constructor(private groupService: GroupService) { }
  ngOnInit() {
    if (localStorage.getItem("token")) {
      this.groupService.loadUserGroup().subscribe();
    }
  }
}

