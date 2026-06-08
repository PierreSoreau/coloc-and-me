import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { Redirection } from '../../../_shared/button/redirection/redirection';
import { GroupService } from '../services/group.services';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-link-to-join',
  imports: [Redirection, RouterLink],
  templateUrl: './link-to-join.html',
  styleUrl: './link-to-join.scss',
})
export class LinkToJoin implements OnInit {
  copyAlertEmit: boolean = false
  groupName: string = ""
  private changeDetectorRef = inject(ChangeDetectorRef)
  private groupService = inject(GroupService)
  groupId: string | null = ""
  private timeoutId: any;

  guestlink: string = ""


  ngOnInit(): void {

    // au lieu de lire une seule fois le currentgroup et ne plus voir le currentgroup une 
    // au moindre ctrl f5 on utilise le currentgroup qui est un écouteur une radio 
    // qui permet d'actualiser le currentgroup au moindre ctrl f5 fait par app.js
    this.groupService.currentGroup$.subscribe((dataGroup) => {

      if (!dataGroup) {
        return
      }
      this.groupId = dataGroup.groupId

      this.guestlink = `http://localhost:4200/group/rejoindre/${this.groupId}`
      this.changeDetectorRef.detectChanges();

      this.groupService.getGroupName(this.groupId).subscribe({
        next: (response) => {
          this.groupName = response.groupName
          this.changeDetectorRef.detectChanges();

          console.log("récupération du nom du groupe:", this.groupName)



        },
        error: (error) => {
          console.error("Erreur lors de la récupération du nom du groupe", error)


        }
      })

    })




  }

  copy() {

    //navigator.clipboard.writeText c'est la fonctionnalité interne au navigateur 
    //qui permet de copier un élément dans le press papier
    navigator.clipboard.writeText(this.guestlink).then(() => {
      // 2. Si un chronomètre était déjà en cours, on le supprime !
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }
      this.copyAlertEmit = true
      this.changeDetectorRef.detectChanges();

      setTimeout(() => { this.copyAlertEmit = false; this.changeDetectorRef.detectChanges(); }, 3000)
      console.log("lien cliqué")

    })
      .catch((err) => {
        // 5. La sécurité : si le navigateur bloque la copie, on l'affiche dans la console
        console.error("Échec de la copie dans le presse-papier :", err);
      });
  }

}
