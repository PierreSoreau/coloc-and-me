import { GroupService } from './../../features/group/services/group.services';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ProfilService } from '../../features/profil/services/profil.services';


@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {

  private profil = inject(ProfilService)
  private cdr = inject(ChangeDetectorRef)
  private groupService = inject(GroupService)
  private router = inject(Router)
  userInitials: string = ""
  currentGroupId: string | null = null
  currentUrl: string = ""

  ngOnInit(): void {
    this.initials();
    //on écoute la radio et currenGroup$ qui informe
    //si currentGroup existe ou pas 
    this.groupService.currentGroup$.subscribe(groupId => {
      this.currentGroupId = groupId
      this.cdr.detectChanges();
    })

    //on attribut l'url initial du premier clic du header
    this.currentUrl = this.router.url

    //on écoute les moindres changement d'url
    this.router.events.subscribe((event) => {
      //si le changement de page donc le changement d'url est effectif
      //alors on attribut le nouvel url à currentUrl
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects

      }
    })
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
