import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StorageContainerComponent } from 'src/app/features/money-diary/setting/storage/storage.container';

@Component({
  selector: 'app-storage-page',
  imports: [StorageContainerComponent],
  template: ` <app-storage-container></app-storage-container> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoragePageComponent {}
