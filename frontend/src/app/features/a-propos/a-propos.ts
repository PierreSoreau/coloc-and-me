import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { GroupService } from '../group/services/group.services';

@Component({
  selector: 'app-a-propos',
  imports: [],
  templateUrl: './a-propos.html',
  styleUrl: './a-propos.scss',
})
export class APropos implements OnInit {

  openBox1: boolean = false
  openBox2: boolean = false
  groupId: string | null = null
  private groupService = inject(GroupService)
  private cdr = inject(ChangeDetectorRef)

  ngOnInit(): void {

    this.groupService.loadUserGroup().subscribe({
      next: (response) => {
        // Le composant redémarre, demande à Node.js, trouve le groupe, et affiche le bouton !
        this.groupId = response.groupId;
        this.groupService.notifyHeaderOfGroupChange(this.groupId)
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.groupId = null;
        this.cdr.detectChanges();
      }
    });



  }

}
