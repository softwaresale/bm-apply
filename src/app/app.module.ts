import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ObserversModule } from '@angular/cdk/observers';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AngularFireAuthGuardModule } from '@angular/fire/compat/auth-guard';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideStorage,getStorage } from '@angular/fire/storage';

const MAT_MODULES = [
  MatToolbarModule,
  MatSnackBarModule,
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyAmfmnSbVOHcEY3hN1Xg30oACn6GCG58QQ",
      authDomain: "bm-apply-test.firebaseapp.com",
      projectId: "bm-apply-test",
      storageBucket: "bm-apply-test.appspot.com",
      messagingSenderId: "412726819063",
      appId: "1:412726819063:web:40adc6d2e592d54f123bf2",
      measurementId: "G-JJWVKGP2H0"
    }),
    ...MAT_MODULES,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthGuardModule,
    BrowserAnimationsModule,
    ObserversModule,
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
