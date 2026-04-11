import { Component, input, output } from '@angular/core';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { Scr } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-favorite',
  imports: [SharedCommonModule],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss',
})
export class FavoriteComponent {
  readonly favoriteScrId = input.required<Scr>();
  protected readonly scrIdChange = output<Scr | undefined>();
}
