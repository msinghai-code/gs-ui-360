import {Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges} from '@angular/core';
import {EnvironmentService} from "@gs/gdk/services/environment";

@Component({
  selector: 'gs-objects-list-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnChanges {

  @Input() 
  navItems: any = [];

  @Output() 
  selectChange: EventEmitter<any> = new EventEmitter<any>();

  standardSFFields: String[] = ['Id','Name','Email','Title','CreatedDate','LastModifiedDate','CreatedById','LastModifiedById','SystemModstamp','IsDeleted'];

  updatedNavItems:any=[];
  moduleNavClass = "";
  moduleNavOpen = false;
  hostName : string;

  constructor(@Inject("envService") private _env: EnvironmentService ) {}

  ngOnInit(): void {
    this.moduleNavOpen = false;   
    this.hostName= this._env.host;
    const packageNS = this._env['_hostDetails'] &&this._env['_hostDetails'].packageNS || ''; 
    //const config = this._env.getSFDCConfig();
    this.getUpdatedNavItems(packageNS);
  }

  getUpdatedNavItems(packageNS: any): any {
    this.updatedNavItems=[];
		this.navItems.forEach(element=>{
      const parent = {...element}
     const children=[...element.children];
      const childList = [];
      children.forEach(child=>{
        const childCopy={...child}
        const apexPrefix="/apex/";
        let key = childCopy.href.replace(apexPrefix,"");
				
				if(this.standardSFFields.indexOf(key) == -1) {
					key = packageNS+key;
				}
		
				const temphref=apexPrefix+key;
        childCopy.href=temphref;
        childList.push(childCopy);
				
			
      });
      parent.children=childList;
		  this.updatedNavItems.push(parent);
	
		
		});

	  }
  
  
  ngOnChanges(changes: SimpleChanges) {
    const navItems: SimpleChange = changes.navItems;
    if (changes && changes["navItems"] && changes["navItems"].currentValue) {
      this.updatedNavItems = changes["navItems"].currentValue;
    }
  }

  toggleModuleNav(event) {
    if (!this.moduleNavOpen) {
      this.moduleNavClass = "gs-module-nav--expand";
      this.moduleNavOpen = true;
    } else {
      this.moduleNavClass = "";
      this.moduleNavOpen = false;
    }
  }

  handleOptionSelect(event) {
    this.selectChange.emit(event);
    this.toggleModuleNav(null);
  }

  getNavList(search){
    this.updatedNavItems = [...search];
  }

  search(value){
    
    const updatedItemList = [];
        this.navItems.forEach(element => {
          const childItems = element.children.filter(child=>{
            return ((child.name || "" ).toLowerCase().indexOf(value.toLowerCase())>-1);
            })
            if(childItems.length>0){
              const tempELement = {...element};
                tempELement.children=[...childItems];
                updatedItemList.push(tempELement);
            }
            else if((element.name || "" ).toLowerCase().indexOf(value.toLowerCase())>-1){
              const tempELement = {...element};
                updatedItemList.push(tempELement);
            }
            
        });

       this.updatedNavItems=updatedItemList; 

    
    }
    
}
