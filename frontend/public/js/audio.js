// Audio Manager

class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicPlaying = false;
        this.currentSongIndex = 0;
        this.volume = 0.5;
        
        // Tunisian music playlist
        this.playlist = [
            {
                title: 'Tunisian Vibes 1',
                url: 'assets/sounds/tunisian-song-1.mp3' // We'll use placeholder paths
            },
            {
                title: 'Tunisian Vibes 2',
                url: 'assets/sounds/tunisian-song-2.mp3'
            }
        ];

        this.initializeEventListeners();
        this.loadSounds();
    }

    initializeEventListeners() {
        // Music toggle
        document.getElementById('music-toggle')?.addEventListener('click', () => {
            this.toggleMusicControls();
        });

        // Play/Pause
        document.getElementById('play-pause')?.addEventListener('click', () => {
            this.toggleMusic();
        });

        // Previous song
        document.getElementById('prev-song')?.addEventListener('click', () => {
            this.previousSong();
        });

        // Next song
        document.getElementById('next-song')?.addEventListener('click', () => {
            this.nextSong();
        });

        // Volume control
        document.getElementById('volume-slider')?.addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });
    }

    loadSounds() {
        // Note: Using Howler.js if available, otherwise using Web Audio API
        if (typeof Howl !== 'undefined') {
            this.loadWithHowler();
        } else {
            this.loadWithWebAudio();
        }
    }

    loadWithHowler() {
        // Sound effects
        this.sounds.cardFlip = new Howl({
            src: ['assets/sounds/card-flip.mp3'],
            volume: 0.3
        });

        this.sounds.cardShuffle = new Howl({
            src: ['assets/sounds/card-shuffle.mp3'],
            volume: 0.4
        });

        this.sounds.chipPlace = new Howl({
            src: ['assets/sounds/chip-place.mp3'],
            volume: 0.3
        });

        this.sounds.buttonClick = new Howl({
            src: ['assets/sounds/button-click.mp3'],
            volume: 0.2
        });

        this.sounds.win = new Howl({
            src: ['assets/sounds/win.mp3'],
            volume: 0.5
        });

        this.sounds.lose = new Howl({
            src: ['assets/sounds/lose.mp3'],
            volume: 0.4
        });

        this.sounds.ambient = new Howl({
            src: ['assets/sounds/casino-ambient.mp3'],
            volume: 0.1,
            loop: true
        });

        // Background music
        if (this.playlist.length > 0) {
            this.music = new Howl({
                src: [this.playlist[0].url],
                volume: this.volume,
                onend: () => {
                    this.nextSong();
                }
            });
        }
    }

    loadWithWebAudio() {
        // Fallback to basic audio elements
        console.log('Using Web Audio API fallback');
        
        // Create simple sound functions
        this.sounds.cardFlip = { play: () => this.playBasicSound('card-flip') };
        this.sounds.cardShuffle = { play: () => this.playBasicSound('card-shuffle') };
        this.sounds.chipPlace = { play: () => this.playBasicSound('chip-place') };
        this.sounds.buttonClick = { play: () => this.playBasicSound('button-click') };
        this.sounds.win = { play: () => this.playBasicSound('win') };
        this.sounds.lose = { play: () => this.playBasicSound('lose') };
        this.sounds.ambient = { play: () => {} }; // Skip ambient for fallback
    }

    playBasicSound(soundName) {
        const audio = new Audio(`assets/sounds/${soundName}.mp3`);
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            try {
                this.sounds[soundName].play();
            } catch (error) {
                console.log('Could not play sound:', soundName);
            }
        }
    }

    toggleMusicControls() {
        const controls = document.getElementById('music-controls');
        controls.classList.toggle('active');
    }

    toggleMusic() {
        if (this.musicPlaying) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }

    playMusic() {
        if (this.music) {
            this.music.play();
            this.musicPlaying = true;
            document.getElementById('play-pause').textContent = '⏸️';
        }
    }

    pauseMusic() {
        if (this.music) {
            this.music.pause();
            this.musicPlaying = false;
            document.getElementById('play-pause').textContent = '▶️';
        }
    }

    nextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.loadSong(this.currentSongIndex);
    }

    previousSong() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadSong(this.currentSongIndex);
    }

    loadSong(index) {
        const wasPlaying = this.musicPlaying;
        
        if (this.music) {
            this.music.stop();
        }

        const song = this.playlist[index];
        
        if (typeof Howl !== 'undefined') {
            this.music = new Howl({
                src: [song.url],
                volume: this.volume,
                onend: () => {
                    this.nextSong();
                }
            });
        }

        document.getElementById('current-song').textContent = song.title;

        if (wasPlaying) {
            this.playMusic();
        }
    }

    setVolume(volume) {
        this.volume = volume;
        
        if (this.music) {
            this.music.volume(volume);
        }

        // Update all sound effects
        Object.values(this.sounds).forEach(sound => {
            if (sound && sound.volume) {
                sound.volume(volume * 0.5); // Sound effects at 50% of music volume
            }
        });
    }

    playAmbient() {
        if (this.sounds.ambient) {
            this.sounds.ambient.play();
        }
    }

    stopAmbient() {
        if (this.sounds.ambient && this.sounds.ambient.stop) {
            this.sounds.ambient.stop();
        }
    }
}

// Initialize audio manager
const audioManager = new AudioManager();
window.audioManager = audioManager;
