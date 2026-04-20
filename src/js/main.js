import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "https://esm.sh/gsap";

const body = document.querySelector('body');

// Chemins vers nos modèles
const models = {
    exterieur: '/models/GO_SM_exterieur.gltf',
    interieur: '/models/GO_SM_Scene.gltf',
    jetonAntique: '/models/GO_DM_jeton-antique.gltf',
    jeton80: '/models/GO_DM_jeton80.gltf',
    delorean: '/models/GO_DM_delorean.gltf',
    timeMachine: '/models/GO_DM_timemachine.gltf',
};

// LOADING
const gltfLoader = new GLTFLoader();

// Remplace les chemins de l'objet 'models'
// par les scenes threejs chargées par gltfLoader
// Le chargement bloque le reste du script
for (const key in models) {
    models[key] = await gltfLoader.loadAsync(models[key]);
}


// Enlève le loader
body.classList.remove('loading');

// SETTINGS
const settings = {
    wrapper: document.querySelector(".js-canvas-wrapper"),
    canvas: document.querySelector(".js-canvas-3d"),
    raf: window.requestAnimationFrame,
    sizes: {},
};

const threejsOptions = {
    canvas: settings.canvas,
};

//// VIEWER CLASS
let previousTime = 0;

class Viewer {
    constructor(options) {
        this.canvas = options.canvas;

        // souris
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        //anim jetons 
        this.jeton1BaseScale = null
        this.jeton2BaseScale = null
        this.jeton3BaseScale = null

        this.jeton1Hovered = false;
        this.jeton2Hovered = false;
        this.jeton3Hovered = false;

        this.setRenderer(options);
        this.mouseEvents();

        document.querySelector('.clues__number--count').textContent = '0';
    }


    animate(timestamp) {
        // const deltaTime = (timestamp - previousTime) * 0.001;
        // previousTime = timestamp;
        //     this.mixer.update( deltaTime );
        //     this.mixer2.update( deltaTime );
        //     this.render();
        //     window.requestAnimationFrame(( timestamp) => {
        //         this.animate(timestamp);
        //     })
    }

    animate2(timestamp) {

        const deltaTime = (timestamp - previousTime) / 1000;
        previousTime = timestamp;

        // console.log(timestamp);
        // this.mixer.update(deltaTime);
        if (this.spotLightHelper) {
            this.spotLightHelper.update();
        }
        this.render();

        window.requestAnimationFrame((timestamp) => {
            this.animate2(timestamp);
        });
    }

    mouseEvents() {
        this.canvas.addEventListener('pointermove', (e) => this.hoverJetons(e));
        this.canvas.addEventListener('click', (e) => this.canvaInteract(e));
    }

    pointerPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    getInteractions() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const roots = [];
        if (this.jeton1) roots.push({ kind: "jeton1", root: this.jeton1 });
        if (this.jeton2) roots.push({ kind: "jeton2", root: this.jeton2 });
        if (this.jeton3) roots.push({ kind: "jeton3", root: this.jeton3 });
        if (!roots.length) return null;

        const hits = this.raycaster.intersectObjects(
            roots.map((r) => r.root),
            true
        );
        if (!hits.length) return null;

        let o = hits[0].object;
        while (o) {
            for (const r of roots) {
                if (o === r.root) return { kind: r.kind, hit: hits[0] };
            }
            o = o.parent;
        }
        return null;
    }

    hoverJetons(e) {
        this.pointerPos(e);

        if (!this.jeton1 && !this.jeton2 && this.jeton3) return;

        const interact = this.getInteractions();
        const hoverJeton1 = interact?.kind === "jeton1";
        const hoverJeton2 = interact?.kind === "jeton2";
        const hoverJeton3 = interact?.kind === "jeton3";

        if (this.jeton1 && this.jeton1BaseScale) {
            if (hoverJeton1 && !this.jeton1Hovered) {
                this.jeton1Hovered = true;
                gsap.killTweensOf(this.jeton1.scale);
                gsap.to(this.jeton1.scale, {
                    duration: 0.2,
                    x: this.jeton1BaseScale.x * 1.5,
                    y: this.jeton1BaseScale.y * 1.5,
                    z: this.jeton1BaseScale.z * 1.5,
                    ease: "power2.out",
                });
            }

            if (!hoverJeton1 && this.jeton1Hovered) {
                this.jeton1Hovered = false;
                gsap.killTweensOf(this.jeton1.scale);
                gsap.to(this.jeton1.scale, {
                    duration: 0.2,
                    x: this.jeton1BaseScale.x,
                    y: this.jeton1BaseScale.y,
                    z: this.jeton1BaseScale.z,
                    ease: "power2.out",
                });
            }
        }

        if (this.jeton2 && this.jeton2BaseScale) {
            if (hoverJeton2 && !this.jeton2Hovered) {
                this.jeton2Hovered = true;
                gsap.killTweensOf(this.jeton2.scale);
                gsap.to(this.jeton2.scale, {
                    duration: 0.2,
                    x: this.jeton2BaseScale.x * 1.5,
                    y: this.jeton2BaseScale.y * 1.5,
                    z: this.jeton2BaseScale.z * 1.5,
                    ease: "power2.out",
                });
            }

            if (!hoverJeton2 && this.jeton2Hovered) {
                this.jeton2Hovered = false;
                gsap.killTweensOf(this.jeton2.scale);
                gsap.to(this.jeton2.scale, {
                    duration: 0.2,
                    x: this.jeton2BaseScale.x,
                    y: this.jeton2BaseScale.y,
                    z: this.jeton2BaseScale.z,
                    ease: "power2.out",
                });
            }
        }

        if (this.jeton3 && this.jeton3BaseScale) {
            if (hoverJeton3 && !this.jeton3Hovered) {
                this.jeton3Hovered = true;
                gsap.killTweensOf(this.jeton3.scale);
                gsap.to(this.jeton3.scale, {
                    duration: 0.2,
                    x: this.jeton3BaseScale.x * 1.5,
                    y: this.jeton3BaseScale.y * 1.5,
                    z: this.jeton3BaseScale.z * 1.5,
                    ease: "power2.out",
                });
            }

            if (!hoverJeton3 && this.jeton3Hovered) {
                this.jeton3Hovered = false;
                gsap.killTweensOf(this.jeton3.scale);
                gsap.to(this.jeton3.scale, {
                    duration: 0.2,
                    x: this.jeton3BaseScale.x,
                    y: this.jeton3BaseScale.y,
                    z: this.jeton3BaseScale.z,
                    ease: "power2.out",
                });
            }
        }

        document.body.style.cursor = hoverJeton1 || hoverJeton2 || hoverJeton3 ? "pointer" : "";
    }

    countClues() {
        const count = document.querySelector('.clues__number--count');
        count.textContent = (parseInt(count.textContent) || 0) + 1;
    }

    canvaInteract(e) {
        this.pointerPos(e);

        const interact = this.getInteractions();
        if (!interact) return;

        if (interact.kind === 'jeton1') {
            this.switchCamera(this.cam2);
            document.querySelector('.progression-coin__1').classList.add('progression-coin__completed');
            this.countClues();
        }

        if (interact.kind === 'jeton2') {
            this.switchCamera(this.cam3);
            document.querySelector('.progression-coin__2').classList.add('progression-coin__completed');
            this.countClues();
        }

        if (interact.kind === 'jeton3') {
            this.switchCamera(this.cam1);
            document.querySelector('.progression-coin__3').classList.add('progression-coin__completed');
            this.countClues();
        }
    }

    switchCamera(targetCam) {
        gsap.to(this.camera.position, {
            duration: 1,
            x: targetCam.position.x,
            y: targetCam.position.y,
            z: targetCam.position.z,
            ease: "power2.inOut",
            onUpdate: () => this.render()
        });

        gsap.to(this.camera.quaternion, {
            duration: 1,
            x: targetCam.quaternion.x,
            y: targetCam.quaternion.y,
            z: targetCam.quaternion.z,
            w: targetCam.quaternion.w,
            ease: "power2.inOut",
            onUpdate: () => this.render()
        });
    }

    populate() {

        this.cam1 = models.interieur.scene.getObjectByName("Machine_Cam");
        this.cam2 = models.interieur.scene.getObjectByName("Cam_Antique_Cam");
        this.cam3 = models.interieur.scene.getObjectByName("Cam_1980_Cam");
        this.cam4 = models.interieur.scene.getObjectByName("Cam_futur_Cam");
        // this.scene.add(...models.exterieur.scene.children);
        this.scene.add(...models.interieur.scene.children);
        this.scene.add(...models.jetonAntique.scene.children);
        this.scene.add(...models.jeton80.scene.children);
        this.scene.add(...models.delorean.scene.children);
        this.scene.add(...models.timeMachine.scene.children);

        this.jeton1 = this.scene.getObjectByName('Jeton_SM005');
        this.jeton1BaseScale = this.jeton1.scale.clone();

        this.jeton2 = this.scene.getObjectByName('Jeton_SM004');
        this.jeton2BaseScale = this.jeton2.scale.clone();

        this.jeton3 = this.scene.getObjectByName('Jeton_SM003');
        this.jeton3BaseScale = this.jeton3.scale.clone();



        const model = models.interieur.scene;
        // model.rotation.z = THREE.MathUtils.degToRad(270);

        // Rajoute chaque animation stockée dans les modèles
        // pour les mettre dans notre objet "this.scene"
        for (const key in models) {
            for (const animation of models[key].animations) {
                this.scene.animations.push(animation);
            }
        }
        const ambientLight = new THREE.AmbientLight('white', 1);
        this.scene.add(ambientLight);

        for (const mesh of this.scene.children) {
            if (mesh.isMesh) {
                console.log(mesh);
                const meshMap = mesh.material.map;
                let emissive = false;

                if (mesh.name === "G0_fenetres") {
                    emissive = true;
                }

                let newMaterial = null;

                if (emissive) {
                    newMaterial = new THREE.MeshLambertMaterial({
                        map: meshMap,
                        emissive: 'yellow',
                        emissiveIntensity: .35,
                        emissiveMap: meshMap
                    });
                } else {
                    newMaterial = new THREE.MeshLambertMaterial({
                        map: meshMap,
                    });
                }

                // const newMaterial = new THREE.MeshLambertMaterial({
                //     map: meshMap,
                //     emissive: emissive ? 'gold' : null,
                //     emissiveIntensity: emissive ? .3 : null,
                //     emissiveMap: emissive ? meshMap : null

                //     // emivisseMap: emissive
                // });

                mesh.material = newMaterial;

            }
        }

        // console.log(this.scene.animations);

        // const ball = this.scene.getObjectByName( 'G0_DM_ball' );
        // const mixer = new THREE.AnimationMixer( ball );
        // const clip = THREE.AnimationClip.findByName( this.scene.animations, 'roulade' );
        // const action = mixer.clipAction( clip );
        // action.play();

        // Je donne accès au mixer dans mon objet viewer
        // this.mixer = mixer;

        window.requestAnimationFrame((timestamp) => {
            this.animate2(timestamp);
        });

        // Demander un rendu
        this.render();
    }

    removeGizmo() {
        this.scene.remove(this.gizmo);
        this.gizmo.dispose();
        this.gizmo = null;
        this.render();
    }

    addGizmo(size = 1) {
        this.gizmo = new THREE.AxesHelper(size);
        this.scene.add(this.gizmo);
        this.render();
    }

    render(scene = this.scene, camera = this.camera) {
        this.renderer.render(scene, camera);
    }

    setRenderer(options = {}) {
        this.renderer = new THREE.WebGLRenderer(options);

        // Crée notre caméra
        // PerspectiveCamera( fov, aspect-ratio, near, far )
        this.camera = new THREE.PerspectiveCamera(
            45,
            // On le calcule avec la taille du wrapper
            settings.sizes.w / settings.sizes.h,
            1,
            100
        );

        // Recule notre camera pour qu'on puisse voir le centre de la scene
        this.camera.position.x = 2;
        this.camera.position.y = 10;
        this.camera.position.z = 0;




        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.addEventListener('change', () => {
            if (this.spotLightHelper) {
                this.spotLightHelper.update();
            }
            this.render();
        });
        // this.controls.minDistance = 10
        // this.controls.maxDistance = 26
        // this.controls.minPolarAngle = Math.PI / 3;
        // this.controls.maxPolarAngle = Math.PI / 2;
        // this.controls.minAzimuthAngle = 1;
        // this.controls.maxAzimuthAngle = 2;

        // Crée notre scene et y rajoute notre camera
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.camera.lookAt(0, 10, 0)
        this.controls.target.set(0, 10, 0)

        // Change une première fois la taille de notre canvas
        this.resize();

        // Appele la fonction d'ajout d'éléments
        this.populate();
    }

    resize() {
        // Mettre à jour nos settings
        settings.sizes.w = settings.wrapper.clientWidth;
        settings.sizes.h = settings.wrapper.clientHeight;

        // Limite la densité de pixel à 2, pour éviter
        // des problèmes de performances sur des écrans
        // à plus haute densité de pixel.
        settings.sizes.dpr = Math.min(window.devicePixelRatio, 2);

        settings.canvas.style.aspectRatio = `${settings.sizes.w}/${settings.sizes.h}`;

        // Mettre à jour la camera
        this.camera.aspect = settings.sizes.w / settings.sizes.h;
        this.camera.updateProjectionMatrix();

        // Mettre à jour le moteur de rendu
        this.renderer.setSize(settings.sizes.w, settings.sizes.h);
        this.renderer.setPixelRatio(settings.sizes.dpr);

        this.render();
    }
}

const myViewer = new Viewer(threejsOptions);
// myViewer.addGizmo(2);

// Ajouter un event resize et appeler la fonction qui
// gère les changements de tailles
window.addEventListener("resize", () => {
    myViewer.resize();
});

window.addEventListener("keydown", (event) => {

    if (event.key === "F" || event.key === "f") {
        console.log(myViewer.camera.position.x, myViewer.camera.position.y, myViewer.camera.position.z)
    }
})