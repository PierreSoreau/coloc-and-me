import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProfilService } from '../../features/profil/services/profil.services';


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {

  private profil = inject(ProfilService)
  private cdr = inject(ChangeDetectorRef)
  userInitials: string = ""

  ngOnInit(): void {
    this.initials();
  }



  initials(): void {

    const tokeninfo = localStorage.getItem("token")

    if (!tokeninfo) {
      console.log("Pas de token disponible")
      //il faut surtout pas oublier ce return parce que sinon
      //typescript part du principe qu'après le if tokeninfo peut-être null 
      // parce qu'on a pas arrêté la fonction au if. Le return permet de stopper 
      //la fonction
      return
    }



    this.profil.getInitials(tokeninfo).subscribe({
      next: (response: string) => {
        this.userInitials = response
        console.log("CE QUE REÇOIT ANGULAR :", response, "Type :", typeof response);
        //cet outil permet de réveiller Angular s'il faut afficher un élément en visuel 
        // qui met du temps à arriver. Parce que de base angular affiche 
        // ce qu'il faut vite et se rendort mais si ça prend du temps d'envoyer la donnée
        // elle ne s'affiche pas du coup parce qu'Angular ne le fait pas
        // donc avec ça quand la donnée arrive ça réveil angular et affiche la donnée. 
        this.cdr.detectChanges();

      },

      error: (err) => {
        console.error("Erreur de chargement des initiales", err)
      }
    })
  }





}
