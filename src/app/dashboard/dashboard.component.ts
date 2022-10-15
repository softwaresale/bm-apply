import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { BMApplication } from '../models/application.model';
import { BMProfile } from '../models/profile.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  profile$: Observable<BMProfile> = of();
  application$: Observable<BMApplication | null> = of(null);

  constructor(
    private readonly auth: AngularFireAuth,
    private readonly firestore: AngularFirestore,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.profile$ = this.auth.authState
      .pipe(
        switchMap(authState => this.firestore.doc<BMProfile>(`/users/${authState?.uid}`).valueChanges()),
        map(profile => profile!) // Profile is guaranteed
      );

    this.application$ = this.auth.authState
      .pipe(
        switchMap(user => this.firestore.collection<BMApplication>('/applications', ref => ref.where('userId', '==', user?.uid)).valueChanges()),
        map(apps => apps.length > 0 ? apps[0] : null)
      );
  }

  async logout() {
    await this.auth.signOut();
    await this.router.navigate(['/login']);
  }
}
