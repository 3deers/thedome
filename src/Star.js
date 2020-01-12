
export default class Star {
    constructor(az, alt,dist , scene, geometry, material) {
        this._coord = { az, alt }
        this._geometry = geometry;
        this._material = material;
        dist = 500
        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._mesh.position.set( Math.cos(alt)*Math.cos(az)*(dist), Math.cos(alt)*Math.sin(az)*(dist),Math.sin(alt)*(dist) )
       
        scene.add(this._mesh)
    }
    getCoord (){
        return this._coord
    }

    getMeshPos (){
        return this._mesh.position
    }
    update(coord,dist){
        this._coord = coord
        dist=500
        this._mesh.position.set( Math.cos(coord.alt)*Math.cos(coord.az)*(dist), Math.cos(coord.alt)*Math.sin(coord.az)*(dist),Math.sin(coord.alt)*(dist) )
        this._mesh.rotation.x += 0.01;
        this._mesh.rotation.y += 0.01;
        console.log(this._mesh.position)
    }
    render() {

    }

}
