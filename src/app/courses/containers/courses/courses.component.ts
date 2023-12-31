import {Component} from '@angular/core';
import {Course} from "./model/course";
import {CoursesService} from "./services/courses.service";
import {catchError, Observable, of} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ErrorDialogComponent} from "../../../shared/components/error-dialog/error-dialog.component"
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  ConfirmationDialogComponent
} from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent {

  courses$: Observable<Course[]> | null = null;


  constructor(private coursesService: CoursesService,
              private dialog: MatDialog,
              private router: Router,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar) {
    this.refresh();
  }

  ngOnInit(): void {
  }

  refresh() {
    this.courses$ = this.coursesService.list()
      .pipe(catchError(error => {
        this.onError('Erro ao carregar a lista.')
        return of([])
      }));
  }

  onError(errMsg: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: errMsg
    })
  }

  onAdd() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  onEdit(course: Course) {
    this.router.navigate(['edit', course._id], {relativeTo: this.route})
  }

  onDelete(course: Course) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'Tem certeza que deseja remover este curso?',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.coursesService.delete(course._id).subscribe(
          () => {
            this.refresh();
            this.snackBar.open('Curso deletado com sucesso!', '',
              {
                duration: 5000,
                verticalPosition: "top",
                horizontalPosition: "center"
              })
          },
          error => {
            this.onError('Erro ao deletar curso!');
            return of([]);
          }
        );
      }
    });

  }
}
