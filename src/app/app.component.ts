import { Component, inject } from '@angular/core';
import { FooterContainerComponent } from 'src/app/core/footer/footer.container';
import { CustomErrorHandler } from 'src/app/core/handlers/custom-error-handler';
import { HeaderContainerComponent } from 'src/app/core/header/header.container';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';
import { ScreenTransitionMapComponent } from 'src/app/shared/screen-transition-map/screen-transition-map.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { StoreUsecase } from 'src/app/usecase/store.usecase';

@Component({
  selector: 'app-root',
  imports: [
    SharedCommonModule,
    HeaderContainerComponent,
    FooterContainerComponent,
    ProgressSpinnerComponent,
    ScreenTransitionMapComponent,
  ],
  providers: [CustomErrorHandler],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly isDisabled = false; // アニメーションの非表示
  protected readonly usecase = inject(StoreUsecase);
}
