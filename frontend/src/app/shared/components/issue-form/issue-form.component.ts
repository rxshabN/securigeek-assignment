import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms'; // Import ReactiveFormsModule
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; // Import CommonModule

// Import necessary Angular Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

// App-specific imports
import { Issue } from '../../../core/models/issue';
import { IssueService } from '../../../core/services/issue.service';

@Component({
  selector: 'app-issue-form',
  standalone: true, // Mark as standalone
  imports: [
    // <--- ADD THIS IMPORTS ARRAY
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.scss'],
})
export class IssueFormComponent implements OnInit {
  issueForm: FormGroup;
  isEditMode: boolean = false;
  issueId?: string;

  constructor(
    private fb: FormBuilder,
    private issueService: IssueService,
    public dialogRef: MatDialogRef<IssueFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { issue?: Issue }
  ) {
    this.issueForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['open', Validators.required],
      priority: ['medium', Validators.required],
      assignee: [''],
    });

    if (data && data.issue) {
      this.isEditMode = true;
      this.issueId = data.issue.id;
      this.issueForm.patchValue(data.issue);
    }
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.issueForm.invalid) {
      return;
    }

    const formData = this.issueForm.value;
    const operation =
      this.isEditMode && this.issueId
        ? this.issueService.updateIssue(this.issueId, formData)
        : this.issueService.createIssue(formData);

    operation.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Failed to save issue', err),
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
