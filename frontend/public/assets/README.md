# 🎵 Assets Folder

This folder should contain all game assets including images, sounds, and card graphics.

## Required Sound Files

Place the following MP3 files in the `sounds/` directory:

### Sound Effects
- `card-flip.mp3` - Card flipping sound
- `card-shuffle.mp3` - Card shuffling sound
- `chip-place.mp3` - Chip placement sound
- `button-click.mp3` - Button click sound
- `win.mp3` - Victory celebration sound
- `lose.mp3` - Loss sound
- `casino-ambient.mp3` - Background casino ambiance (optional)

### Music Files (Tunisian Songs)
- `tunisian-song-1.mp3` - First playlist song
- `tunisian-song-2.mp3` - Second playlist song

## Where to Get Sound Effects

### Free Sound Libraries:
1. **Freesound.org** - https://freesound.org
   - Search for: "card flip", "casino chips", "win", etc.
   - Requires free account
   - Choose sounds with Creative Commons license

2. **Zapsplat** - https://www.zapsplat.com
   - Free for personal and commercial use
   - High-quality sound effects
   - No attribution required

3. **Mixkit** - https://mixkit.co/free-sound-effects/
   - Completely free
   - No attribution required
   - Casino and game sounds

## How to Convert YouTube to MP3 (for Tunisian songs)

**IMPORTANT:** Only download music you have the rights to use!

1. **YouTube to MP3 Converters:**
   - https://ytmp3.cc
   - https://www.y2mate.com
   - Paste YouTube URL, download as MP3

2. **Legal Alternatives:**
   - Purchase from iTunes/Amazon Music
   - Use royalty-free music from:
     - YouTube Audio Library
     - Incompetech
     - Free Music Archive

## File Specifications

- **Format:** MP3
- **Bit Rate:** 128-320 kbps
- **Sample Rate:** 44.1 kHz
- **File Size:** Keep under 5MB per file for faster loading

## Fallback Behavior

If sound files are missing:
- The game will still work
- Console will show "Could not play sound" messages
- No audio will play
- Game functionality is not affected

## Testing Sounds

After adding sound files, test them in the game:
1. Start the game
2. Open browser console (F12)
3. Look for any audio errors
4. Test each sound in-game:
   - Click buttons → button click sound
   - Play a game → card sounds
   - Win/lose → victory/loss sounds

## Optional: Background Video

For the lobby background video:
- File: `casino-bg.mp4`
- Resolution: 1920x1080
- Duration: 10-30 seconds (will loop)
- Format: MP4 (H.264)
- Keep under 10MB

Free casino background videos:
- Pexels.com
- Pixabay.com
- Videezy.com

---

**Note:** The game includes placeholder paths for all sounds. Adding actual audio files is optional but greatly enhances the experience!
