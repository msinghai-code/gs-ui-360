import { Injectable} from '@angular/core';
@Injectable({
    providedIn: 'root'
})

export class MapService {
    constructor(){}

    public getBGNode(map, id:string) {
        return map.getBGNode(id);
    }

    public setLayout(map, layout:string){
        map.setLayout(layout);
    }

    public getScale(map){
        return map.getScale();
    }

    public zoom(map, val: number | boolean){
        map.zoom(val);
    }

    public add(map, node) {
        map.add(node);
    }

    public remove(map, id:string){
        map.remove(id);
    }

    public get(map, id:string){
        return map.get(id);
    }

    public expand(map, nodeMapObj){
        map.expand(nodeMapObj.id, nodeMapObj.childrenIds);
    }

    public collapse(map, nodeMapObj){
        map.collapse(nodeMapObj.id, nodeMapObj.childrenIds);
    }

    public load(map, mapData){
        map.load(mapData);
    }

    public getNodes(map){
        return map.config.nodes;
    }

    public updateMap(map, nodeMapObj) {
        map.update(nodeMapObj);
    }

    public updateNode(map, nodeMapObj) {
        map.updateNode(nodeMapObj);
    }

    public draw(map) {
        map.draw();
    }

    public getNodeElement(map, id:string) {
        map.getNodeElement();
    }

    public exportPNG(map, filename:string, header:string) {
        map.exportPNG({ filename, header });
    }

    public find(map,id:string) {
        return map.find(id);
    }

    public center(map,id:string) {
        map.center(id);
    }

    public addClink(map,srcId:string, targetId:string, template) {
        map.addClink(srcId, targetId, '', template);
    }

    public removeClink(map,srcId:string, targetId:string) {
        map.removeClink(srcId, targetId);
    }


}
