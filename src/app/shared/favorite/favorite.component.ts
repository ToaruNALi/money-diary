import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Scr } from 'src/app/shared/constants/types';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-favorite',
  imports: [SharedCommonModule],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteComponent {
  readonly favoriteScrId = input.required<Scr>();
  protected readonly scrIdChange = output<Scr | undefined>();
}
