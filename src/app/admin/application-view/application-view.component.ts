import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { BMApplication, BMApplicationStatus, BMFullApplication, partialToNullableBMFullApplication } from 'src/app/models/application.model';
import { BMProfile } from 'src/app/models/profile.model';

@Component({
  templateUrl: './application-view.component.html',
  styleUrls: ['./application-view.component.scss']
})
export class ApplicationViewComponent implements OnInit {

  applicationDoc$: Observable<AngularFirestoreDocument<BMApplication>> = of();
  application$: Observable<BMFullApplication> = of();

  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly firestore: AngularFirestore,
    private readonly snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {

    this.applicationDoc$ = this.activeRoute.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => !!id),
      map(id => this.firestore.doc<BMApplication>(`/applications/${id}`))
    );

    this.application$ = this.applicationDoc$.pipe(
      switchMap(docRef => docRef.get().pipe(map(snapshot => snapshot.data()))),
      switchMap(application => this.firestore.doc<BMProfile>(`/users/${application?.userId}`).get().pipe(
        map(snapshot => snapshot.data()),
        map(profile => partialToNullableBMFullApplication(profile!, application!)),
      ))
    );
  }

  updateApplicationStatus(newStatus: BMApplicationStatus) {
    this.applicationDoc$
      .pipe(
        take(1),
      )
      .subscribe(async doc => {
        await doc.update({ status: newStatus });
        this.snackbar.open('Application status updated', 'Dismiss')
        await this.router.navigate(['/admin', 'applications']);
      });
  }
}
