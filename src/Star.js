
export default class Star {
    constructor(az, alt,dist , scene, geometry, material) {
        dist=500
        this._coord = { az, alt }
        this._dist = dist
        this._position = new THREE.Vector3()
        this._geometry = geometry;
        this._material = material;
        
        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._mesh.position.set( Math.cos(alt)*Math.cos(az)*(dist), Math.cos(alt)*Math.sin(az)*(dist),Math.sin(alt)*(dist) )
      
        scene.add(this._mesh)
       
        
    }
    getCoord (){
        return this._coord
    }

    getMeshPosition (){
        return this._mesh.position
    }
    getPosition (){
        return this._position
    }

    setCoord(c){
        this._coord=c
    }
    setDistance(d){
        d=500
        this._dist=d
    }
    getDistance(d){
       return this._dist
    }
    setPosition(){
        this._position.x=Math.cos(this._coord.alt)*Math.cos(this._coord.az)*(this._dist);
        this._position.y=Math.cos(this._coord.alt)*Math.sin(this._coord.az)*(this._dist);
        this._position.z=Math.sin(this._coord.alt)*(this._dist);
    }
    
    update(coord){
        
      
        this._coord = coord
        
        
        this._mesh.position.set( Math.cos(coord.alt)*Math.cos(coord.az)*(this._dist), Math.cos(coord.alt)*Math.sin(coord.az)*(this._dist),Math.sin(coord.alt)*(this._dist) )
        this._mesh.rotation.x += 0.01;
        this._mesh.rotation.y += 0.01;
        
       

    }
    hide() {
        this._mesh.visible = false;
    }
    render() {
        this._mesh.visible = true;
    }

}
