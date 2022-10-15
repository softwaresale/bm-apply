import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthProvider, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';
import { from, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { BMProfile, partialToNullableProfile } from '../models/profile.model';

interface ProviderInfo {
  name: string;
  provider: AuthProvider
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isMobile$ = of(false);

  providers: ProviderInfo[] = [
    {
      name: 'Google',
      provider: new GoogleAuthProvider(),
    },
    {
      name: 'Microsoft',
      provider: new OAuthProvider('microsoft.com'),
    },
    {
      name: 'Github',
      provider: new GithubAuthProvider(),
    }
  ];

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(
    private readonly auth: AngularFireAuth,
    private readonly firestore: AngularFirestore,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly observer: BreakpointObserver,
  ) { }

  ngOnInit(): void {
    this.isMobile$ = this.observer.observe([Breakpoints.Handset, Breakpoints.Small])
      .pipe(
        map(state => state.matches)
      );
  }

  async passwordLogin() {
    const { email, password } = this.loginForm.value;
    if (email && password) {
      await this.auth.signInWithEmailAndPassword(email, password)
        .then(successfulUser => this.router.navigate(['dashboard']))
        .catch(err => {
          console.log(err);
          this.snackBar.open('Failed to log in', 'Dismiss');
        })

    } else {
      this.snackBar.open('Failed to login', 'Dismiss');
    }
  }

  logInWithProvider(provider: AuthProvider) {
    from(this.auth.signInWithPopup(provider))
        .pipe(
          map(newAuthCredential => ({ authCred: newAuthCredential, userDoc: this.firestore.collection<BMProfile>('/users').doc(newAuthCredential.user?.uid) })),
          take(1),
          catchError(err => {
            console.log(err);
            this.snackBar.open('Could not create account', 'Dismiss');
            return of();
          }),
        )
        .subscribe(async ({ authCred, userDoc }) => {
          const knownInfoPartial: Partial<BMProfile> = {
            uid: authCred.user?.uid,
            email: authCred.user?.email ?? undefined,
          };
          const knownInfo = partialToNullableProfile(knownInfoPartial);
          await userDoc.set(knownInfo);
          await this.router.navigate(['/apply']);
        });
  }
}
