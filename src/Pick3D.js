export default class Pick3D {

    constructor() {
        this.rayo = new THREE.Raycaster();
        this.objSeleccionado = null;
        this.objColor = 0;
        this.pickPosition = { x: 0, y: 0 };
        this.focused = false;
    }

    pick(stars, camera) {

        // Lanzamos un rayo desde la cámara
        this.rayo.setFromCamera(this.pickPosition, camera);

        
        // Lista de objetos que ha tocado el rayo
        const objAtravesados = this.rayo.intersectObjects(stars, true);        
        console.log(objAtravesados)

        if (objAtravesados.length) {
            this.focused = true;
            this.objSeleccionado = objAtravesados[0].point; // Si ha tocado algún objeto, seleccionamos el primero

            //Centramos y hacemos zoom con la cámara en el objeto
            camera.position.set(this.objSeleccionado.x, this.objSeleccionado.y, this.objSeleccionado.z + 10)
            camera.lookAt(this.objSeleccionado)
            camera.updateProjectionMatrix();

        } else if (this.focused) {
            this.resetCamera(camera);
            this.focused = false;
        }
    }

    getCanvas() {
        return document.querySelector("canvas");
    }

    getCanvasRelativePosition(event) {
        const rect = this.getCanvas().getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
    }

    setPickPosition(event) {
        const pos = this.getCanvasRelativePosition(event)
        this.pickPosition.x = (pos.x / this.getCanvas().clientWidth) * 2 - 1;
        this.pickPosition.y = (pos.y / this.getCanvas().clientHeight) * -2 + 1;
    }

    clearPickPosition() {
        // Ponemos la posición en un sitio en el que no habrá nada
        this.pickPosition.x = 0;
        this.pickPosition.y = 0;
    }

    resetCamera(camera) {
        camera.position.set(0, 0, 40)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix();
    }

}
