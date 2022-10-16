import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BMApplicationStatus } from 'src/app/models/application.model';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusChipComponent implements OnInit {

  @Input() status: BMApplicationStatus = 'unsubmitted';

  color: 'primary' | 'accent' | 'warn' | '' = '';

  constructor() { }

  ngOnInit(): void {
    switch (this.status) {
      case 'submitted':
        this.color = 'accent';
        break;

      case 'accepted':
        this.color = 'primary';
        break

      case 'rejected':
        this.color = 'warn';
        break;
    }
  }

}
