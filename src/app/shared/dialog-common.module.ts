import { NgModule } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

@NgModule({
  imports: [MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  exports: [MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
})
export class DialogCommonModule {}
