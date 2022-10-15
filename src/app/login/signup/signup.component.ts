import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, from, map, of, switchMap, take } from 'rxjs';
import { BMProfile, partialToNullableProfile } from 'src/app/models/profile.model';

export const passwordChecker: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');

  return password && confirm && password.value !== confirm.value ? { passwordMatch: true } : null;
};

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  isMobile$ = of(false);

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: [passwordChecker] });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AngularFireAuth,
    private readonly firestore: AngularFirestore,
    private readonly router: Router,
    private readonly snackbar: MatSnackBar,
    private readonly observer: BreakpointObserver,
  ) { }

  ngOnInit(): void {
    this.isMobile$ = this.observer.observe([Breakpoints.Handset, Breakpoints.Small])
      .pipe(
        map(state => state.matches)
      );
  }

  async signUp() {
    const {email, password} = this.signupForm.value;
    if (email && password) {
      from(this.auth.createUserWithEmailAndPassword(email, password))
        .pipe(
          map(newAuthCredential => ({ authCred: newAuthCredential, userDoc: this.firestore.collection<BMProfile>('/users').doc(newAuthCredential.user?.uid) })),
          take(1),
          catchError(err => {
            console.log(err);
            this.snackbar.open('Could not create account', 'Dismiss');
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
    } else {
      this.snackbar.open('Invalid form', 'Dismiss');
    }
  }
}
