import { Component, Inject, OnInit } from '@angular/core';
import {HttpProxyService} from "@gs/gdk/services/http";
import { PageContext } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-migrate',
  templateUrl: './migrate.component.html',
  styleUrls: ['./migrate.component.scss']
})
export class MigrateComponent implements OnInit {

  public migrationTriggered = false;
  public migrationCompleted = false;
  constructor(private http: HttpProxyService, @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO) { }

  ngOnInit() {
  
  }

  migrate() {
    this.migrationTriggered = true;
    const ctx = this.ctx.baseObject.toUpperCase();
    this.http.post(`v2/galaxy/migrate/360V2/${ctx}`, {}).subscribe(data => {
      this.migrationCompleted = true;
    });
  }

}
