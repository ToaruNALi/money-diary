import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ScreenId } from 'src/app/shared/constants/types';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
    selector: 'app-favorite',
    imports: [SharedCommonModule],
    templateUrl: './favorite.component.html',
    styleUrl: './favorite.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoriteComponent {
  readonly favoriteScreenId = input.required<ScreenId>();
  protected readonly screenIdChange = output<ScreenId | undefined>();
}
