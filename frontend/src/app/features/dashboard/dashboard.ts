import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../group/services/group.services';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private groupService = inject(GroupService)
  groupId: string | null = null

  ngOnInit(): void {

    //en gros au lieu de prendre une photo à un instant 
    // t on écoute si changement de l'url et si présence du paramètre de l'url 
    // on prévient le header du changement
    this.route.paramMap.subscribe(params => {
      //on chope le groupId de l'url
      this.groupId = params.get("groupId")

      if (this.groupId) {
        this.groupService.notifyHeaderOfGroupChange(this.groupId)
      }
      else {
        // L'utilisateur est arrivé sur le chemin racine "/dashboard".
        // On va chercher son groupe en base de données.
        this.groupService.loadUserGroup().subscribe({
          next: (response) => {

            const groupId = response.groupId;

            //redirection vers le bon dashboard
            this.router.navigate(['/dashboard', groupId]);
          },
          error: (err) => {
            console.error("Aucun groupe trouvé pour cet utilisateur", err);
            // S'il n'a pas de groupe, on l'envoie vers la création 
            this.router.navigate(['/group/group-home']);
          }
        });


      }
    })

  }

}
