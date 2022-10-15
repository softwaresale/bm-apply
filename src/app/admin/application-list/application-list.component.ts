import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { BMApplication, BMFullApplication, partialToNullableBMFullApplication } from 'src/app/models/application.model';
import { BMProfile } from 'src/app/models/profile.model';

@Component({
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {

  applications$!: Observable<BMFullApplication[]>;

  constructor(
    private readonly firestore: AngularFirestore,
  ) { }

  ngOnInit(): void {
    this.applications$ = this.firestore.collection<BMApplication>('/applications', ref => ref.where('status', '==', 'submitted')).valueChanges()
      .pipe(
        map(applications => applications.map(app => this.firestore.doc<BMProfile>(`/users/${app.userId}`).valueChanges().pipe(
          map(user => partialToNullableBMFullApplication(user!, app))
        ))),
        switchMap(observables => combineLatest(observables))
      );
  }

}
