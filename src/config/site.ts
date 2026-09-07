import { canonicalOrigin } from './domains.mjs';

// Shared site information. Edit page-specific copy in src/pages.
export const site = {
	"title": "The Table Church",
	"tagline": "A church community in Sachse, Texas.",
	"description": "An LGBTQ-affirming church committed to embodying a welcoming, inclusive, and beautiful expression of Christian faith.",
	"url": canonicalOrigin,
	"addressLines": [
		"1520 Blackburn Rd",
		"Sachse, TX 75048",
		"phone (469) 222-3617"
	],
	"serviceTime": "Sundays at 5:00 pm",
	// Church Center giving. The `open-in-church-center-modal` parameter is what
	// js.churchcenter.com/modal/v1 hooks; without the script the link still works
	// as a plain navigation to Church Center.
	"givingUrl": "https://thetabletx.churchcenter.com/giving?open-in-church-center-modal=true",
	"mapEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3346.860920011535!2d-96.61174262371553!3d32.98107097352899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c0336e0c2f96f%3A0xccaa810b6cf3a509!2sThe%20Table!5e0!3m2!1sen!2sus!4v1711477001971!5m2!1sen!2sus",
	"podcastLinks": [
		{
			"label": "Spotify",
			"url": "https://open.spotify.com/show/0Q36Z4OhAvsfDLUel3PtCL/"
		},
		{
			"label": "Apple Podcasts",
			"url": "https://podcasts.apple.com/us/podcast/the-table-tx/id1489269613"
		},
		{
			"label": "Anchor FM",
			"url": "https://anchor.fm/thetabletx/"
		},
		{
			"label": "Google Podcasts",
			"url": "https://podcasts.google.com/feed/aHR0cHM6Ly9hbmNob3IuZm0vcy8xMDY3YzI0OC9wb2RjYXN0L3Jzcw"
		}
	],
	"socialLinks": [
		{
			"label": "Facebook",
			"url": "https://www.facebook.com/TheTableTX/"
		},
		{
			"label": "Twitter",
			"url": "https://twitter.com/bretttilford"
		},
		{
			"label": "Instagram",
			"url": "https://www.instagram.com/tablechurchtx/"
		},
		{
			"label": "YouTube",
			"url": "https://www.youtube.com/@thetabletx7926"
		}
	],
	"vision": "We exist to shift a generation from reactionary to visionary through the person and work of Jesus."
};
