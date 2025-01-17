/**
 * Created by rpal on 2021-02-22
 */
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CS360RouteGuard } from "./route-guard";

const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule),
    canActivate: [CS360RouteGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { initialNavigation: 'enabled', useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
