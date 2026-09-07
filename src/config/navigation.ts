type ChildItem = {
	label: string;
	href: string;
	description: string;
};

type NavItem = {
	label: string;
	href?: string;
	children?: ChildItem[];
	external?: boolean;
};

export const navigation: NavItem[] = [
	{ label: 'Home', href: '/' },
	{
		label: 'New Here',
		children: [
			{
				label: 'Start Here',
				href: '/new-here/',
				description: 'A welcome and a simple place to begin.',
			},
			{
				label: 'What Sundays Are Like',
				href: '/what-sundays-are-like/',
				description: 'What to expect when we gather.',
			},
		],
	},
	{
		label: 'Who We Are',
		children: [
			{ label: 'Our Story', href: '/our-story/', description: 'How The Table came to be.' },
			{
				label: 'Our Vision & Values',
				href: '/our-vision/',
				description: 'The convictions that shape our life together.',
			},
			{ label: 'Our Leadership', href: '/leadership/', description: 'Meet the people who serve our church.' },
		],
	},
	{
		label: 'Sundays',
		children: [
			{
				label: 'Time & Location',
				href: '/service-times-locations/',
				description: 'When we meet and how to find us.',
			},
			{ label: 'Message Series', href: '/series/', description: 'Listen to recent teaching from The Table.' },
		],
	},
	{
		label: 'Join In',
		children: [
			{
				label: 'Welcome to the Table Class',
				href: '/welcome-to-the-table-class/',
				description: 'Learn more and take a next step in our community.',
			},
			{ label: 'MeetUps', href: '/meetups/', description: 'Find people and rhythms beyond Sunday.' },
			{ label: 'Kids & Youth', href: '/kids-youth/', description: 'A place for children and students to belong.' },
			{ label: 'Community Meals', href: '/community-meal/', description: 'Share a table with our wider community.' },
			{ label: 'Get Involved', href: '/get-involved/', description: 'Take a next step in the life of the church.' },
		],
	},
	{
		label: 'Connect',
		children: [
			{
				label: 'Newsletter',
				href: '/sign-up-for-our-newsletter/',
				description: 'Get church news and upcoming dates by email.',
			},
			{ label: 'Contact Us', href: '/contact-us/', description: 'Ask a question or start a conversation.' },
			{ label: 'Merch', href: '/merch/', description: 'Wear and share The Table.' },
		],
	},
	{ label: 'Giving', href: '/giving/' },
];

