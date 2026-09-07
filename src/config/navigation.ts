type ChildItem = {
	label: string;
	href: string;
};

type NavItem = {
	label: string;
	href?: string;
	children?: ChildItem[];
	external?: boolean;
};

export const navigation: NavItem[] = [
	{ label: 'New Here?', href: '/new-here/' },
	{
		label: 'Who We Are',
		children: [
			{ label: 'Our Story', href: '/our-story/' },
			{ label: 'Our Vision & Values', href: '/our-vision/' },
			{ label: 'Our Leadership', href: '/leadership/' },
		],
	},
	{
		label: 'Service',
		children: [
			{ label: 'Service Time & Location', href: '/service-times-locations/' },
			{ label: 'Message Series', href: '/series/' },
		],
	},
	{
		label: 'Join In!',
		children: [
			{ label: 'MeetUps', href: '/meetups/' },
			{ label: 'Kids & Youth', href: '/kids-youth/' },
			{ label: 'Community Meals', href: '/community-meal/' },
			{ label: 'Get Involved', href: '/get-involved/' },
		],
	},
	{
				label: 'Giving',
		href: 'https://thetabletx.churchcenter.com/giving?open-in-church-center-modal=true',
		external: true,
	},
	{ label: 'Merch', href: '/merch/' },
	{
		label: 'Connect With Us',
		children: [
			{ label: 'Sign Up for Our Newsletter', href: '/sign-up-for-our-newsletter/' },
			{ label: 'Contact Us', href: '/contact-us/' },
		],
	},
	{ label: 'Get Involved', href: '/get-involved/' },
];

