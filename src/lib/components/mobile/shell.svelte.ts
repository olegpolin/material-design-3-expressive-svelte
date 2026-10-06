import { createContext } from 'svelte';
import { tracks, type Track } from './data.js';

/**
 * State shared by the Pulse mobile shell (`src/routes/mobile/+layout.svelte`) and its screens:
 * the modal navigation drawer and the mini player.
 */
export class MobileShell {
	drawerOpen = $state(false);
	track = $state<Track>(tracks.signal);
	playing = $state(false);
	/** Playback position as a fraction 0..1 of the current track. */
	position = $state(0.38);
	/** Settings › Brightness (percent); dims the phone screen below 100. */
	brightness = $state(100);

	play(track: Track) {
		if (track.id !== this.track.id) {
			this.track = track;
			this.position = 0;
		}
		this.playing = true;
	}

	/** Advance the position by `seconds` of playback (wraps to the start at the end). */
	tick(seconds: number) {
		const next = this.position + seconds / this.track.duration;
		this.position = next >= 1 ? 0 : next;
	}
}

export const [getMobileShell, setMobileShell] = createContext<MobileShell>();
