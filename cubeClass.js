// GLOBALS
var cubeColors = [0xFFF535, 0xFFA428, 0xFF5015];
// CUBE CLASS
class Cube {
    constructor( scene ) {
        var material = new THREE.MeshLambertMaterial({ ambient: 0xffffff, color: cubeColors[ Math.floor( Math.random() * 3 ) ] });
        material.transparent = true;
        material.opacity = 1;
        var geo = new THREE.BoxGeometry( 0.1, 0.12, 0.05, 1, 1, 1 );
        this.mesh = new THREE.Mesh( geo, material );
        this.mesh.position.x = Math.random() * 12 - 6.0;
		this.mesh.position.y = Math.random() * 2 + 0.5;
		this.mesh.position.z = Math.random() * -30.0;
		this.edges = new THREE.EdgesHelper( this.mesh, 0x000000 );
		scene.add( this.mesh );
		scene.add( this.edges );
        this.fromBelow = false;
        this.ySpeed = 0.0;
        this.opacity = 0.0;
        // return this.mesh;
    }
    update( elapse, levelBreak, level, bounce, block, diff ) {
        var collision = false;
        var threshold = -20.0 * ( 1 + diff * 0.5 + level * 0.1 );
        // update opacity
        this.opacity += 0.01;
        if( this.mesh.position.z < threshold ) this.opacity = 0;
        this.opacity = Math.min( 1.0, this.opacity );
        this.mesh.material.opacity = this.opacity;
        this.edges.material.opacity = this.opacity;
        // update position
        this.mesh.position.x += xSpeed * elapse * 6;
        if( this.mesh.position.z > threshold ) {
            this.ySpeed += 0.005 * elapse * ( phase == -1 ? 3.0 : 1.0 );
            this.mesh.position.y -= this.ySpeed;
        }
        if( this.mesh.position.y < 0.06 && !this.fromBelow ) {
            this.ySpeed *= -0.4 * bounce;
            this.mesh.position.y = ( this.mesh.position.y - 0.06 ) * -1 + 0.06;
        }else if( this.fromBelow && this.mesh.position.y > 0.06 ) {
            this.fromBelow = false;
        }
        this.mesh.position.z += ( 1.0 + level * 0.2 ) * elapse * ( 0.7 + diff * 0.6 );
        // check collision
        if( this.mesh.position.z > -0.03 && this.mesh.position.z < 0.5 && Math.abs( this.mesh.position.x ) < 0.06 && this.mesh.position.y < 0.09 && this.mesh.position.y > 0.03 ) {
            collision = true;
        }
        // reset position once past screen
        if (this.mesh.position.z > 1.0) {
            this.fromBelow = block == 2;
            this.opacity = 0.0;
            this.mesh.material.opacity = 0.0;
            this.edges.material.opacity = 0.0;
            this.ySpeed = block == 2 ? -0.045 : 0;
            this.mesh.position.z = threshold;
            this.mesh.position.x = Math.random() * 12.0 - 6.0;
            this.mesh.position.y = block == 0 ? 0.06 : block == 1 ? Math.random() * 4 + 0.5 : -1.0;
        }
        return collision;
    }
    // reset position
    reset( block, buffer, diff ) {
        var threshold = -20.0 * ( 1 + diff * 0.5 );
        this.fromBelow = block == 2;
        this.opacity = 0.0;
        this.mesh.material.opacity = 0.0;
        this.edges.material.opacity = 0.0;
        this.ySpeed = block == 2 ? -0.045 : 0;
        this.mesh.position.x = Math.random() * 12.0 - 6.0;
        this.mesh.position.y = block == 0 ? 0.06 : block == 1 ? Math.random() * 4 + 0.5 : -1.0;
        this.mesh.position.z = Math.random() * threshold + ( buffer ? threshold * 2 : 0.0 );
    }
    // update visuals
    updateDesign( level ) {
        switch( level % 5 ) {
		case 0:
            this.mesh.material.color.setHex( cubeColors[ Math.floor( Math.random() * 3 ) ] );
            this.edges.material.color.setHex( 0x000000 );
            break;
		case 1:
            this.mesh.material.color.setHex( 0x000000 );
            this.edges.material.color.setHex( 0x00ff00 );
			break;
		case 2:
            this.mesh.material.color.setHex( 0x000000 );
            this.edges.material.color.setHex( 0x000000 );
			break;
		case 3:
			break;
		case 4:
            this.mesh.material.color.setHex( 0xFF326C );
            this.edges.material.color.setHex( 0xffffff );
	}
    }
}