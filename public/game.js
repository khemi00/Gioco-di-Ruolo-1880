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
let currentMap;

function preload() {
    console.log("Preloading assets...");
    this.load.image('mapEurope', 'mapEurope.png');
    this.load.image('mapWorld', 'mapWorld.png');
}

function create() {
    console.log("Creating scene...");

    // Aggiungi l'immagine della mappa al centro della scena
    currentMap = this.add.image(0, 0, 'mapEurope').setOrigin(0, 0);

    // Ottieni le dimensioni della mappa
    updateMapBounds(currentMap);

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

    document.getElementById('registerButton').addEventListener('click', async () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                alert('Registration successful');
            } else {
                const message = await response.text();
                alert('Registration failed: ' + message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Registration failed');
        }
    });
    
    
    document.getElementById('loginButton').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('menuButton').style.display = 'block';
                alert('Login successful');
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Login failed');
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

    // Aggiungi logica per cambiare mappa
    document.getElementById('worldMapButton').addEventListener('click', () => {
        changeMap('mapWorld');
    });

    document.getElementById('europeMapButton').addEventListener('click', () => {
        changeMap('mapEurope');
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

function changeMap(mapKey) {
    console.log("Changing map to", mapKey);
    currentMap.setTexture(mapKey); // Cambia la texture dell'immagine esistente
    updateMapBounds(currentMap);
}

function updateMapBounds(map) {
    const mapWidth = map.width;
    const mapHeight = map.height;
    console.log("Map dimensions:", mapWidth, mapHeight);

    // Imposta le dimensioni del mondo per adattarsi alla mappa
    game.scene.scenes[0].cameras.main.setBounds(0, 0, mapWidth, mapHeight);
}
