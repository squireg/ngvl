import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ANONYMOUS_USER, Solution, SolutionQuery, User } from '../modules/vgl/models';
import { VglService } from '../modules/vgl/vgl.service';

import { environment } from '../../../environments/environment';

export const DASHBOARD_VIEW = 'dashboard-view';
export const DATA_VIEW = 'data-view';
export const SOLUTIONS_VIEW = 'solutions-view';
export const JOBS_VIEW = 'jobs-view';

export type ViewType = 'dashboard-view' | 'data-view' | 'solutions-view' | 'jobs-view' | null;

@Injectable()
export class UserStateService {

  constructor(private vgl: VglService) {}

  private _currentView: BehaviorSubject<ViewType> = new BehaviorSubject(null);
  public readonly currentView: Observable<ViewType> = this._currentView.asObservable();

  private _user: BehaviorSubject<User> = new BehaviorSubject(ANONYMOUS_USER);
  public readonly user: Observable<User> = this._user.asObservable();

  private _solutionQuery: BehaviorSubject<SolutionQuery> = new BehaviorSubject({});
  public readonly solutionQuery: Observable<SolutionQuery> = this._solutionQuery.asObservable();

  private _selectedSolutions: BehaviorSubject<Solution[]> = new BehaviorSubject([]);
  public readonly selectedSolutions: Observable<Solution[]> = this._selectedSolutions.asObservable();

  private _uploadedFiles: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public readonly uploadedFiles: Observable<any[]> = this._uploadedFiles.asObservable();

  public setView(viewType: ViewType): Observable<ViewType> {
    this._currentView.next(viewType);
    return this.currentView;
  }

  public updateUser() {
    this.vgl.user.subscribe(user => this._user.next(user));
  }

  public updateAnonymousUser() {
    this._user.next(ANONYMOUS_USER);
  }

  public setSolutionQuery(query: SolutionQuery) {
    this._solutionQuery.next(query);
  }

  public addSolutionToCart(solution: Solution) {
    // Add solution to the cart, unless it's already in.
    if (solution) {
      this.updateSolutionsCart((cart: Solution[]) => {
        if (!cart.includes(solution)) {
          return [...cart, solution];
        }

        return cart;
      });
    }
  }

  public removeSolutionFromCart(solution: Solution) {
    if (solution) {
      this.updateSolutionsCart((cart: Solution[]) => cart.filter(s => s['@id'] !== solution['@id']));
    }
  }

  public updateSolutionsCart(f: ((cart: Solution[]) => Solution[])): Solution[] {
    // Call the passed function to update the current selection.
    const solutions = f(this._selectedSolutions.getValue());

    // If we got a sensible value back (i.e. defined, empty is valid) then
    // update the current cart with the new value.
    if (solutions) {
      this._selectedSolutions.next(solutions);
    }

    // Return the new value so the caller can check that it worked.
    return solutions;
  }

  public setUploadedFiles(files: any[]): void {
      this._uploadedFiles.next(files);
  }

}
