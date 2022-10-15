import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationViewComponent } from './application-view/application-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from "@angular/material/table";

const MAT_MODULES = [
  MatToolbarModule,
  MatButtonModule,
  MatTableModule,
];

@NgModule({
  declarations: [
    AdminComponent,
    ApplicationListComponent,
    ApplicationViewComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ...MAT_MODULES,
  ]
})
export class AdminModule { }
