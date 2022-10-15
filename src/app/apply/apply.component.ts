import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { filter, map, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { BMApplication, BMApplicationStatus, partialToNullabelBMApplication } from '../models/application.model';
import { BMProfile, partialToNullableProfile } from '../models/profile.model';

type ResumeFileState = 'unselected' | 'selected' | 'uploaded';

export const isAtLeastNow: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const yearString = control.value;
  const yearNum = +yearString;
  const THIS_YEAR = 2022; // TODO: bad!!

  return yearNum < THIS_YEAR ? { invalidYear: true } : null;
};

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.scss']
})
export class ApplyComponent implements OnInit {

  ngDestory$ = new Subject<void>();
  isMobile$ = of(false);

  profileDocument$: Observable<AngularFirestoreDocument<BMProfile>> = of();
  applicationDocument$: Observable<AngularFirestoreDocument<BMApplication>> = of();

  resumeFile: File | null = null;
  resumeState: ResumeFileState = 'unselected';
  uploadPercent$: Observable<number | undefined> | null = null;

  profileForm = this.fb.group({
    uid: [''],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: [''],
    phone: ['', [Validators.pattern(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/)]],
    gender: [''],
    major: ['', [Validators.required]],
    university: ['', [Validators.required]],
    gradYear: ['', [Validators.required, Validators.maxLength(4), Validators.minLength(4), isAtLeastNow]],
    github: [''],
    linkedIn: [''],
    resumeId: [<string|null> null, [Validators.required]], // This does not link to a form control. This gets set manually
  });

  bmAppForm = this.fb.group({
    userId: [''],
    whyBoilermake: ['', [Validators.required, Validators.maxLength(4000)]],
    projectIdeas: ['', [Validators.required, Validators.maxLength(4000)]],
    agreeToTOC: [false, [Validators.required, Validators.requiredTrue]],
    isFirstHackathon: [false, [Validators.required]],
    status: [<BMApplicationStatus>'unsubmitted'],
  });

  isLinear$ = this.applicationDocument$.pipe(switchMap(doc => doc.get().pipe(take(1))), map(doc => doc.data()?.status === 'unsubmitted'));

  recommendedMajors = [
    'Computer Science',
    'Data Science',
    'Computer Engineering',
  ];

  get uploadResumeText(): string {
    return this.resumeFileTitle ? 'Upload' : 'Select Resume';
  }

  get resumeFileTitle(): string | null {
    return this.resumeFile?.name ?? null;
  }

  get whyBMCharCount(): number {
    return this.bmAppForm.controls.whyBoilermake.value?.length ?? 0;
  }

  get projectIdeaCharCount(): number {
    return this.bmAppForm.controls.projectIdeas.value?.length ?? 0;
  }

  get resumeRecieved(): boolean {
    const resume = this.profileForm.controls.resumeId;
    return resume.value !== null && resume.value.length > 0;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AngularFireAuth,
    private readonly firestore: AngularFirestore,
    private readonly storage: AngularFireStorage,
    private readonly router: Router,
    private readonly snackbar: MatSnackBar,
    private readonly observer: BreakpointObserver,
  ) { }

  ngOnInit(): void {
    this.profileDocument$ = this.auth.authState
      .pipe(
        filter(authState => !!authState),
        map(authState => authState!),
        map(authState => this.firestore.doc<BMProfile>(`/users/${authState.uid}`)),
        takeUntil(this.ngDestory$)
      );

    this.applicationDocument$ = this.auth.authState
      .pipe(
        filter(authState => !!authState),
        map(authState => authState!),
        switchMap(authState => this.firestore.collection<BMApplication>('/applications', ref => ref.where('userId', '==', authState.uid)).get().pipe(
          switchMap(async docRef => {
            if (docRef.empty) {
              const application = partialToNullabelBMApplication({ userId: authState.uid });
              const doc = this.firestore.collection<BMApplication>('/applications').doc(this.firestore.createId());
              await doc.set(application);
              return doc;
            } else {
              return this.firestore.doc<BMApplication>(docRef.docs[0].ref);
            }
          })
        )),
        takeUntil(this.ngDestory$)
      );

    this.profileDocument$
      .pipe(
        switchMap(doc => doc.valueChanges()),
        takeUntil(this.ngDestory$),
      )
      .subscribe(profileUpdate => {
        if (profileUpdate) {
          this.profileForm.patchValue(profileUpdate);
        }
      });

    this.applicationDocument$
      .pipe(
        switchMap(doc => doc.valueChanges()),
        takeUntil(this.ngDestory$)
      )
      .subscribe(appUpdate => {
        if (appUpdate) {
          this.bmAppForm.patchValue(appUpdate);
          if (appUpdate.status === 'submitted') {
            this.profileForm.disable();
            this.bmAppForm.disable();
          }
        }
      });

    this.isMobile$ = this.observer.observe([Breakpoints.Handset, Breakpoints.Small])
      .pipe(
        map(state => state.matches)
      );
  }

  setResumeUpload(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files?.length && inputElement.files.length > 0) {
      const resumeFile = inputElement.files[0];
      this.resumeFile = resumeFile;

      this.resumeState = 'selected';
    }
  }

  async uploadResume() {
    console.log('Uploading file...');

    if (this.resumeFile) {
      const uid = this.profileForm.get('uid')?.value;
      if (uid) {
        const fileName = `${uid}-resume`;

        const task = this.storage.upload(fileName, this.resumeFile);
        this.uploadPercent$ = task.percentageChanges();
        const downloadURL = await task.then(snapshot => snapshot.ref.getDownloadURL());
        this.profileForm.patchValue({ resumeId: downloadURL });
        this.resumeState = 'uploaded';
      } else {
        this.snackbar.open('UID is not set. cannot upload file', 'dismiss');
      }
    } else {
      this.snackbar.open('No resume file set', 'Dismiss');
    }
  }

  saveProfileProgress() {
    if (this.profileForm.disabled) {
      return;
    }
    const partialForm: Partial<BMProfile> = this.profileForm.value;
    const profile = partialToNullableProfile(partialForm);
    this.profileDocument$
      .pipe(take(1))
      .subscribe(async doc => {
        await doc.update(profile);
        await this.router.navigate(['/dashboard']);
      });
  }

  saveBMProgress() {
    if (this.bmAppForm.disabled) {
      return;
    }
    const partialApp = this.bmAppForm.value;
    const app = partialToNullabelBMApplication({ ...partialApp, isFirstHackathon: partialApp?.isFirstHackathon ?? false, agreeToTOC: partialApp?.agreeToTOC ?? false, status: partialApp?.status ?? 'unsubmitted' });
    this.applicationDocument$
      .pipe(take(1))
      .subscribe(async doc => {
        await doc.update(app);
        await this.router.navigate(['/dashboard']);
      });
  }

  submitProfileForm() {
    if (this.profileForm.disabled) {
      return;
    }

    console.log('Submitting form');
    console.log(this.profileForm.value);
    const partialProfile = this.profileForm.value;
    const profileValue = partialToNullableProfile(partialProfile);

    this.profileDocument$
      .pipe(
        take(1),
      )
      .subscribe(async doc => {
        await doc.update(profileValue);
      });
  }

  submitBMApp() {
    if (this.bmAppForm.disabled) {
      this.router.navigate(['/dashboard']);
      return;
    }
    console.log('Submitting form');
    console.log(this.bmAppForm.value);

    const partialApp = this.bmAppForm.value;
    const app = partialToNullabelBMApplication({ ...partialApp, isFirstHackathon: partialApp?.isFirstHackathon ?? false, agreeToTOC: partialApp?.agreeToTOC ?? false, status: partialApp?.status ?? 'unsubmitted' });
    this.applicationDocument$
      .pipe(take(1))
      .subscribe(async doc => {
        await doc.update({ ...app, status: 'submitted' });
        await this.router.navigate(['/dashboard']);
      });
  }

  updateFirstHackathon(event: MatCheckboxChange) {
    this.bmAppForm.patchValue({ isFirstHackathon: event.checked });
  }

  updateAgreement(event: MatCheckboxChange) {
    this.bmAppForm.patchValue({ agreeToTOC: event.checked });
  }
}
