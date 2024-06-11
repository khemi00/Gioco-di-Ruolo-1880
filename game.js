const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    }
};

const game = new Phaser.Game(config);

function preload() {
    console.log("Preloading assets...");
    this.load.image('mapEurope', 'assets/mapEurope.png');
    this.load.image('mapWorld', 'assets/mapWorld.png'); // Carica l'immagine della mappa
}

function create() {
    console.log("Creating scene...");

    // Aggiungi l'immagine della mappa al centro della scena
    const map = this.add.image(0, 0, 'map').setOrigin(0, 0);

    // Ottieni le dimensioni della mappa
    const mapWidth = map.width;
    const mapHeight = map.height;
    console.log("Map dimensions:", mapWidth, mapHeight);

    // Imposta le dimensioni del mondo per adattarsi alla mappa
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Abilita lo scorrimento della telecamera con i tasti freccia
    this.cursors = this.input.keyboard.createCursorKeys();

    // Imposta lo zoom iniziale della telecamera (Modifica qui per esperimenti)
    this.cameras.main.setZoom(0.25);

    // Variabili per il trascinamento con il mouse
    this.isDragging = false;
    this.dragStart = new Phaser.Math.Vector2();

    // Abilita il trascinamento con il mouse
    this.input.on('pointerdown', (pointer) => {
        if (pointer.x < this.scale.width - 300) { // Ignora l'area del menù
            console.log("Pointer down at", pointer.x, pointer.y);
            this.isDragging = true;
            this.dragStart.set(pointer.x, pointer.y);
        }
    });

    this.input.on('pointerup', () => {
        console.log("Pointer up");
        this.isDragging = false;
    });

    this.input.on('pointermove', (pointer) => {
        if (this.isDragging) {
            const dragEnd = new Phaser.Math.Vector2(pointer.x, pointer.y);
            const dragDistance = this.dragStart.subtract(dragEnd);
            console.log("Dragging", dragDistance);

            this.cameras.main.scrollX += dragDistance.x / this.cameras.main.zoom;
            this.cameras.main.scrollY += dragDistance.y / this.cameras.main.zoom;

            this.dragStart.set(pointer.x, pointer.y);
        }
    });

    // Abilita lo zoom con la rotella del mouse
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        if (pointer.x < this.scale.width - 300) { // Ignora l'area del menù
            console.log("Mouse wheel delta", deltaY);
            let newZoom = this.cameras.main.zoom - deltaY * 0.01; // Ridotta sensibilità dello zoom
            newZoom = Phaser.Math.Clamp(newZoom, 0.2, 10); // Limiti dello zoom (Min: 0.5, Max: 2)
            console.log("New zoom level", newZoom);
            this.cameras.main.setZoom(newZoom);
        }
    });

    // Gestisci il pulsante del menù
    document.getElementById('menuButton').addEventListener('click', () => {
        const menu = document.getElementById('menu');
        if (menu.style.display === 'none') {
            menu.style.display = 'flex';
            document.getElementById('menuButton').textContent = 'X';
        } else {
            menu.style.display = 'none';
            document.getElementById('menuButton').textContent = '☰';
        }
    });
}

function update() {
    const speed = 5;

    if (this.cursors.left.isDown) {
        this.cameras.main.scrollX -= speed;
    }
    if (this.cursors.right.isDown) {
        this.cameras.main.scrollX += speed;
    }
    if (this.cursors.up.isDown) {
        this.cameras.main.scrollY -= speed;
    }
    if (this.cursors.down.isDown) {
        this.cameras.main.scrollY += speed;
    }
}
