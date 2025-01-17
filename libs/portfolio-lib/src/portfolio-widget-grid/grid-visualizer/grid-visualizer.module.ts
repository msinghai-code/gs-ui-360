import {NgModule} from "@angular/core";
import {GridVisualizerComponent} from "./grid-visualizer.component";
import { GridModule } from "@gs/gdk/grid";

@NgModule({
    declarations: [GridVisualizerComponent],
    imports: [GridModule],
    exports: [GridVisualizerComponent],
    entryComponents: [GridVisualizerComponent]
})

export class GridVisualizerModule {}
