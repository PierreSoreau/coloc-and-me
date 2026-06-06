import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-redirection',
  imports: [RouterLink],
  templateUrl: './redirection.html',
  styleUrl: './redirection.scss',
})
export class Redirection {
  @Input() linkRedirection: string = ""
  @Input() logoSource: string = ""
  @Input() altAssetRedirection: string = ""
  @Input() redirectionName: string = ""
}
