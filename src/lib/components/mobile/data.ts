/**
 * Deterministic mock data for the "Pulse" mobile showcase (music, podcasts and listening notes).
 * Everything is static so SSR and hydration render the same markup.
 */

/** Seeded picsum photo: the same seed always returns the same image. */
export function photo(seed: string | number, width = 600, height = 400) {
	return `https://picsum.photos/seed/pulse-${seed}/${width}/${height}`;
}

export type MediaKind = 'music' | 'podcast' | 'audiobook';

export interface Track {
	id: string;
	title: string;
	artist: string;
	kind: MediaKind;
	/** Length in seconds. */
	duration: number;
	image: string;
}

export interface FeaturedItem {
	id: string;
	title: string;
	subtitle: string;
	image: string;
	track: Track;
}

export interface ContinueItem {
	id: string;
	track: Track;
	/** Listened fraction 0..1. */
	progress: number;
	note: string;
	downloaded: boolean;
}

export interface LibraryItem {
	id: string;
	title: string;
	subtitle: string;
	image: string;
	downloaded: boolean;
	liked: boolean;
	/** Added order, newest first = highest. */
	added: number;
}

export const user = {
	name: 'Alex Rivera',
	firstName: 'Alex',
	initials: 'AR',
	email: 'alex@pulse.fm',
	plan: 'Premium',
	avatar: photo('alex-avatar', 160, 160),
	stats: { following: 128, followers: 2_431, notes: 86 }
} as const;

const t = (
	id: string,
	title: string,
	artist: string,
	kind: MediaKind,
	duration: number,
	seed = id
): Track => ({ id, title, artist, kind, duration, image: photo(seed, 300, 300) });

export const tracks = {
	tides: t('tides', 'Tides of Glass', 'Mira Okafor', 'music', 214),
	signal: t('signal', 'Signal & Noise · Ep. 112', 'The Long Wave', 'podcast', 2_874),
	orbit: t('orbit', 'Slow Orbit', 'Northbound', 'music', 187),
	kiln: t('kiln', 'The Kiln Diaries · Ch. 7', 'Read by Hana Ito', 'audiobook', 1_960),
	neon: t('neon', 'Neon Harbour', 'Lumen Club', 'music', 242),
	field: t('field', 'Field Notes · Ep. 48', 'Outdoor Radio', 'podcast', 2_215),
	paper: t('paper', 'Paper Lanterns', 'Ivo & the Wires', 'music', 199),
	cosmos: t('cosmos', 'Small Cosmos · Ep. 9', 'Night Science', 'podcast', 3_120)
} satisfies Record<string, Track>;

export const featured: FeaturedItem[] = [
	{ id: 'f1', title: 'Morning Focus', subtitle: 'Mix · 42 tracks', image: photo('focus'), track: tracks.orbit },
	{ id: 'f2', title: 'Signal & Noise', subtitle: 'New episode', image: photo('signal-wide'), track: tracks.signal },
	{ id: 'f3', title: 'Neon Nights', subtitle: 'Playlist · 3 h', image: photo('neon-wide'), track: tracks.neon },
	{ id: 'f4', title: 'Field Notes', subtitle: 'Podcast · weekly', image: photo('field-wide'), track: tracks.field },
	{ id: 'f5', title: 'Tides of Glass', subtitle: 'Album · Mira Okafor', image: photo('tides-wide'), track: tracks.tides },
	{ id: 'f6', title: 'Small Cosmos', subtitle: 'Science · 9 episodes', image: photo('cosmos-wide'), track: tracks.cosmos }
];

export const continueListening: ContinueItem[] = [
	{ id: 'c1', track: tracks.signal, progress: 0.62, note: '18 min left', downloaded: true },
	{ id: 'c2', track: tracks.kiln, progress: 0.35, note: 'Chapter 7 of 22', downloaded: false },
	{ id: 'c3', track: tracks.tides, progress: 0.8, note: 'Album · 4 of 11', downloaded: true },
	{ id: 'c4', track: tracks.field, progress: 0.12, note: '33 min left', downloaded: false },
	{ id: 'c5', track: tracks.paper, progress: 0.5, note: 'Single · 1:40 left', downloaded: true }
];

export const homeFilters = [
	{ id: 'all', label: 'All', icon: undefined },
	{ id: 'music', label: 'Music', icon: 'music_note' },
	{ id: 'podcast', label: 'Podcasts', icon: 'podcasts' },
	{ id: 'audiobook', label: 'Audiobooks', icon: 'auto_stories' },
	{ id: 'downloaded', label: 'Downloaded', icon: 'download_done' }
] as const;

export type HomeFilter = (typeof homeFilters)[number]['id'];

const item = (
	id: string,
	title: string,
	subtitle: string,
	added: number,
	downloaded = false,
	liked = false
): LibraryItem => ({ id, title, subtitle, image: photo(`lib-${id}`, 400, 400), downloaded, liked, added });

export const library: Record<'songs' | 'albums' | 'podcasts', LibraryItem[]> = {
	songs: [
		item('s1', 'Tides of Glass', 'Mira Okafor', 12, true, true),
		item('s2', 'Slow Orbit', 'Northbound', 11, false, true),
		item('s3', 'Neon Harbour', 'Lumen Club', 10, true),
		item('s4', 'Paper Lanterns', 'Ivo & the Wires', 9),
		item('s5', 'Afterglow Avenue', 'Sola Grey', 8, true),
		item('s6', 'Copper Rain', 'The Meridians', 7, false, true),
		item('s7', 'Static Bloom', 'Kai Nakamura', 6),
		item('s8', 'Velvet Static', 'Mira Okafor', 5, true),
		item('s9', 'Lowlight', 'Northbound', 4),
		item('s10', 'Glass Houses', 'Ivo & the Wires', 3, false, true)
	],
	albums: [
		item('a1', 'Tides', 'Mira Okafor · 2025', 8, true, true),
		item('a2', 'Northbound II', 'Northbound · 2024', 7),
		item('a3', 'Lumen', 'Lumen Club · 2025', 6, true),
		item('a4', 'Wires & Lanterns', 'Ivo & the Wires · 2023', 5, false, true),
		item('a5', 'Grey Skies', 'Sola Grey · 2024', 4),
		item('a6', 'Meridian', 'The Meridians · 2022', 3, true),
		item('a7', 'Bloom', 'Kai Nakamura · 2025', 2),
		item('a8', 'Lowlight EP', 'Northbound · 2021', 1)
	],
	podcasts: [
		item('p1', 'Signal & Noise', 'The Long Wave · 112 eps', 6, true, true),
		item('p2', 'Field Notes', 'Outdoor Radio · 48 eps', 5),
		item('p3', 'Small Cosmos', 'Night Science · 9 eps', 4, false, true),
		item('p4', 'Design Matters Daily', 'Studio Nine · 301 eps', 3, true),
		item('p5', 'The Kiln Diaries', 'Hana Ito · audiobook', 2),
		item('p6', 'Late Shift', 'City Sound · 77 eps', 1)
	]
};

export const searchRecent = ['Mira Okafor', 'lo-fi focus', 'Signal & Noise'];

export const searchSuggestions = [
	{ value: 'Tides of Glass', supportingText: 'Song · Mira Okafor', icon: 'music_note' },
	{ value: 'Signal & Noise', supportingText: 'Podcast · The Long Wave', icon: 'podcasts' },
	{ value: 'Neon Nights', supportingText: 'Playlist · 3 h', icon: 'queue_music' },
	{ value: 'Northbound', supportingText: 'Artist · 1.2M listeners', icon: 'person' },
	{ value: 'Small Cosmos', supportingText: 'Podcast · Night Science', icon: 'podcasts' },
	{ value: 'The Kiln Diaries', supportingText: 'Audiobook · Hana Ito', icon: 'auto_stories' }
];

export const noteCategories = [
	{ value: 'idea', label: 'Idea', icon: 'lightbulb' },
	{ value: 'review', label: 'Album review', icon: 'rate_review' },
	{ value: 'lyrics', label: 'Lyrics', icon: 'lyrics' },
	{ value: 'setlist', label: 'Setlist', icon: 'queue_music' },
	{ value: 'episode', label: 'Episode notes', icon: 'podcasts' }
];

export const attachmentOptions = [
	{ id: 'track', icon: 'music_note', headline: 'Link a track', supportingText: 'From your library' },
	{ id: 'voice', icon: 'mic', headline: 'Voice memo', supportingText: 'Record up to 5 minutes' },
	{ id: 'photo', icon: 'photo_camera', headline: 'Photo', supportingText: 'Camera or gallery' },
	{ id: 'timestamp', icon: 'timer', headline: 'Timestamp', supportingText: 'Current playback position' },
	{ id: 'file', icon: 'attach_file', headline: 'File', supportingText: 'PDF, image or audio' }
] as const;

export const seedColors = [
	{ hex: '#6750A4', name: 'Violet' },
	{ hex: '#0B57D0', name: 'Blue' },
	{ hex: '#006A6A', name: 'Teal' },
	{ hex: '#B3261E', name: 'Red' },
	{ hex: '#7D5260', name: 'Mauve' },
	{ hex: '#386A20', name: 'Green' },
	{ hex: '#8B5000', name: 'Amber' },
	{ hex: '#5B5B5B', name: 'Grey' }
];

/** The four top-level destinations of the navigation bar. */
export const destinations = [
	{ id: 'home', href: '/mobile', label: 'Home', icon: 'home', badge: undefined },
	{ id: 'library', href: '/mobile/library', label: 'Library', icon: 'library_music', badge: 3 },
	{ id: 'compose', href: '/mobile/compose', label: 'Create', icon: 'edit_note', badge: undefined },
	{ id: 'settings', href: '/mobile/settings', label: 'Profile', icon: 'account_circle', badge: undefined }
] as const;

export const drawerPlaylists = [
	{ id: 'pl-focus', label: 'Morning Focus', icon: 'wb_twilight' },
	{ id: 'pl-run', label: 'Long Run', icon: 'directions_run' },
	{ id: 'pl-chill', label: 'Late Night', icon: 'bedtime' }
];

export function formatDuration(seconds: number) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}
