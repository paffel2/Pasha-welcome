class AudioManager {
    constructor() {
        this.initialized = false;
        this.synth = new Tone.Synth().toDestination();
        this.errorSynth = new Tone.Synth({
            oscillator: {
                type: "square"
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.1,
                release: 0.1
            }
        }).toDestination();
        this.initialize();
    }

    async initialize() {
        await Tone.start();
        this.initialized = true;
    }

    playSlashSound() {
        if (!this.initialized) return;
        this.synth.triggerAttackRelease('C4', '0.1');
    }

    playHitSound() {
        if (!this.initialized) return;
        this.synth.triggerAttackRelease('E4', '0.1');
    }

    playErrorSound() {
        if (!this.initialized) return;
        this.errorSynth.triggerAttackRelease("C3", "8n");
        setTimeout(() => this.errorSynth.triggerAttackRelease("G2", "8n"), 100);
    }
}

const audioManager = new AudioManager();
