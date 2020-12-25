import 'regenerator-runtime/runtime'
import * as THREE from 'three';
import mql from '@microlink/mql';

window.addEventListener("DOMContentLoaded", app);

const previewCard = document.querySelector('#preview-card') as HTMLTemplateElement;

/*
{
  "title": "NexiGo 2020 Newest Playstation 4 PS4 Slim Console Holiday Bundle 1TB HDD PS4 Controller Charging Station 4K HDMI Cable Bundle 5FT",
  "description": "Buy NexiGo 2020 Newest Playstation 4 PS4 Slim Console Holiday Bundle 1TB HDD PS4 Controller Charging Station 4K HDMI Cable Bundle 5FT: HDMI Cables - Amazon.com ✓ FREE DELIVERY possible on eligible purchases",
  "lang": "en",
  "author": "Visit the NexiGo Store",
  "publisher": "Amazon",
  "image": {
    "url": "https://images-na.ssl-images-amazon.com/images/I/61c8O0GHRgL._AC_SL1500_.jpg",
    "type": "jpg",
    "size": 92263,
    "height": 1434,
    "width": 1500,
    "size_pretty": "92.3 kB"
  },
  "date": "2020-12-25T17:30:51.000Z",
  "url": "https://www.amazon.com/NexiGo-Playstation-Console-Controller-Charging/dp/B08QHG53MP",
  "logo": {
    "url": "https://logo.clearbit.com/amazon.com",
    "type": "png",
    "size": 3736,
    "height": 128,
    "width": 128,
    "size_pretty": "3.74 kB"
  }
}
*/

const generatePreview = async () => {
	const result = await getPreview();
	console.log(previewCard);
	const preview: any = previewCard.content.cloneNode(true);
	const title = preview.querySelector('.card__title');
	title.textContent = result.title;

	const subtitle = preview.querySelector('.card__subtitle');
	subtitle.textContent = result.description;

	const img = preview.querySelector('img') as HTMLImageElement;
	img.setAttribute('src', result.image.url);

	const link = preview.querySelector('a');
	link.setAttribute('href', result.url);

	document.body.appendChild(preview);
}


const getPreview = () => {
	const url = "https://www.amazon.com/gp/product/B08NYLMBJY?pf_rd_r=8S48ZTV3J6WCWB8JAYAF&pf_rd_p=9d9090dd-8b99-4ac3-b4a9-90a1db2ef53b&pd_rd_r=49966170-0d87-4575-99f1-4e00d2f68d1b&pd_rd_w=GHfc8&pd_rd_wg=0iARm&ref_=pd_gw_unk"
	let result;
	return (async () => {
		if (result === undefined) {
			let { data } = await mql(url);
			console.log(data)
			result = data
		}
		return result;
	})();
}

function app() {
	var scene,
		camera,
		renderer,
		present,
		raycaster = new THREE.Raycaster(),
		intersects,
		pointer = new THREE.Vector2();

	const init = () => {
		// setup
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(new THREE.Color(0xf98686));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;

		// present
		present = new Present(12, 7);
		scene.add(present.mesh);

		// ambient light
		let ambientLight = new THREE.AmbientLight(0xffffff);
		ambientLight.name = "Ambient Light";
		scene.add(ambientLight);

		// directional light
		let directionLight = new THREE.DirectionalLight(0xffffff, 0.7);
		directionLight.name = "Directional Light";
		directionLight.position.set(10, 20, 0);
		directionLight.castShadow = true;
		directionLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
		scene.add(directionLight);

		// camera
		camera.position.set(30, 30, 30);
		camera.lookAt(scene.position);

		// render
		document.body.appendChild(renderer.domElement);
		renderScene();
	};
	const renderScene = () => {
		if (present)
			present.openLoop();

		renderer.render(scene, camera);
		requestAnimationFrame(renderScene);
	};
	const adjustWindow = () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	};
	const updateRaycaster = e => {
		pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(pointer, camera);
		intersects = raycaster.intersectObjects(present.mesh.children, true);
		intersects = intersects.filter(
			child => child.object.type == "Mesh"
		);
	};
	const presentActive = e => {
		let kc = e.keyCode, // enter or space
			didInteract = intersects.length || kc == 13 || kc == 32;
		if (present && didInteract) {
			present.open();
		}
	};
	const presentHover = e => {
		updateRaycaster(e);
		renderer.domElement.style.cursor = intersects.length ? "pointer" : "default";
	};

	init();
	window.addEventListener("resize", adjustWindow);
	document.addEventListener("click", presentActive);
	window.addEventListener("keydown", presentActive);
	window.addEventListener("mousemove", presentHover, false);
}

class Present {
	private sideWidth: number;
	private divisions: number;
	private effectFadeSpeed = 0.02;
	private effectMoveSpeed = 0.8;
	private effectRotateSpeed = 0.1;
	private openSpeed = 4;
	private openTime = 0;
	private timeToOpen = 120;
	private opacity = 1;
	private opening: boolean;
	private opened: boolean;
	private wireframe: boolean;
	private pieces: any[];
	private materials: THREE.MeshStandardMaterial[];
	private mesh: THREE.Object3D;
	private bow: any;

	constructor(sideWidth = 7, divisions = 5) {
		this.sideWidth = sideWidth;
		this.divisions = divisions;

		this.opening = false;
		this.opened = false;
		this.wireframe = false;
		this.pieces = [];

		this.materials = [
			// wrapping
			new THREE.MeshStandardMaterial({
				color: 0x123a99,
				side: THREE.DoubleSide,
				transparent: true,
				wireframe: this.wireframe
			}),
			// ribbon
			new THREE.MeshStandardMaterial({
				color: 0xff1c54,
				side: THREE.DoubleSide,
				transparent: true,
				wireframe: this.wireframe
			}),
			// bow
			new THREE.MeshStandardMaterial({
				color: 0xff1c54,
				transparent: true,
				wireframe: this.wireframe
			})
		];
		this.mesh = new THREE.Object3D();
		this.mesh.name = "Present";

		let getTails = () => Math.random() < 0.5,
			randDecimal = (min, max) => Math.random() * (max - min) + min,
			S = this.sideWidth,
			HS = S / 2,
			fracS = S / divisions,
			fracHS = fracS / 2,
			HD = divisions / 2,

			pieceGeo = new THREE.PlaneBufferGeometry(fracS, fracS),

			wrappingMat = this.materials[0],
			wrappingPiece = new THREE.Mesh(pieceGeo, wrappingMat),

			ribbonMat = this.materials[1],
			ribbonPiece = new THREE.Mesh(pieceGeo, ribbonMat);

		wrappingPiece.receiveShadow = true;
		ribbonPiece.receiveShadow = true;

		for (let s = 0; s < 6; ++s) {
			// place sides
			let side = new THREE.Object3D();
			switch (s) {
				// bottom
				case 0:
					side.position.set(0, -HS, 0);
					side.rotation.x = Math.PI / 2;
					break;
				// back
				case 1:
					side.position.set(0, 0, -HS);
					side.rotation.y = Math.PI;
					break;
				// left
				case 2:
					side.position.set(-HS, 0, 0);
					side.rotation.y = -Math.PI / 2;
					break;
				// right
				case 3:
					side.position.set(HS, 0, 0);
					side.rotation.y = Math.PI / 2;
					break;
				// front
				case 4:
					side.position.set(0, 0, HS);
					break;
				// top
				default:
					side.position.set(0, HS, 0);
					side.rotation.x = -Math.PI / 2;
					break;
			}

			// assemble box
			for (let h = -HD; h < HD; ++h) {
				for (let w = -HD; w < HD; ++w) {
					let isMiddleX = w >= -1 && w <= 0;
					let isMiddleY = h >= -1 && h <= 0;
					let topOrBottom = s == 0 || s == 5;
					let onBow = isMiddleX || (isMiddleY && topOrBottom);
					let piece: any = onBow ? ribbonPiece.clone() : wrappingPiece.clone();

					piece.firstPosition = {
						x: fracS * w + fracHS,
						y: fracS * h + fracHS,
						z: 0
					};
					piece.position.set(piece.firstPosition.x, piece.firstPosition.y, 0);

					// adjust movements while adhereing to star–like direction
					piece.xMoveBias = randDecimal(0.3, 1);
					piece.yMoveBias = randDecimal(0.3, 1);
					piece.zMoveBias = randDecimal(0.3, 1);

					piece.xRotateDir = getTails() ? -1 : 1;
					piece.yRotateDir = getTails() ? -1 : 1;
					piece.zRotateDir = getTails() ? -1 : 1;

					side.add(piece);
					this.pieces.push(piece);
				}
			}
			this.mesh.add(side);
		}

		// add bow
		let bowRad = this.divisions % 2 == 0 ? 4 : 3,
			bowGeo = new THREE.DodecahedronBufferGeometry(bowRad),
			bowMat = this.materials[2];

		this.bow = new THREE.Mesh(bowGeo, bowMat);
		this.bow.castShadow = true;

		this.bow.firstPosition = {
			y: HS + bowRad / 4
		};
		this.bow.position.set(0, this.bow.firstPosition.y, 0);

		this.bow.xMoveDir = Math.random() * this.effectMoveSpeed * (getTails() ? -1 : 1);
		this.bow.yMoveDir = 1;
		this.bow.zMoveDir = Math.random() * this.effectMoveSpeed * (getTails() ? -1 : 1);

		this.bow.xRotateDir = getTails() ? -1 : 1;
		this.bow.yRotateDir = getTails() ? -1 : 1;
		this.bow.zRotateDir = getTails() ? -1 : 1;

		this.bow.scale.y = 0.5;
		this.mesh.add(this.bow);
	}
	open() {
		if (!this.opening && !this.opened) {
			this.opening = true;
		}
	}

	async openLoop() {

		if (this.opening) {
			const sineCurve = n => 0.03 * Math.sin(8 * Math.PI * n / 100);
			const scaleBy = 1 - sineCurve(this.openTime);

			this.mesh.scale.x = scaleBy;
			this.mesh.scale.y = scaleBy;
			this.mesh.scale.z = scaleBy;

			this.openTime += this.openSpeed;
			if (this.openTime >= this.timeToOpen) {
				this.openTime = 0;
				this.opening = false;
				this.opened = true;
			}

		} else if (this.opened) {
			let moveSpeed = this.effectMoveSpeed,
				rotateSpeed = this.effectRotateSpeed,
				divs = this.divisions;

			// pieces
			if (this.opacity > 0) {
				this.opacity -= this.effectFadeSpeed;

				this.pieces.forEach((e, i) => {
					let angleXZ = -45 + (90 * (i % divs) / (divs - 1)),
						angleY = -45 + (90 / (divs - 1) * Math.floor((i % divs ** 2) / divs));

					e.position.x += moveSpeed * Math.sin(angleXZ * Math.PI / 180) * e.xMoveBias;
					e.position.y += moveSpeed * Math.sin(angleY * Math.PI / 180) * e.yMoveBias;
					e.position.z += moveSpeed * Math.cos(angleXZ * Math.PI / 180) * e.zMoveBias;

					e.rotation.x += rotateSpeed * e.xRotateDir;
					e.rotation.y += rotateSpeed * e.yRotateDir;
					e.rotation.z += rotateSpeed * e.zRotateDir;
				});

				// bow
				this.bow.position.x += moveSpeed * this.bow.xMoveDir;
				this.bow.position.y += moveSpeed * this.bow.yMoveDir;
				this.bow.position.z += moveSpeed * this.bow.xMoveDir;

				this.bow.rotation.x += rotateSpeed * this.bow.xRotateDir;
				this.bow.rotation.y += rotateSpeed * this.bow.yRotateDir;
				this.bow.rotation.z += rotateSpeed * this.bow.zRotateDir;

			} else {
				this.opacity = 0;
				this.restore();
			}

			this.materials.forEach(e => {
				e.opacity = this.opacity;
			});
		}
	}

	restore() {
		this.opened = false;
		this.opacity = 0;

		generatePreview();



		// // pieces
		// this.pieces.forEach(e => {
		// 	e.position.set(e.firstPosition.x, e.firstPosition.y, e.firstPosition.z);
		// 	e.rotation.set(0, 0, 0);
		// });
		// // bow
		// this.bow.position.set(0, this.bow.firstPosition.y, 0);
		// this.bow.rotation.set(0, 0, 0);
	}
}
