import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../services/group.services';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-rejoindre',
  imports: [ReactiveFormsModule],
  templateUrl: './rejoindre.html',
  styleUrl: './rejoindre.scss',
})
export class Rejoindre implements OnInit {

  groupId: string | null = ""
  rejoindreForm!: FormGroup

  //c'est l'outil qui permet de récupérer l'url renseigné dans la barre de navigation par l'utilisateur
  private route = inject(ActivatedRoute)
  private groupService = inject(GroupService)
  private fb = inject(FormBuilder)
  private changeDetectorRef = inject(ChangeDetectorRef)
  private router = inject(Router)




  ngOnInit(): void {
    //on chope le groupId situé après rejoindre/ dans l'url
    this.groupId = this.route.snapshot.paramMap.get("groupId")

    if (this.groupId) {

      this.rejoindreForm = this.fb.group({ membres: this.fb.array([]) })

      this.groupService.getNameMember(this.groupId).subscribe({
        next: (response) => {

          console.log("Réponse reçue du serveur :", response);
          const memberTable = response.memberList
          this.createInput(memberTable)
          this.changeDetectorRef.detectChanges();
        },

        error: (error) => {
          console.error("Erreur d'affichage de la page", error)
        }
      })
    }

    else {
      console.error("Impossible de charger les dépenses : pas d'ID dans l'URL");
    }
  }

  get membresArray() {
    return this.rejoindreForm.get("membres") as FormArray
  }


  createInput(memberTable: string[]) {

    for (const member of memberTable) {

      this.membresArray.push(this.fb.control(member))
    }
  }

  choisirNom(nickname: string) {

    if (!this.groupId) {
      return
    }
    this.groupService.recordMemberId({ groupId: this.groupId, nickname: nickname }).subscribe({
      next: (response) => {
        console.log(response.message)
        this.router.navigate(["/dashboard", this.groupId])

      },

      error: (error) => {
        console.error("Erreur lors de l'enregistrement de l'id du membre", error)
      }
    })


  }
}
