import {Component, Input, OnInit} from '@angular/core';
import {HybridHelper} from "@gs/gdk/utils/hybrid";
import { PageContext } from '@gs/cs360-lib/src/common';


@Component({
  selector: 'gs-not-avilable-only-mini',
  templateUrl: './not-avilable-only-mini.component.html',
  styleUrls: ['./not-avilable-only-mini.component.scss']
})
export class NotAvilableOnlyMiniComponent implements OnInit {

  @Input() sections: any[] = [];
  @Input() ctx;


  pageContext;
  iD;

  constructor() {
  }

  ngOnInit() {
    this.pageContext = this.ctx.pageContext;
    this.iD = this.ctx.pageContext === 'C360' ? this.ctx.cId : this.ctx.pageContext === 'R360' ? this.ctx.rId : this.ctx.cId;
  }

  redirectOnCLick(sectionId) {

    let url = '';

    if(this.pageContext === PageContext.C360) {
      url = HybridHelper.generateNavLink(`customersuccess360?cid=${this.iD}#/${sectionId}`);

    } else if(this.ctx.pageContext === PageContext.R360) {
      url = HybridHelper.generateNavLink(`Relationship360?rid=${this.iD}#/${sectionId}`);
    }
    else if (this.pageContext === 'P360') {
      // Uncomment and modify the link if needed in the future for P360 or other contexts
      // url = `person360?cid=${id}#/${sectionId}`;
    }

    if(HybridHelper.isSFDCHybridHost()){
      HybridHelper.navigateToURL(url, true);
    } else {
      window.open(url, '_blank');
    }
  }

}
