import { bootstrapApplication } from '@angular/platform-browser';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AppComponent } from 'src/app/app.component';
import { appConfig } from 'src/app/app.config';

ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
