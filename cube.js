// GLOBALS
var cubeColors = [ 0xFFF535, 0xFFA428, 0xFF5015 ];
var meshMaterials = [
                      [ // Level 1
                        new THREE.MeshBasicMaterial({ color: cubeColors[ 0 ] }), // 0xFFF535
                        new THREE.MeshBasicMaterial({ color: cubeColors[ 1 ] }), // 0xFFA428
                        new THREE.MeshBasicMaterial({ color: cubeColors[ 2 ] })  // 0xFF5015
                      ],
                      [ // Level 2
                        new THREE.MeshBasicMaterial({ color: 0x000000 }) // 0x000000
                      ],
                      [ // Level 3
                        new THREE.MeshBasicMaterial({ color: 0x000000 }) // 0x000000
                      ],
                      [ // Level 4
                        new THREE.MeshBasicMaterial({ color: 0x000000 }) // 0x000000
                      ],
                      [ // Level 5
                        new THREE.MeshBasicMaterial({ color: 0xFF326C  }) // 0xFF326C 
                      ]
                    ];
// var edgeMaterials = [ 0x000000, 0x00ff00, 0x000000, 0x000000, 0xffffff ];
var edgeMaterials = [ new THREE.MeshBasicMaterial({ color: 0x000000 }),
                      new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
                      new THREE.MeshBasicMaterial({ color: 0x000000 }),
                      new THREE.MeshBasicMaterial({ color: 0x000000 }),
                      new THREE.MeshBasicMaterial({ color: 0xffffff })
                    ];
var cubeGeo = new THREE.BoxBufferGeometry( 0.1, 0.12, 0.05 );

// CUBE CLASS
class Cube {

  constructor (scene) {
    // Material
    var material = meshMaterials[0][Math.floor(Math.random() * 3)];

    // Mesh
    this.mesh = new THREE.Mesh(cubeGeo, material);
    this.mesh.position.x = Math.random() * 12 - 6.0;
    this.mesh.position.y = Math.random() * 2 + 0.5;
    this.mesh.position.z = Math.random() * -30.0;
    var edgeGeo = new THREE.EdgesGeometry(cubeGeo);
    this.edges = new THREE.LineSegments(edgeGeo, edgeMaterials[0]);
    this.edges.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

    // Add to scene
    scene.add(this.mesh);
    scene.add(this.edges);

    // Object properties
    this.fromBelow = false;
    this.ySpeed = 0.0;
    this.opacity = 0.0;
  }

  update (elapse, levelBreak, level, bounce, block, diff) {
    var threshold = -20.0 * ( 1 + diff * 0.5 + level * 0.1 );

    // Update opacity
    // this.opacity = Math.min(1.0, (Math.max(this.mesh.position.z, -20) + 20) / 5 );
    // this.mesh.material.opacity = this.opacity;
    // this.edges.material.opacity = this.opacity;

    // Update position
    this.mesh.position.x += xSpeed * elapse * 6;

    if (this.mesh.position.z > threshold) {
      this.ySpeed += 0.005 * elapse * ( phase == -1 ? 3.0 : 1.0 );
      this.mesh.position.y -= this.ySpeed;
    }

    if (this.mesh.position.y < 0.06 && !this.fromBelow) {
      this.ySpeed *= -0.4 * bounce;
      this.mesh.position.y = ( this.mesh.position.y - 0.06 ) * -1 + 0.06;
    } else if (this.fromBelow && this.mesh.position.y > 0.06) {
      this.fromBelow = false;
    }
    this.mesh.position.z += (1.0 + level * 0.2) * elapse * (0.7 + diff * 0.6);

    // Update edge position too
    this.edges.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);

    // check collision
    if (this.mesh.position.z > -0.03 &&
        this.mesh.position.z < 0.5 &&
        Math.abs( this.mesh.position.x ) < 0.06 &&
        this.mesh.position.y < 0.09 && this.mesh.position.y > 0.03 )
    {
      return true;
    }
    
    // Reset position once past screen
    if (this.mesh.position.z > 1.0) {
      this.resetPos(threshold, levelBreak, block);
    }

    // Return if cube collided with player
    return false;
  }

  // reset position after passes user
  resetPos (threshold, levelBreak, block) {
    this.fromBelow = block == 2;
    // this.opacity = 0.0;
    // this.mesh.material.opacity = 0.0;
    // this.edges.material.opacity = 0.0;
    this.ySpeed = block == 2 ? -0.045 : 0;
    // Star further back if in break between levels
    this.mesh.position.z = threshold - (levelBreak > 0 ? 40 + Math.random() * 60 : 0);
    this.mesh.position.x = Math.random() * 12.0 - 6.0;
    this.mesh.position.y = block == 0 ? 0.06 : block == 1 ? Math.random() * 4 + 0.5 : -1.0;

    // Update edge position too
    this.edges.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
  }

  // Reset position
  reset (block, buffer, diff) {
    var threshold = -20.0 * ( 1 + diff * 0.5 );
    this.fromBelow = block == 2;
    // this.opacity = 0.0;
    // this.mesh.material.opacity = 0.0;
    // this.edges.material.opacity = 0.0;
    this.ySpeed = block == 2 ? -0.045 : 0;
    this.mesh.position.x = Math.random() * 12.0 - 6.0;
    this.mesh.position.y = block == 0 ? 0.06 : block == 1 ? Math.random() * 4 + 0.5 : -1.0;
    this.mesh.position.z = Math.random() * threshold + ( buffer ? threshold * 2 : 0.0 );

    // Update edge position too
    this.edges.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
  }

  // Update visuals
  updateDesign(level) {
    switch (level % 5) {
      case 0:
        this.mesh.material = meshMaterials[0][ Math.floor(Math.random() * 3) ];
        this.edges.material = edgeMaterials[0];
        break;
      case 1:
        this.mesh.material = meshMaterials[1][0];
        this.edges.material = edgeMaterials[1];
        break;
      case 2:
        this.mesh.material = meshMaterials[2][0];
        this.edges.material = edgeMaterials[2];
        break;
      case 3:
        break;
      case 4:
        this.mesh.material = meshMaterials[4][0];
        this.edges.material = edgeMaterials[4];
    }
  }
}
